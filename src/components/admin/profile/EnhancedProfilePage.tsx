import React, { useState, useEffect } from "react";
import { ProfileErrorWrapper } from "./ProfileErrorBoundary";
import { useProfileState } from "@/hooks/useProfileState";
import { useRetry } from "@/hooks/useRetry";
import ProfileHeader from "./ProfileHeader";
import PersonalInfoCard from "./PersonalInfoCard";
import ProfessionalInfoCard from "./ProfessionalInfoCard";
import StatisticsCard from "./StatisticsCard";
import { captainProfileService } from "@/services/captainProfile.service";
import {
  PersonalInfo,
  ProfessionalInfo,
  CaptainStatistics,
  PersonalInfoFormData,
  ProfessionalInfoFormData,
} from "@/types/profile.types";

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
      const profile = await captainProfileService.getCaptainProfile();
      setPersonalInfo(profile.personalInfo);
      setProfessionalInfo(profile.professionalInfo);
      setStatistics(profile.statistics);
      return profile;
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
      const updatedInfo = await captainProfileService.updatePersonalInfo(data);
      setPersonalInfo(updatedInfo);
    }, "Kişisel bilgiler başarıyla güncellendi");
  };

  const handleSaveProfessionalInfo = async (data: ProfessionalInfoFormData) => {
    await operations.saveProfile(async () => {
      const updatedInfo = await captainProfileService.updateProfessionalInfo(data);
      setProfessionalInfo(updatedInfo);
    }, "Mesleki bilgiler başarıyla güncellendi");
  };

  const handleRetryStatistics = async () => {
    await executeWithRetry(async () => {
      const statisticsData = await captainProfileService.getStatistics();
      setStatistics(statisticsData);
    });
  };

  // Show error state if initial loading failed
  if (state.hasError && state.isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Profil Yüklenemedi
          </h2>
          <p className="text-red-600 mb-4">
            Profil bilgileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
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
    );
  }

  return (
    <ProfileErrorWrapper componentName="Enhanced Profile Page">
      <div className="space-y-6">
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
    </ProfileErrorWrapper>
  );
};

export default EnhancedProfilePage;
