import React, { useCallback, useState } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ProfileImageUploadProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif"];

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  className,
  stepNumber = 3,
  totalSteps = 3,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Generate preview URL when file changes
  React.useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [value]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "Dosya boyutu 5MB'dan küçük olmalıdır";
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Sadece JPG, PNG ve GIF formatları desteklenir";
    }

    return null;
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setIsLoading(true);

      try {
        const validationError = validateFile(file);
        if (validationError) {
          // Don't call onChange with invalid file, let parent handle error display
          return;
        }

        onChange(file);
      } finally {
        setIsLoading(false);
      }
    },
    [onChange, validateFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled || isLoading) return;

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (file) {
        handleFileSelect(file);
      }
    },
    [disabled, isLoading, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled && !isLoading) {
        setIsDragOver(true);
      }
    },
    [disabled, isLoading]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const hasError = Boolean(error);
  const hasFile = Boolean(value);
  const completionPercentage = hasFile && !hasError ? 100 : 0;

  return (
    <div
      className={cn("w-full", className)}
      role="region"
      aria-labelledby="image-upload-title"
    >
      {/* Header with progress */}
      <div className="flex items-center justify-between mb-4">
        <h3
          id="image-upload-title"
          className="text-lg font-semibold flex items-center gap-2"
        >
          <ImageIcon className="w-5 h-5 text-primary" aria-hidden="true" />
          Profil Fotoğrafı (İsteğe Bağlı)
          {stepNumber && totalSteps && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Adım {stepNumber}/{totalSteps})
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {hasFile && !hasError ? "Tamamlandı" : "İsteğe bağlı"}
          </div>
          {completionPercentage === 100 && (
            <CheckCircle2
              className="w-5 h-5 text-green-600"
              aria-label="Fotoğraf yüklendi"
            />
          )}
        </div>
      </div>

      <Card
        className={cn(
          "relative transition-all duration-300",
          isDragOver && "border-primary bg-primary/5 scale-[1.02]",
          hasError && "border-destructive bg-destructive/5",
          hasFile && !hasError && "border-green-500 bg-green-50/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent className="p-6">
          {/* File Input */}
          <input
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileInputChange}
            disabled={disabled || isLoading}
            className="sr-only"
            id="profile-image-upload"
            aria-describedby="upload-instructions"
          />

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="button"
            tabIndex={disabled || isLoading ? -1 : 0}
            aria-label={
              hasFile ? "Profil fotoğrafını değiştir" : "Profil fotoğrafı yükle"
            }
            aria-describedby="upload-instructions"
            onKeyDown={(e) => {
              if (
                (e.key === "Enter" || e.key === " ") &&
                !disabled &&
                !isLoading
              ) {
                e.preventDefault();
                document.getElementById("profile-image-upload")?.click();
              }
            }}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300",
              "hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              isDragOver && "border-primary bg-primary/10 scale-[1.01]",
              hasError && "border-destructive",
              hasFile && !hasError && "border-green-500",
              disabled && "cursor-not-allowed",
              !disabled && !isLoading && "cursor-pointer"
            )}
            onClick={() => {
              if (!disabled && !isLoading) {
                document.getElementById("profile-image-upload")?.click();
              }
            }}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Yükleniyor...
                  </span>
                </div>
              </div>
            )}

            {/* Preview or Upload UI */}
            {preview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    disabled={disabled || isLoading}
                    aria-label="Fotoğrafı kaldır"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {value?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {value && `${(value.size / 1024 / 1024).toFixed(2)} MB`}
                  </p>
                  <p
                    id="upload-instructions"
                    className="text-xs text-muted-foreground"
                  >
                    Değiştirmek için tıklayın, Enter/Space tuşuna basın veya
                    yeni dosya sürükleyin
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={cn(
                    "mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    hasError
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {hasError ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : (
                    <ImageIcon className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Profil Fotoğrafı Yükle
                  </h3>
                  <p
                    id="upload-instructions"
                    className="text-sm text-muted-foreground"
                  >
                    Dosyayı buraya sürükleyin, tıklayın veya Enter/Space tuşuna
                    basın
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG veya GIF • Maksimum 5MB
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || isLoading}
                  className="mt-4"
                  aria-describedby="upload-instructions"
                >
                  <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                  Dosya Seç
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mt-4 flex items-center gap-2 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {hasFile && !error && (
            <div
              className="mt-4 flex items-center gap-2 text-sm text-green-600"
              role="status"
            >
              <CheckCircle2
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              <span>Dosya başarıyla seçildi</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
