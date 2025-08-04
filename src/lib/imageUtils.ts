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

// Default image URL for fallback
export const getDefaultImageUrl = (): string => {
  return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
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
