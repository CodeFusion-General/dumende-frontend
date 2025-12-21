// CloudFlare Images API Service
// Backend API: /api/images/* (Backend commit 7eb759e)

import { BaseService } from "./base/BaseService";

/**
 * CloudFlare Direct Upload URL Response
 */
export interface CloudFlareDirectUploadUrlResponse {
  uploadUrl: string;
  imageId: string;
  expiresAt: string;
}

/**
 * CloudFlare Image Upload Response
 */
export interface CloudFlareImageUploadResponse {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
  // Variant URLs
  publicUrl?: string;
  thumbnailUrl?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  fullUrl?: string;
}

/**
 * CloudFlare Image Service
 * Handles direct uploads to CloudFlare Images for better performance
 */
class CloudFlareImageService extends BaseService {
  constructor() {
    super("/images"); // axios baseURL zaten /api
  }

  /**
   * Get direct upload URL for frontend uploads
   * This is the RECOMMENDED method for uploading images
   *
   * @param metadata - Optional metadata for the image
   * @returns Direct upload URL and image ID
   */
  public async getDirectUploadUrl(
    metadata?: Record<string, string>
  ): Promise<CloudFlareDirectUploadUrlResponse> {
    return this.post<CloudFlareDirectUploadUrlResponse>("/direct-upload-url", {
      metadata,
    });
  }

  /**
   * Upload image directly to CloudFlare (via backend proxy)
   * Use getDirectUploadUrl() instead for better performance
   *
   * @param file - Image file to upload
   * @param metadata - Optional metadata
   * @returns Upload response with variant URLs
   */
  public async uploadImage(
    file: File,
    metadata?: Record<string, string>
  ): Promise<CloudFlareImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    return this.api.post<CloudFlareImageUploadResponse>(
      `${this.baseUrl}/upload`,
      formData,
      {
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      }
    ).then(response => response.data);
  }

  /**
   * Upload image directly to CloudFlare using the direct upload URL
   * This method bypasses the backend for better performance
   *
   * @param uploadUrl - Direct upload URL from getDirectUploadUrl()
   * @param file - Image file to upload
   * @returns Upload response
   */
  public async uploadToCloudFlareDirect(
    uploadUrl: string,
    file: File
  ): Promise<CloudFlareImageUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.result; // CloudFlare returns data in result.result
  }

  /**
   * Get specific variant URL for an image
   *
   * @param imageId - CloudFlare image ID
   * @param variant - Variant name (thumbnail, small, medium, large, public)
   * @returns Variant URL
   */
  public async getVariantUrl(
    imageId: string,
    variant: "thumbnail" | "small" | "medium" | "large" | "public"
  ): Promise<string> {
    return this.get<string>(`/variant/${imageId}/${variant}`);
  }

  /**
   * Delete an image from CloudFlare
   *
   * @param imageId - CloudFlare image ID
   */
  public async deleteImage(imageId: string): Promise<void> {
    return this.delete<void>(`/${imageId}`);
  }

  /**
   * Check CloudFlare Images health status
   *
   * @returns Health status
   */
  public async checkHealth(): Promise<{ status: string; message: string }> {
    return this.get<{ status: string; message: string }>("/health");
  }

  /**
   * Complete upload workflow: Get URL → Upload → Return variants
   *
   * @param file - Image file to upload
   * @param metadata - Optional metadata
   * @returns Upload response with all variant URLs
   */
  public async uploadImageComplete(
    file: File,
    metadata?: Record<string, string>
  ): Promise<CloudFlareImageUploadResponse> {
    // Step 1: Get direct upload URL
    const { uploadUrl, imageId } = await this.getDirectUploadUrl(metadata);

    // Step 2: Upload directly to CloudFlare
    const uploadResponse = await this.uploadToCloudFlareDirect(uploadUrl, file);

    // Step 3: Return response with variant URLs
    return {
      ...uploadResponse,
      id: imageId,
    };
  }

  /**
   * Validate image file before upload
   *
   * @param file - File to validate
   * @returns Validation result
   */
  public validateImageFile(file: File): {
    isValid: boolean;
    error?: string;
  } {
    // Max file size: 10MB (CloudFlare Images limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: "File size exceeds 10MB limit",
      };
    }

    // Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "Only JPEG, PNG, WebP, and GIF formats are supported",
      };
    }

    return { isValid: true };
  }

  /**
   * Get image dimensions from file
   *
   * @param file - Image file
   * @returns Promise with width and height
   */
  public getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to load image"));
      };

      img.src = objectUrl;
    });
  }

  /**
   * Upload progress callback type
   */
  public type UploadProgressCallback = (progress: number) => void;

  /**
   * Upload image with progress tracking
   *
   * @param file - Image file to upload
   * @param onProgress - Progress callback (0-100)
   * @param metadata - Optional metadata
   * @returns Upload response
   */
  public async uploadImageWithProgress(
    file: File,
    onProgress?: (progress: number) => void,
    metadata?: Record<string, string>
  ): Promise<CloudFlareImageUploadResponse> {
    // Validate file first
    const validation = this.validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Get direct upload URL
    onProgress?.(10);
    const { uploadUrl, imageId } = await this.getDirectUploadUrl(metadata);

    // Upload with progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", file);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = 10 + Math.round((e.loaded / e.total) * 90);
          onProgress?.(percentComplete);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          resolve({
            ...result.result,
            id: imageId,
          });
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("POST", uploadUrl);
      xhr.send(formData);
    });
  }
}

export const cloudflareImageService = new CloudFlareImageService();
