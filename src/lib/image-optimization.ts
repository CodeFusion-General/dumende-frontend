/**
 * Image Loading and Optimization Utilities
 */

export interface ImageOptimizationConfig {
  enableLazyLoading: boolean;
  enableProgressiveLoading: boolean;
  enableWebP: boolean;
  enableAVIF: boolean;
  quality: number;
  placeholderBlur: number;
  intersectionThreshold: number;
  rootMargin: string;
}

export interface ResponsiveImageConfig {
  breakpoints: { [key: string]: number };
  sizes: string[];
  formats: string[];
}

/**
 * Progressive Image Loader with blur-to-sharp transitions
 */
export class ProgressiveImageLoader {
  private config: ImageOptimizationConfig;
  private loadedImages = new Set<string>();
  private observer: IntersectionObserver | null = null;

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = {
      enableLazyLoading: true,
      enableProgressiveLoading: true,
      enableWebP: true,
      enableAVIF: false,
      quality: 85,
      placeholderBlur: 10,
      intersectionThreshold: 0.1,
      rootMargin: "50px",
      ...config,
    };

    this.init();
  }

  private init() {
    if (this.config.enableLazyLoading) {
      this.setupIntersectionObserver();
    }

    // Process existing images
    this.processExistingImages();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer?.unobserve(img);
          }
        });
      },
      {
        threshold: this.config.intersectionThreshold,
        rootMargin: this.config.rootMargin,
      }
    );
  }

  private processExistingImages() {
    document.querySelectorAll("img[data-src]").forEach((img) => {
      if (this.config.enableLazyLoading) {
        this.observer?.observe(img);
      } else {
        this.loadImage(img as HTMLImageElement);
      }
    });
  }

  private async loadImage(img: HTMLImageElement) {
    const src = img.dataset.src;
    if (!src || this.loadedImages.has(src)) return;

    try {
      // Add loading class
      img.classList.add("image-loading");

      // Create optimized image URL
      const optimizedSrc = this.getOptimizedImageUrl(src);

      // Preload the image
      const imageElement = new Image();
      imageElement.src = optimizedSrc;

      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
      });

      // Apply progressive loading effect
      if (this.config.enableProgressiveLoading) {
        await this.applyProgressiveTransition(img, optimizedSrc);
      } else {
        img.src = optimizedSrc;
        img.classList.remove("image-loading");
        img.classList.add("image-loaded");
      }

      this.loadedImages.add(src);
    } catch (error) {
      console.error("Failed to load image:", src, error);
      img.classList.remove("image-loading");
      img.classList.add("image-error");
    }
  }

  private async applyProgressiveTransition(
    img: HTMLImageElement,
    src: string
  ): Promise<void> {
    return new Promise((resolve) => {
      // Create a temporary image for smooth transition
      const tempImg = new Image();
      tempImg.src = src;
      tempImg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: inherit;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;

      // Ensure parent has relative positioning
      const parent = img.parentElement;
      if (parent && getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }

      // Insert temp image
      img.parentElement?.appendChild(tempImg);

      // Fade in the new image
      requestAnimationFrame(() => {
        tempImg.style.opacity = "1";

        setTimeout(() => {
          // Replace original image
          img.src = src;
          img.classList.remove("image-loading");
          img.classList.add("image-loaded");

          // Remove temp image
          tempImg.remove();
          resolve();
        }, 300);
      });
    });
  }

  private getOptimizedImageUrl(src: string): string {
    // This would typically integrate with a CDN or image optimization service
    // For now, we'll return the original URL with potential format conversion

    if (this.supportsWebP() && this.config.enableWebP) {
      // Convert to WebP if supported (this would be handled by your image service)
      return src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
    }

    if (this.supportsAVIF() && this.config.enableAVIF) {
      // Convert to AVIF if supported
      return src.replace(/\.(jpg|jpeg|png|webp)$/i, ".avif");
    }

    return src;
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }

  private supportsAVIF(): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL("image/avif").indexOf("data:image/avif") === 0;
    } catch {
      return false;
    }
  }

  // Public method to load a specific image
  loadImageElement(img: HTMLImageElement) {
    this.loadImage(img);
  }

  // Public method to observe new images
  observeImage(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedImages.clear();
  }
}

/**
 * Responsive Image Manager
 */
export class ResponsiveImageManager {
  private config: ResponsiveImageConfig;
  private resizeObserver: ResizeObserver | null = null;

  constructor(config: Partial<ResponsiveImageConfig> = {}) {
    this.config = {
      breakpoints: {
        xs: 320,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        "2xl": 1536,
      },
      sizes: ["320w", "640w", "768w", "1024w", "1280w", "1536w"],
      formats: ["avif", "webp", "jpg"],
      ...config,
    };

    this.init();
  }

  private init() {
    this.setupResizeObserver();
    this.processExistingImages();
  }

