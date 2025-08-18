/**
 * Image Format Optimization Service
 * Implements Requirements 2.4, 5.3 for WebP/AVIF format detection and mobile compression
 */

export interface ImageFormatSupport {
  webp: boolean;
  avif: boolean;
  heic: boolean;
  jxl: boolean;
}

export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEndDevice: boolean;
  connectionType: "slow-2g" | "2g" | "3g" | "4g" | "unknown";
  memoryLimit: number;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface ImageOptimizationOptions {
  quality?: number;
  width?: number;
  height?: number;
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  mobileOptimized?: boolean;
  compressionLevel?: "low" | "medium" | "high";
  enableFallback?: boolean;
}

export interface OptimizedImageResult {
  src: string;
  fallbackSrc?: string;
  format: string;
  quality: number;
  width?: number;
  height?: number;
  estimatedSize: number;
}

/**
 * Image Format Optimization Service
 */
export class ImageFormatOptimizationService {
  private formatSupport: ImageFormatSupport;
  private deviceCapabilities: DeviceCapabilities;
  private initialized = false;

  constructor() {
    this.formatSupport = {
      webp: false,
      avif: false,
      heic: false,
      jxl: false,
    };

    this.deviceCapabilities = {
      isMobile: false,
      isLowEndDevice: false,
      connectionType: "unknown",
      memoryLimit: 0,
      pixelRatio: 1,
      viewportWidth: 0,
      viewportHeight: 0,
    };

    this.init();
  }

  /**
   * Initialize the service with format detection and device capability assessment
   */
  private async init() {
    if (this.initialized) return;

    await Promise.all([
      this.detectFormatSupport(),
      this.assessDeviceCapabilities(),
    ]);

    this.addDocumentClasses();
    this.initialized = true;
  }

  /**
   * Detect supported image formats
   */
  private async detectFormatSupport(): Promise<void> {
    const checks = await Promise.all([
      this.checkWebPSupport(),
      this.checkAVIFSupport(),
      this.checkHEICSupport(),
      this.checkJXLSupport(),
    ]);

    this.formatSupport = {
      webp: checks[0],
      avif: checks[1],
      heic: checks[2],
      jxl: checks[3],
    };
  }

