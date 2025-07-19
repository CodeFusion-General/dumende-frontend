import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProfileErrorWrapper } from "./ProfileErrorBoundary";
import { useProfileState } from "@/hooks/useProfileState";
import { useRetry } from "@/hooks/useRetry";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import ProfessionalInfoCard from "./ProfessionalInfoCard";
import StatisticsCard from "./StatisticsCard";
import {
  PersonalInfo,
  ProfessionalInfo,
  CaptainStatistics,
  PersonalInfoFormData,
  ProfessionalInfoFormData,
} from "@/types/profile.types";

// Mock data service - replace with actual API calls
const mockProfileService = {
  async loadProfile(): Promise<{
    personalInfo: PersonalInfo;
    professionalInfo: ProfessionalInfo;
    statistics: CaptainStatistics;
  }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate occasional failures for testing
    if (Math.random() < 0.2) {
      throw new Error("Network error: Failed to load profile data");
    }

    return {
      personalInfo: {
        firstName: "Ahmet",
        lastName: "Yılmaz",
        email: "ahmet.yilmaz@dumende.com",
        phone: "+90 532 123 4567",
        profilePhoto: "/images/captain-avatar.jpg",
        dateOfBirth: "1985-03-15",
        address: {
          street: "Barbaros Bulvarı No: 123",
          city: "İstanbul",
          district: "Beşiktaş",
          postalCode: "34353",
          country: "Turkey",
        },
      },
      professionalInfo: {
        licenseNumber: "TR-CAP-2019-001234",
        licenseExpiry: "2025-12-31",
        yearsOfExperience: 8,
        certifications: [
          {
            id: "1",
            name: "Yacht Master",
            issuer: "RYA",
            issueDate: "2019-06-15",
            expiryDate: "2024-06-15",
            certificateNumber: "YM-2019-001234",
          },
          {
            id: "2",
            name: "First Aid",
            issuer: "Red Cross",
            issueDate: "2023-01-20",
            expiryDate: "2025-01-20",
            certificateNumber: "FA-2023-005678",
          },
        ],
        specializations: ["Luxury Yachts", "Sailing", "Deep Sea Fishing"],
        bio: "Deneyimli kaptan olarak 8 yıldır İstanbul Boğazı ve Ege Denizi'nde tur hizmeti vermekteyim. Müşteri memnuniyeti ve güvenlik önceliğimdir.",
      },
      statistics: {
        totalTours: 156,
        averageRating: 4.8,
        totalReviews: 142,
        completionRate: 98.5,
        yearsActive: 5,
        totalRevenue: 125000,
        repeatCustomers: 45,
      },
    };
  },

  async savePersonalInfo(data: PersonalInfoFormData): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate occasional failures
    if (Math.random() < 0.15) {
      throw new Error("Failed to save personal information");
    }
  },

  async saveProfessionalInfo(data: ProfessionalInfoFormData): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate occasional failures
    if (Math.random() < 0.15) {
      throw new Error("Failed to save professional information");
    }
  },
};

const EnhancedProfilePage: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [professionalInfo, setProfessionalInfo] =
    useState<ProfessionalInfo | null>(null);
  const [statistics, setStatistics] = useState<CaptainStatistics | null>(null);

  const { state, actions, operations } = useProfileState();
  const { executeWithRetry } = useRetry({
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
  });

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const result = await operations.loadProfile(async () => {
      const data = await mockProfileService.loadProfile();
      setPersonalInfo(data.personalInfo);
      setProfessionalInfo(data.professionalInfo);
      setStatistics(data.statistics);
      return data;
    });

    if (result) {
      actions.setInitialLoading(false);
    }
  };

  const handleRetryLoadProfile = async () => {
    actions.reset();
    actions.setInitialLoading(true);
    await loadProfileData();
  };

  const handleSavePersonalInfo = async (data: PersonalInfoFormData) => {
    await operations.saveProfile(async () => {
      await mockProfileService.savePersonalInfo(data);

      // Update local state with new data
      if (personalInfo) {
        const updatedInfo: PersonalInfo = {
          ...personalInfo,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth || undefined,
          address: {
            street: data.street || "",
            city: data.city,
            district: data.district || "",
            postalCode: data.postalCode || "",
            country: data.country,
          },
        };
        setPersonalInfo(updatedInfo);
      }
    }, "Kişisel bilgiler başarıyla güncellendi");
  };

  const handleSaveProfessionalInfo = async (data: ProfessionalInfoFormData) => {
    await operations.saveProfile(async () => {
      await mockProfileService.saveProfessionalInfo(data);

      // Update local state with new data
      if (professionalInfo) {
        const updatedInfo: ProfessionalInfo = {
          ...professionalInfo,
          licenseNumber: data.licenseNumber,
          licenseExpiry: data.licenseExpiry,
          yearsOfExperience: data.yearsOfExperience,
          specializations: data.specializations,
          bio: data.bio || undefined,
        };
        setProfessionalInfo(updatedInfo);
      }
    }, "Mesleki bilgiler başarıyla güncellendi");
  };

  const handleRetryStatistics = async () => {
    await executeWithRetry(async () => {
      const data = await mockProfileService.loadProfile();
      setStatistics(data.statistics);
    });
  };

  // Show error state if initial loading failed
  if (state.hasError && state.isInitialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Profil Yüklenemedi
            </h2>
            <p className="text-red-600 mb-4">
              Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar
              deneyin.
            </p>
            <button
              onClick={handleRetryLoadProfile}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              disabled={state.isLoading}
            >
              {state.isLoading ? "Yükleniyor..." : "Tekrar Dene"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProfileErrorWrapper componentName="Enhanced Profile Page">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e50] mb-2">
              Profil Bilgileri
            </h1>
            <p className="text-gray-600">
              Kişisel ve mesleki bilgilerinizi görüntüleyin ve düzenleyin.
            </p>
          </div>

          {/* Profile Header */}
          <ProfileHeader
            personalInfo={personalInfo || undefined}
            statistics={statistics || undefined}
            isLoading={state.isInitialLoading}
            onRetry={handleRetryLoadProfile}
          />

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information Card */}
            <PersonalInfoCard
              personalInfo={personalInfo || undefined}
              onSave={handleSavePersonalInfo}
              isLoading={state.isInitialLoading}
              onRetry={handleRetryLoadProfile}
            />

            {/* Professional Information Card */}
            <ProfessionalInfoCard
              professionalInfo={professionalInfo || undefined}
              onSave={handleSaveProfessionalInfo}
              isLoading={state.isInitialLoading}
              onRetry={handleRetryLoadProfile}
            />
          </div>

          {/* Statistics Card */}
          <StatisticsCard
            statistics={statistics || undefined}
            isLoading={state.isInitialLoading}
            onRetry={handleRetryStatistics}
          />

          {/* Loading Indicator */}
          {(state.isLoading ||
            state.isSaving ||
            state.isUploading ||
            state.isRetrying) && (
            <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#3498db]"></div>
              <span className="text-sm text-gray-600">
                {state.isSaving && "Kaydediliyor..."}
                {state.isUploading && "Yükleniyor..."}
                {state.isRetrying && "Tekrar deneniyor..."}
                {state.isLoading &&
                  !state.isSaving &&
                  !state.isUploading &&
                  !state.isRetrying &&
                  "Yükleniyor..."}
              </span>
            </div>
          )}
        </div>
      </div>
    </ProfileErrorWrapper>
  );
};

export default EnhancedProfilePage;
