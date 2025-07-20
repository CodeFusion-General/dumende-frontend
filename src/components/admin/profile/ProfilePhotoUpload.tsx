import React, { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { User, Camera, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { captainProfileService } from "@/services/captainProfile.service";

interface ProfilePhotoUploadProps {
  currentPhoto?: string;
  userName: string;
  onPhotoChange?: (file: File | null, previewUrl: string | null) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
  currentPhoto,
  userName,
  onPhotoChange,
  className,
  size = "md",
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  // Size configurations
  const sizeConfig = {
    sm: {
      avatar: "h-16 w-16",
      button: "h-6 w-6",
      icon: "h-3 w-3",
    },
    md: {
      avatar: "h-24 w-24 md:h-32 md:w-32",
      button: "h-8 w-8",
      icon: "h-4 w-4",
    },
    lg: {
      avatar: "h-32 w-32 md:h-40 md:w-40",
      button: "h-10 w-10",
      icon: "h-5 w-5",
    },
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Sadece JPEG, PNG ve WebP formatları desteklenmektedir.";
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return "Dosya boyutu 5MB'dan küçük olmalıdır.";
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "Geçersiz Dosya",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Create preview URL for immediate feedback
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    await uploadPhotoToBackend(file);
  };

  const uploadPhotoToBackend = async (file: File) => {
    try {
      const response = await captainProfileService.uploadProfilePhoto(file);

      // Call parent callback with backend URL
      onPhotoChange?.(file, response.photoUrl);

      toast({
        title: "Fotoğraf Yüklendi",
        description: "Profil fotoğrafınız başarıyla güncellendi.",
      });
    } catch (error) {
      // Reset preview on error
      setPreviewUrl(null);

      toast({
        title: "Hata",
        description:
          error instanceof Error ? error.message : "Fotoğraf yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async () => {
    if (disabled) return;

    try {
      await captainProfileService.removeProfilePhoto();

      setPreviewUrl(null);
      onPhotoChange?.(null, null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Fotoğraf Kaldırıldı",
        description: "Profil fotoğrafınız kaldırıldı.",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Fotoğraf kaldırılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const displayPhoto = previewUrl || currentPhoto;
  const initials = userName
    .split(" ")
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("relative inline-block", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Avatar with upload overlay */}
      <div className="relative group">
        <Avatar
          className={cn(
            sizeConfig[size].avatar,
            "ring-4 ring-[#3498db]/10 transition-all duration-200",
            !disabled && "group-hover:ring-[#3498db]/20 cursor-pointer"
          )}
          onClick={handleUploadClick}
        >
          <AvatarImage
            src={displayPhoto}
            alt={`${userName} profil fotoğrafı`}
            className="object-cover"
          />
          <AvatarFallback className="bg-[#3498db] text-white font-semibold">
            {displayPhoto ? (
              <User className={cn(sizeConfig[size].icon, "opacity-50")} />
            ) : (
              <span className="text-lg">{initials}</span>
            )}
          </AvatarFallback>
        </Avatar>

        {/* Upload overlay */}
        {!disabled && (
          <div
            className={cn(
              "absolute inset-0 bg-black/50 rounded-full flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
            )}
            onClick={handleUploadClick}
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : (
              <Camera className="h-6 w-6 text-white" />
            )}
          </div>
        )}

        {/* Upload button */}
        {!disabled && (
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "absolute -bottom-1 -right-1 rounded-full shadow-lg",
              "bg-white hover:bg-gray-50 border-2 border-white",
              sizeConfig[size].button
            )}
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            <Upload className={sizeConfig[size].icon} />
          </Button>
        )}

        {/* Remove button - only show if there's a photo and not uploading */}
        {!disabled && displayPhoto && !isUploading && (
          <Button
            size="icon"
            variant="destructive"
            className={cn(
              "absolute -top-1 -right-1 rounded-full shadow-lg",
              sizeConfig[size].button
            )}
            onClick={handleRemovePhoto}
          >
            <X className={sizeConfig[size].icon} />
          </Button>
        )}
      </div>

      {/* Upload instructions */}
      {!disabled && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Fotoğrafa tıklayarak değiştirin
          </p>
          <p className="text-xs text-gray-400">JPEG, PNG, WebP • Max 5MB</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoUpload;