  /**
   * Check WebP support
   */
  private async checkWebPSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  }

  /**
   * Check AVIF support
   */
  private async checkAVIFSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2);
      };
      avif.src =
        "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=";
    });
  }

  /**
   * Check HEIC support (mainly for iOS Safari)
   */
  private async checkHEICSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const heic = new Image();
      heic.onload = () => resolve(true);
      heic.onerror = () => resolve(false);
      heic.src = "data:image/heic;base64,";
    });
  }

  /**
   * Check JPEG XL support
   */
  private async checkJXLSupport(): Promise<boolean> {
    return new Promise((resolve) => {
      const jxl = new Image();
      jxl.onload = () => resolve(true);
      jxl.onerror = () => resolve(false);
      jxl.src = "data:image/jxl;base64,";
    });
  }

  /**
   * Assess device capabilities for optimization decisions
   */
  private assessDeviceCapabilities(): void {
    const isMobile =
      window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);

    // Detect low-end device
    const deviceMemory = (navigator as any).deviceMemory;
    const hardwareConcurrency = (navigator as any).hardwareConcurrency;
    const isLowEndDevice =
      (deviceMemory && deviceMemory <= 2) ||
      (hardwareConcurrency && hardwareConcurrency <= 2) ||
      /Android.*[2-4]\./i.test(navigator.userAgent);

    // Detect connection type
    const connection = (navigator as any).connection;
    const connectionType = connection ? connection.effectiveType : "unknown";

    // Calculate memory limit
    const memoryLimit = deviceMemory
      ? deviceMemory * 1024 * 1024 * 1024 // Convert GB to bytes
      : isMobile
      ? 2 * 1024 * 1024 * 1024
      : 4 * 1024 * 1024 * 1024;

    this.deviceCapabilities = {
      isMobile,
      isLowEndDevice,
      connectionType,
      memoryLimit,
      pixelRatio: window.devicePixelRatio || 1,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  }

  /**
   * Add CSS classes to document for targeting
   */
  private addDocumentClasses(): void {
    const root = document.documentElement;

    // Format support classes
    Object.entries(this.formatSupport).forEach(([format, supported]) => {
      root.classList.add(supported ? format : `no-${format}`);
    });

    // Device capability classes
    if (this.deviceCapabilities.isMobile) root.classList.add("mobile-device");
    if (this.deviceCapabilities.isLowEndDevice)
      root.classList.add("low-end-device");
    root.classList.add(`connection-${this.deviceCapabilities.connectionType}`);
    root.classList.add(
      `pixel-ratio-${Math.floor(this.deviceCapabilities.pixelRatio)}`
    );
  }

  /**
   * Get optimal image format based on support and device capabilities
   */
  public getOptimalFormat(originalFormat?: string): string {
    // Priority order: AVIF > WebP > HEIC > JXL > Original
    if (this.formatSupport.avif) return "avif";
    if (this.formatSupport.webp) return "webp";
    if (this.formatSupport.heic && originalFormat === "heic") return "heic";
    if (this.formatSupport.jxl) return "jxl";
    return originalFormat || "jpeg";
  }

  /**
   * Optimize image source with mobile-specific optimizations
   */
  public optimizeImageSrc(
    originalSrc: string,
    options: ImageOptimizationOptions = {}
  ): OptimizedImageResult {
    const {
      quality = 85,
      width,
      height,
      format = "auto",
      mobileOptimized = true,
      compressionLevel = "medium",
      enableFallback = true,
    } = options;

    // Determine target format
    const targetFormat = format === "auto" ? this.getOptimalFormat() : format;

    // Calculate optimal quality based on device and connection
    const optimalQuality = this.calculateOptimalQuality(
      quality,
      mobileOptimized,
      compressionLevel
    );

    // Calculate optimal dimensions
    const optimalDimensions = this.calculateOptimalDimensions(
      width,
      height,
      mobileOptimized
    );

    // Build optimized URL
    const optimizedSrc = this.buildOptimizedUrl(originalSrc, {
      format: targetFormat,
      quality: optimalQuality,
      ...optimalDimensions,
      mobileOptimized,
    });

    // Generate fallback if needed
    const fallbackSrc = enableFallback
      ? this.generateFallbackSrc(originalSrc, {
          quality: optimalQuality,
          ...optimalDimensions,
        })
      : undefined;

    // Estimate file size
    const estimatedSize = this.estimateFileSize(
      optimalDimensions.width || 800,
      optimalDimensions.height || 600,
      targetFormat,
      optimalQuality
    );

    return {
      src: optimizedSrc,
      fallbackSrc,
      format: targetFormat,
      quality: optimalQuality,
      width: optimalDimensions.width,
      height: optimalDimensions.height,
      estimatedSize,
    };
  }

  /**
   * Calculate optimal quality based on device capabilities
   */
  private calculateOptimalQuality(
    baseQuality: number,
    mobileOptimized: boolean,
    compressionLevel: "low" | "medium" | "high"
  ): number {
    let quality = baseQuality;

    if (mobileOptimized && this.deviceCapabilities.isMobile) {
      // Adjust for connection speed
      switch (this.deviceCapabilities.connectionType) {
        case "slow-2g":
          quality = Math.min(quality, 40);
          break;
        case "2g":
          quality = Math.min(quality, 50);
          break;
        case "3g":
          quality = Math.min(quality, 70);
          break;
        case "4g":
          quality = Math.min(quality, 85);
          break;
      }

      // Adjust for device performance
      if (this.deviceCapabilities.isLowEndDevice) {
        quality = Math.min(quality, 60);
      }
    }

    // Apply compression level
    switch (compressionLevel) {
      case "high":
        quality = Math.min(quality, 50);
        break;
      case "medium":
        quality = Math.min(quality, 75);
        break;
      case "low":
        // Keep current quality
        break;
    }

    return Math.max(20, Math.min(100, quality)); // Clamp between 20-100
  }

  /**
   * Calculate optimal dimensions for mobile devices
   */
  private calculateOptimalDimensions(
    width?: number,
    height?: number,
    mobileOptimized: boolean = true
  ): { width?: number; height?: number } {
    if (!mobileOptimized || !this.deviceCapabilities.isMobile) {
      return { width, height };
    }

    const { viewportWidth, pixelRatio, isLowEndDevice } =
      this.deviceCapabilities;
    const maxWidth = isLowEndDevice
      ? Math.min(viewportWidth * pixelRatio, 1024)
      : viewportWidth * pixelRatio;

    if (width && width > maxWidth) {
      const aspectRatio = height ? height / width : 1;
      return {
        width: maxWidth,
        height: height ? Math.round(maxWidth * aspectRatio) : undefined,
      };
    }

    return { width, height };
  }

  /**
   * Build optimized image URL
   */
  private buildOptimizedUrl(
    originalSrc: string,
    options: {
      format: string;
      quality: number;
      width?: number;
      height?: number;
      mobileOptimized: boolean;
    }
  ): string {
    const url = new URL(originalSrc, window.location.origin);

    // Update file extension for format
    if (options.format !== "jpeg" && options.format !== "jpg") {
      const extension = `.${options.format}`;
      url.pathname = url.pathname.replace(
        /\.(jpg|jpeg|png|webp|avif|heic|jxl)$/i,
        extension
      );
    }

    // Add optimization parameters
    url.searchParams.set("q", options.quality.toString());

    if (options.width) {
      url.searchParams.set("w", options.width.toString());
    }

    if (options.height) {
      url.searchParams.set("h", options.height.toString());
    }

    if (options.mobileOptimized && this.deviceCapabilities.isMobile) {
      url.searchParams.set("mobile", "1");
      url.searchParams.set(
        "dpr",
        this.deviceCapabilities.pixelRatio.toString()
      );
    }

    return url.toString();
  }

  /**
   * Generate fallback source for unsupported formats
   */
  private generateFallbackSrc(
    originalSrc: string,
    options: { quality: number; width?: number; height?: number }
  ): string {
    const url = new URL(originalSrc, window.location.origin);

    // Ensure fallback uses widely supported format
    url.pathname = url.pathname.replace(/\.(webp|avif|heic|jxl)$/i, ".jpg");

    url.searchParams.set("q", options.quality.toString());

    if (options.width) {
      url.searchParams.set("w", options.width.toString());
    }

    if (options.height) {
      url.searchParams.set("h", options.height.toString());
    }

    return url.toString();
  }

  /**
   * Estimate file size based on dimensions, format, and quality
   */
  private estimateFileSize(
    width: number,
    height: number,
    format: string,
    quality: number
  ): number {
    const pixels = width * height;
    const qualityFactor = quality / 100;

    // Base bytes per pixel for different formats
    const bytesPerPixel = {
      jpeg: 0.5,
      jpg: 0.5,
      webp: 0.3,
      avif: 0.2,
      png: 3.0,
      heic: 0.25,
      jxl: 0.15,
    };

    const baseBytesPerPixel =
      bytesPerPixel[format as keyof typeof bytesPerPixel] || 0.5;

    return Math.round(pixels * baseBytesPerPixel * qualityFactor);
  }

  /**
   * Generate responsive srcset with format optimization
   */
  public generateResponsiveSrcSet(
    baseSrc: string,
    breakpoints: number[] = [320, 480, 640, 768, 1024, 1280, 1536],
    options: ImageOptimizationOptions = {}
  ): string {
    return breakpoints
      .map((width) => {
        const optimized = this.optimizeImageSrc(baseSrc, {
          ...options,
          width,
        });
        return `${optimized.src} ${width}w`;
      })
      .join(", ");
  }

  /**
   * Generate sizes attribute for responsive images
   */
  public generateSizes(
    breakpoints: number[] = [320, 480, 640, 768, 1024, 1280, 1536]
  ): string {
    const sizeRules = breakpoints
      .reverse()
      .map((width, index) => {
        if (index === breakpoints.length - 1) {
          return `${width}px`;
        }
        return `(min-width: ${width}px) ${width}px`;
      })
      .join(", ");

    return `${sizeRules}, 100vw`;
  }

  /**
   * Get format support information
   */
  public getFormatSupport(): ImageFormatSupport {
    return { ...this.formatSupport };
  }

  /**
   * Get device capabilities
   */
  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  /**
   * Check if service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const imageFormatOptimizationService =
  new ImageFormatOptimizationService();
