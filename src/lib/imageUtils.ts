// Resim boyutunu küçültme ve optimizasyon utilities
export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 arası
  outputFormat?: string; // 'image/jpeg' | 'image/webp' | 'image/png'
}

export const compressImage = (
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 0.8,
      outputFormat = "image/jpeg",
    } = options;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Orijinal boyutları al
      let { width, height } = img;

      // Oranı koru ve maksimum boyutlara göre küçült
      const ratio = Math.min(maxWidth / width, maxHeight / height);

      if (ratio < 1) {
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Canvas boyutunu ayarla
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Canvas context oluşturulamadı"));
        return;
      }

      // Resmi canvas'a çiz
      ctx.drawImage(img, 0, 0, width, height);

      // Base64 olarak çıkar (prefix'siz)
      const base64String = canvas.toDataURL(outputFormat, quality);
      const base64Data = base64String.split(",")[1];

      resolve(base64Data);
    };

    img.onerror = () => {
      reject(new Error("Resim yüklenemedi"));
    };

    // FileReader ile resmi yükle
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Dosya okunamadı"));
    };
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Dosya boyutu kontrolü (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "Dosya boyutu 10MB'dan büyük olamaz" };
  }

  // Dosya türü kontrolü
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Sadece JPEG, PNG ve WebP formatları desteklenir",
    };
  }

  return { isValid: true };
};

// URL validation helper function
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Default image URLs for fallback (multiple options)
const DEFAULT_BOAT_IMAGES = [
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
];

export const getDefaultImageUrl = (index: number = 0): string => {
  return DEFAULT_BOAT_IMAGES[index % DEFAULT_BOAT_IMAGES.length];
};

// Test if an image URL is accessible
export const testImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;

    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
};

// Get a working image URL with fallback
export const getWorkingImageUrl = async (
  primaryUrl: string,
  fallbackIndex: number = 0
): Promise<string> => {
  // First try the primary URL
  if (await testImageUrl(primaryUrl)) {
    return primaryUrl;
  }

  // If primary fails, try default images
  for (let i = 0; i < DEFAULT_BOAT_IMAGES.length; i++) {
    const fallbackUrl =
      DEFAULT_BOAT_IMAGES[(fallbackIndex + i) % DEFAULT_BOAT_IMAGES.length];
    if (await testImageUrl(fallbackUrl)) {
      return fallbackUrl;
    }
  }

  // If all fail, return a data URL placeholder
  return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI4MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDgwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iODAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01ODAgMzgwSDYyMFY0MjBINTgwVjM4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K";
};

// Convert backend image URL to full URL
export const getFullImageUrl = (imageUrl: string): string => {
  if (!imageUrl) {
    return getDefaultImageUrl();
  }

  // Eğer zaten tam URL ise direkt döndür
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Backend'den gelen relative path'i tam URL'e çevir
  // Backend muhtemelen /uploads/ veya /images/ prefix'i ile dosyaları serve ediyor
  const baseUrl = window.location.origin;

  // Eğer imageUrl zaten /api ile başlıyorsa direkt kullan
  if (imageUrl.startsWith("/api/")) {
    return `${baseUrl}${imageUrl}`;
  }

  // Eğer / ile başlıyorsa /api prefix'i ekle
  if (imageUrl.startsWith("/")) {
    return `${baseUrl}/api${imageUrl}`;
  }

  // Diğer durumlarda /api/uploads/ prefix'i ekle
  return `${baseUrl}/api/uploads/${imageUrl}`;
};

// ✅ YENİ: CloudFlare variant URL priority selector
// Selects the best available image URL from variant URLs with fallback
export const getImageUrlPriority = (
  image: {
    publicUrl?: string;
    largeUrl?: string;
    mediumUrl?: string;
    smallUrl?: string;
    thumbnailUrl?: string;
    imageUrl?: string; // Deprecated fallback
  }
): string => {
  return (
    image.publicUrl ||
    image.largeUrl ||
    image.mediumUrl ||
    image.smallUrl ||
    image.thumbnailUrl ||
    image.imageUrl ||
    getDefaultImageUrl()
  );
};

// ✅ YENİ: Responsive image URL selector based on screen size
export const getResponsiveImageUrl = (
  image: {
    publicUrl?: string;
    largeUrl?: string;
    mediumUrl?: string;
    smallUrl?: string;
    thumbnailUrl?: string;
    imageUrl?: string; // Deprecated fallback
  },
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'thumbnail' = 'desktop'
): string => {
  switch (screenSize) {
    case 'thumbnail':
      // For list views, small thumbnails
      return (
        image.thumbnailUrl ||
        image.smallUrl ||
        image.imageUrl ||
        getDefaultImageUrl()
      );
    case 'mobile':
      // For mobile detail pages (400x300)
      return (
        image.smallUrl ||
        image.thumbnailUrl ||
        image.mediumUrl ||
        image.imageUrl ||
        getDefaultImageUrl()
      );
    case 'tablet':
      // For tablet/medium screens (800x600)
      return (
        image.mediumUrl ||
        image.smallUrl ||
        image.largeUrl ||
        image.imageUrl ||
        getDefaultImageUrl()
      );
    case 'desktop':
      // For desktop/large screens (1600x1200)
      return (
        image.largeUrl ||
        image.mediumUrl ||
        image.publicUrl ||
        image.imageUrl ||
        getDefaultImageUrl()
      );
    default:
      return getImageUrlPriority(image);
  }
};

// ✅ YENİ: Get srcset for CloudFlare variants (for responsive images)
export const getCloudFlareImageSrcSet = (image: {
  thumbnailUrl?: string;
  smallUrl?: string;
  mediumUrl?: string;
  largeUrl?: string;
  publicUrl?: string;
}): string => {
  const srcSet: string[] = [];

  if (image.thumbnailUrl) srcSet.push(`${image.thumbnailUrl} 200w`);
  if (image.smallUrl) srcSet.push(`${image.smallUrl} 400w`);
  if (image.mediumUrl) srcSet.push(`${image.mediumUrl} 800w`);
  if (image.largeUrl) srcSet.push(`${image.largeUrl} 1600w`);
  if (image.publicUrl) srcSet.push(`${image.publicUrl} 2000w`);

  return srcSet.join(', ');
};

// ✅ OPTIMIZATION: Image preloading utility
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

// ✅ OPTIMIZATION: Preload multiple images
export const preloadImages = (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(url => preloadImage(url).catch(() => {})));
};

// ✅ OPTIMIZATION: Get responsive image srcset
export const getResponsiveImageSrcSet = (baseUrl: string): string => {
  // Generate responsive image sizes (if backend supports it)
  // For now, we'll return the base URL with different quality parameters
  return `${baseUrl}?w=400 400w, ${baseUrl}?w=800 800w, ${baseUrl}?w=1200 1200w`;
};

// ✅ OPTIMIZATION: Image lazy loading with Intersection Observer
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, {
    rootMargin: '50px', // Start loading 50px before the image enters viewport
    threshold: 0.01,
    ...options,
  });
};

// ✅ OPTIMIZATION: Image dimension calculator for responsive layouts
export const calculateImageDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);

  if (ratio >= 1) {
    return { width: originalWidth, height: originalHeight };
  }

  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio),
  };
};
