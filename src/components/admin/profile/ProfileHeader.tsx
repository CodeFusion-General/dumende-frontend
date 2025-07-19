import React from "react";
import { Badge } from "@/components/ui/badge";
import { PersonalInfo, CaptainStatistics } from "@/types/profile.types";
import { Star, MapPin } from "lucide-react";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import { ProfileHeaderSkeleton } from "./ProfileLoadingSkeletons";
import { ProfileCardErrorBoundary } from "./ProfileErrorBoundary";

interface ProfileHeaderProps {
  personalInfo?: PersonalInfo;
  statistics?: CaptainStatistics;
  isLoading?: boolean;
  onRetry?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  personalInfo,
  statistics,
  isLoading = false,
  onRetry,
}) => {
  // Show loading skeleton if loading or data is missing
  if (isLoading || !personalInfo || !statistics) {
    return <ProfileHeaderSkeleton />;
  }

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`;
  const location = personalInfo.address
    ? `${personalInfo.address.city}, ${personalInfo.address.country}`
    : "";

  return (
    <ProfileCardErrorBoundary cardName="Profil Başlığı" onRetry={onRetry}>
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
          {/* Profile Photo Section */}
          <div className="flex-shrink-0 self-center lg:self-start">
            <ProfilePhotoUpload
              currentPhoto={personalInfo.profilePhoto}
              userName={fullName}
              size="md"
              onPhotoChange={(file, previewUrl) => {
                // TODO: Handle photo upload in parent component
                console.log("Photo changed:", { file, previewUrl });
              }}
            />
          </div>

          {/* Basic Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4">
              <div className="min-w-0 flex-1">
                <h1
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2c3e50] text-center lg:text-left"
                  aria-label={`Kaptan ${fullName} profil başlığı`}
                >
                  {fullName}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center lg:justify-start gap-2 mt-2">
                  {location && (
                    <div className="flex items-center justify-center lg:justify-start text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center lg:justify-start gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                      <span className="font-medium">
                        {statistics.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 ml-1 hidden sm:inline">
                        ({statistics.totalReviews} değerlendirme)
                      </span>
                      <span className="text-gray-500 ml-1 sm:hidden">
                        ({statistics.totalReviews})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-3">
                  <Badge
                    variant="secondary"
                    className="bg-[#3498db]/10 text-[#3498db] hover:bg-[#3498db]/20 text-xs sm:text-sm"
                  >
                    {statistics.yearsActive} yıl aktif
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 hover:bg-green-200 text-xs sm:text-sm"
                  >
                    {statistics.totalTours} tur tamamlandı
                  </Badge>
                </div>
              </div>

              {/* Contact Info - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-2 sm:gap-4 text-sm bg-gray-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
                <div className="text-gray-600 text-center lg:text-left">
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 break-all">{personalInfo.email}</span>
                </div>
                <div className="text-gray-600 text-center lg:text-left">
                  <span className="font-medium">Telefon:</span>
                  <span className="ml-2">{personalInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Row - Mobile Responsive */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100"
          role="region"
          aria-label="Kaptan istatistikleri"
        >
          <div className="text-center bg-blue-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
            <div
              className="text-lg sm:text-2xl font-bold text-[#2c3e50]"
              aria-label={`${statistics.totalTours} toplam tur`}
            >
              {statistics.totalTours}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Toplam Tur</div>
          </div>
          <div className="text-center bg-yellow-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
            <div
              className="text-lg sm:text-2xl font-bold text-[#2c3e50]"
              aria-label={`${statistics.averageRating.toFixed(
                1
              )} ortalama puan`}
            >
              {statistics.averageRating.toFixed(1)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Ortalama Puan
            </div>
          </div>
          <div className="text-center bg-green-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
            <div
              className="text-lg sm:text-2xl font-bold text-[#2c3e50]"
              aria-label={`${statistics.completionRate.toFixed(
                1
              )} yüzde tamamlama oranı`}
            >
              {statistics.completionRate.toFixed(1)}%
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              Tamamlama Oranı
            </div>
          </div>
          <div className="text-center bg-purple-50 p-3 rounded-lg lg:bg-transparent lg:p-0">
            <div
              className="text-lg sm:text-2xl font-bold text-[#2c3e50]"
              aria-label={`${statistics.yearsActive} yıl deneyim`}
            >
              {statistics.yearsActive}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Yıl Deneyim</div>
          </div>
        </div>
      </div>
    </ProfileCardErrorBoundary>
  );
};

export default ProfileHeader;