  private setupResizeObserver() {
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const img = entry.target as HTMLImageElement;
        this.updateImageSrc(img);
      });
    });
  }

  private processExistingImages() {
    document.querySelectorAll("img[data-responsive]").forEach((img) => {
      this.setupResponsiveImage(img as HTMLImageElement);
    });
  }

  private setupResponsiveImage(img: HTMLImageElement) {
    // Generate srcset and sizes attributes
    const baseSrc = img.dataset.src || img.src;
    const srcset = this.generateSrcSet(baseSrc);
    const sizes = this.generateSizes();

    img.srcset = srcset;
    img.sizes = sizes;

    // Observe for size changes
    if (this.resizeObserver) {
      this.resizeObserver.observe(img);
    }
  }

  private generateSrcSet(baseSrc: string): string {
    return this.config.sizes
      .map((size) => {
        const width = parseInt(size.replace("w", ""));
        const optimizedUrl = this.getResponsiveImageUrl(baseSrc, width);
        return `${optimizedUrl} ${size}`;
      })
      .join(", ");
  }

  private generateSizes(): string {
    // Generate sizes attribute based on breakpoints
    const sizeRules = Object.entries(this.config.breakpoints)
      .reverse()
      .map(([name, width]) => `(min-width: ${width}px) ${width}px`)
      .join(", ");

    return `${sizeRules}, 100vw`;
  }

  private getResponsiveImageUrl(baseSrc: string, width: number): string {
    // This would typically integrate with a CDN or image optimization service
    // For now, we'll return a URL with width parameter
    const url = new URL(baseSrc, window.location.origin);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", "85");
    return url.toString();
  }

  private updateImageSrc(img: HTMLImageElement) {
    // Update image source based on current container size
    const containerWidth = img.offsetWidth;
    const optimalWidth = this.findOptimalWidth(containerWidth);
    const baseSrc = img.dataset.src || img.src;

    if (optimalWidth) {
      const optimizedUrl = this.getResponsiveImageUrl(baseSrc, optimalWidth);
      if (img.src !== optimizedUrl) {
        img.src = optimizedUrl;
      }
    }
  }

  private findOptimalWidth(containerWidth: number): number | null {
    const widths = this.config.sizes.map((size) =>
      parseInt(size.replace("w", ""))
    );

    // Find the smallest width that's larger than the container
    for (const width of widths.sort((a, b) => a - b)) {
      if (width >= containerWidth) {
        return width;
      }
    }

    // Return the largest width if container is bigger than all breakpoints
    return widths[widths.length - 1];
  }

  // Public method to setup responsive image
  setupImage(img: HTMLImageElement) {
    this.setupResponsiveImage(img);
  }

  destroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }
}

/**
 * Background Image Lazy Loader
 */
export class BackgroundImageLoader {
  private observer: IntersectionObserver | null = null;
  private loadedBackgrounds = new Set<string>();

  constructor() {
    this.init();
  }

  private init() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            this.loadBackgroundImage(element);
            this.observer?.unobserve(element);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    this.processExistingElements();
  }

  private processExistingElements() {
    document.querySelectorAll("[data-bg-src]").forEach((element) => {
      this.observer?.observe(element);
    });
  }

  private async loadBackgroundImage(element: HTMLElement) {
    const bgSrc = element.dataset.bgSrc;
    if (!bgSrc || this.loadedBackgrounds.has(bgSrc)) return;

    try {
      element.classList.add("bg-loading");

      // Preload the background image
      const img = new Image();
      img.src = bgSrc;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Apply background with transition
      element.style.backgroundImage = `url(${bgSrc})`;
      element.classList.remove("bg-loading");
      element.classList.add("bg-loaded");

      this.loadedBackgrounds.add(bgSrc);
    } catch (error) {
      console.error("Failed to load background image:", bgSrc, error);
      element.classList.remove("bg-loading");
      element.classList.add("bg-error");
    }
  }

  // Public method to observe new elements
  observeElement(element: HTMLElement) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.loadedBackgrounds.clear();
  }
}

/**
 * Image Placeholder Generator
 */
export class ImagePlaceholderGenerator {
  static generateBlurPlaceholder(
    width: number,
    height: number,
    color: string = "#e5e7eb"
  ): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    canvas.width = width;
    canvas.height = height;

    // Fill with base color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // Add some noise/texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10;
      data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // B
    }

    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.1);
  }

  static generateGradientPlaceholder(
    width: number,
    height: number,
    colors: string[] = ["#f3f4f6", "#e5e7eb"]
  ): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    canvas.width = width;
    canvas.height = height;

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas.toDataURL("image/jpeg", 0.1);
  }
}

/**
 * Global Image Optimization Manager
 */
export class GlobalImageOptimizer {
  private progressiveLoader: ProgressiveImageLoader;
  private responsiveManager: ResponsiveImageManager;
  private backgroundLoader: BackgroundImageLoader;
  private isInitialized = false;

  constructor() {
    this.progressiveLoader = new ProgressiveImageLoader();
    this.responsiveManager = new ResponsiveImageManager();
    this.backgroundLoader = new BackgroundImageLoader();
  }

  init() {
    if (this.isInitialized) return;

    // Setup mutation observer for new images
    this.setupMutationObserver();

    // Add placeholder generation for images without src
    this.setupPlaceholders();

    this.isInitialized = true;
  }

  private setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;

            // Process new images
            element.querySelectorAll("img[data-src]").forEach((img) => {
              this.progressiveLoader.observeImage(img as HTMLImageElement);
            });

            // Process new responsive images
            element.querySelectorAll("img[data-responsive]").forEach((img) => {
              this.responsiveManager.setupImage(img as HTMLImageElement);
            });

            // Process new background images
            element.querySelectorAll("[data-bg-src]").forEach((el) => {
              this.backgroundLoader.observeElement(el as HTMLElement);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private setupPlaceholders() {
    document.querySelectorAll("img[data-src]:not([src])").forEach((img) => {
      const element = img as HTMLImageElement;
      const width = element.offsetWidth || 300;
      const height = element.offsetHeight || 200;

      // Generate blur placeholder
      const placeholder = ImagePlaceholderGenerator.generateBlurPlaceholder(
        Math.min(width, 50),
        Math.min(height, 50)
      );

      element.src = placeholder;
      element.classList.add("image-placeholder");
    });
  }

  destroy() {
    this.progressiveLoader.destroy();
    this.responsiveManager.destroy();
    this.backgroundLoader.destroy();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const globalImageOptimizer = new GlobalImageOptimizer();

// Auto-initialize
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      globalImageOptimizer.init()
    );
  } else {
    globalImageOptimizer.init();
  }
}
