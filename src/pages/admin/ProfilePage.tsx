import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
import EnhancedProfilePage from "@/components/admin/profile/EnhancedProfilePage";

const ProfilePage = () => {
  return (
    <SidebarProvider>
      <CaptainLayout>
        <EnhancedProfilePage />
      </CaptainLayout>
    </SidebarProvider>
  );
};

export default ProfilePage;
