// Example usage and testing scenarios for ProfileHeader component
import ProfileHeader from "./ProfileHeader";
import {
  mockCaptainProfile,
  mockCaptainProfileMinimal,
  mockCaptainProfileExperienced,
  mockCaptainProfileNewbie,
} from "@/mocks/captainProfile.mock";

// Example 1: Full profile with all data
export const FullProfile = () => (
  <ProfileHeader
    personalInfo={mockCaptainProfile.personalInfo}
    statistics={mockCaptainProfile.statistics}
  />
);

// Example 2: Minimal profile (no photo, minimal address)
export const MinimalProfile = () => (
  <ProfileHeader
    personalInfo={mockCaptainProfileMinimal.personalInfo}
    statistics={mockCaptainProfileMinimal.statistics}
  />
);

// Example 3: Experienced captain
export const ExperiencedProfile = () => (
  <ProfileHeader
    personalInfo={mockCaptainProfileExperienced.personalInfo}
    statistics={mockCaptainProfileExperienced.statistics}
  />
);

// Example 4: New captain
export const NewCaptainProfile = () => (
  <ProfileHeader
    personalInfo={mockCaptainProfileNewbie.personalInfo}
    statistics={mockCaptainProfileNewbie.statistics}
  />
);

// Example 5: Profile without photo
export const ProfileWithoutPhoto = () => {
  const personalInfoWithoutPhoto = {
    ...mockCaptainProfile.personalInfo,
    profilePhoto: undefined,
  };

  return (
    <ProfileHeader
      personalInfo={personalInfoWithoutPhoto}
      statistics={mockCaptainProfile.statistics}
    />
  );
};

// Example 6: Profile with very long name (testing truncation)
export const ProfileWithLongName = () => {
  const personalInfoWithLongName = {
    ...mockCaptainProfile.personalInfo,
    firstName: "Mehmet Ahmet Süleyman",
    lastName: "Yılmaz Özkan Demir",
  };

  return (
    <ProfileHeader
      personalInfo={personalInfoWithLongName}
      statistics={mockCaptainProfile.statistics}
    />
  );
};
