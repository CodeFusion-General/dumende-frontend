import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProfileHeader from "@/components/admin/profile/ProfileHeader";
import PersonalInfoCard from "@/components/admin/profile/PersonalInfoCard";
import ProfessionalInfoCard from "@/components/admin/profile/ProfessionalInfoCard";
import StatisticsCard from "@/components/admin/profile/StatisticsCard";
import {
  mockCaptainProfile,
  mockCaptainProfileMinimal,
} from "@/mocks/captainProfile.mock";

const ProfilePage = () => {
  return (
    <SidebarProvider>
      <CaptainLayout>
        <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
          <ProfileHeader
            personalInfo={mockCaptainProfile.personalInfo}
            statistics={mockCaptainProfile.statistics}
          />

          <PersonalInfoCard
            personalInfo={mockCaptainProfile.personalInfo}
            onSave={async (data) => {
              console.log("Saving personal info:", data);
              // TODO: Implement actual save functionality
            }}
          />

          <ProfessionalInfoCard
            professionalInfo={mockCaptainProfile.professionalInfo}
            onSave={async (data) => {
              console.log("Saving professional info:", data);
              // TODO: Implement actual save functionality
            }}
          />

          <StatisticsCard statistics={mockCaptainProfile.statistics} />
        </div>
      </CaptainLayout>
    </SidebarProvider>
  );
};

export default ProfilePage;
