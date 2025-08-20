/**
 * File optimization utilities for document uploads
 * Provides image compression, file size optimization, and caching functionality
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "jpeg" | "webp" | "png";
  maxFileSize?: number; // in bytes
}

export interface OptimizationResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  wasCompressed: boolean;
  format: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface CacheEntry {
  data: string; // base64
  timestamp: number;
  size: number;
  hash: string;
}

class FileOptimizationService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;

  /**
   * Compresses an image file if it's larger than the specified size
   * @param file - The image file to compress
   * @param options - Compression options
   * @returns Promise with optimization result
   */
  public async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<OptimizationResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = "jpeg",
      maxFileSize = 2 * 1024 * 1024, // 2MB
    } = options;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        wasCompressed: false,
        format: file.type,
      };
    }

    // If file is already small enough, return as-is
    if (file.size <= maxFileSize) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        wasCompressed: false,
        format: file.type,
      };
    }

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            // Calculate new dimensions while maintaining aspect ratio
            const { width: newWidth, height: newHeight } =
              this.calculateOptimalDimensions(
                img.width,
                img.height,
                maxWidth,
                maxHeight
              );

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw and compress the image
            ctx?.drawImage(img, 0, 0, newWidth, newHeight);

            // Try different quality levels to achieve target file size
            let currentQuality = quality;
            let attempts = 0;
            const maxAttempts = 5;

            const tryCompress = () => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error("Failed to compress image"));
                    return;
                  }

                  // If we achieved the target size or tried enough times, use this result
                  if (blob.size <= maxFileSize || attempts >= maxAttempts) {
                    const compressedFile = new File([blob], file.name, {
                      type: `image/${format}`,
                      lastModified: Date.now(),
                    });

                    resolve({
                      file: compressedFile,
                      originalSize: file.size,
                      compressedSize: blob.size,
                      compressionRatio: file.size / blob.size,
                      wasCompressed: true,
                      format: `image/${format}`,
                      dimensions: {
                        width: newWidth,
                        height: newHeight,
                      },
                    });
                  } else {
                    // Try with lower quality
                    attempts++;
                    currentQuality = Math.max(0.1, currentQuality - 0.1);
                    tryCompress();
                  }
                },
                `image/${format}`,
                currentQuality
              );
            };

            tryCompress();
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error("Failed to load image for compression"));
        };

        img.src = URL.createObjectURL(file);
      });
    } catch (error) {
      // If compression fails, return original file
      console.warn("Image compression failed:", error);
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        wasCompressed: false,
        format: file.type,
      };
    }
  }

  /**
   * Calculates optimal dimensions while maintaining aspect ratio
   */
  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Scale down if too wide
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }

    // Scale down if too tall
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }

    return {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  /**
   * Generates a hash for file caching
   */
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Caches file data with expiry
   */
  public async cacheFileData(file: File, data: string): Promise<void> {
    try {
      const hash = await this.generateFileHash(file);
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        size: data.length,
        hash,
      };

      // Clean expired entries
      this.cleanExpiredCache();

      // Check if we need to make space
      if (this.currentCacheSize + entry.size > this.MAX_CACHE_SIZE) {
        this.evictOldestEntries(entry.size);
      }

      this.cache.set(hash, entry);
      this.currentCacheSize += entry.size;
    } catch (error) {
      console.warn("Failed to cache file data:", error);
    }
  }

  /**
   * Retrieves cached file data
   */
  public async getCachedFileData(file: File): Promise<string | null> {
    try {
      const hash = await this.generateFileHash(file);
      const entry = this.cache.get(hash);

      if (!entry) {
        return null;
      }

      // Check if expired
      if (Date.now() - entry.timestamp > this.CACHE_EXPIRY) {
        this.cache.delete(hash);
        this.currentCacheSize -= entry.size;
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn("Failed to retrieve cached file data:", error);
      return null;
    }
  }

  /**
   * Cleans expired cache entries
   */
  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [hash, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_EXPIRY) {
        this.cache.delete(hash);
        this.currentCacheSize -= entry.size;
      }
    }
  }

  /**
   * Evicts oldest entries to make space
   */
  private evictOldestEntries(spaceNeeded: number): void {
    const entries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    let freedSpace = 0;
    for (const [hash, entry] of entries) {
      this.cache.delete(hash);
      this.currentCacheSize -= entry.size;
      freedSpace += entry.size;

      if (freedSpace >= spaceNeeded) {
        break;
      }
    }
  }

  /**
   * Provides optimization suggestions based on file analysis
   */
  public analyzeFile(file: File): {
    suggestions: string[];
    canOptimize: boolean;
    estimatedSavings?: number;
  } {
    const suggestions: string[] = [];
    let canOptimize = false;
    let estimatedSavings = 0;

    // File size analysis
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      suggestions.push(
        "File is very large. Consider compressing before upload."
      );
      canOptimize = true;
      estimatedSavings += file.size * 0.6; // Estimate 60% reduction
    } else if (file.size > 2 * 1024 * 1024) {
      // 2MB
      suggestions.push("File is large. Compression may improve upload speed.");
      canOptimize = true;
      estimatedSavings += file.size * 0.3; // Estimate 30% reduction
    }

    // Image-specific analysis
    if (file.type.startsWith("image/")) {
      if (file.type === "image/png" && file.size > 1024 * 1024) {
        suggestions.push(
          "PNG images can often be compressed to JPEG for smaller size."
        );
        canOptimize = true;
      }

      if (file.type === "image/bmp" || file.type === "image/tiff") {
        suggestions.push(
          "Consider converting to JPEG or PNG for better compression."
        );
        canOptimize = true;
        estimatedSavings += file.size * 0.8; // Estimate 80% reduction
      }
    }

    // PDF analysis
    if (file.type === "application/pdf" && file.size > 10 * 1024 * 1024) {
      suggestions.push(
        "Large PDF detected. Consider optimizing the PDF before upload."
      );
    }

    return {
      suggestions,
      canOptimize,
      estimatedSavings: estimatedSavings > 0 ? estimatedSavings : undefined,
    };
  }

  /**
   * Clears all cached data
   */
  public clearCache(): void {
    this.cache.clear();
    this.currentCacheSize = 0;
  }

  /**
   * Gets cache statistics
   */
  public getCacheStats(): {
    entries: number;
    totalSize: number;
    maxSize: number;
    hitRate?: number;
  } {
    return {
      entries: this.cache.size,
      totalSize: this.currentCacheSize,
      maxSize: this.MAX_CACHE_SIZE,
    };
  }

  /**
   * Formats file size in human readable format
   */
  public formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Estimates upload time based on file size and connection speed
   */
  public estimateUploadTime(
    fileSize: number,
    connectionSpeed: number = 1024 * 1024 // 1 Mbps default
  ): {
    estimatedSeconds: number;
    formattedTime: string;
  } {
    const estimatedSeconds = Math.ceil(fileSize / (connectionSpeed / 8)); // Convert to bytes per second

    let formattedTime: string;
    if (estimatedSeconds < 60) {
      formattedTime = `${estimatedSeconds} seconds`;
    } else if (estimatedSeconds < 3600) {
      const minutes = Math.ceil(estimatedSeconds / 60);
      formattedTime = `${minutes} minute${minutes > 1 ? "s" : ""}`;
    } else {
      const hours = Math.ceil(estimatedSeconds / 3600);
      formattedTime = `${hours} hour${hours > 1 ? "s" : ""}`;
    }

    return {
      estimatedSeconds,
      formattedTime,
    };
  }
}

export const fileOptimizationService = new FileOptimizationService();
