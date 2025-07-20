import React from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import RatingsContainer from "@/components/admin/ratings/RatingsContainer";
import { useAuth } from "@/contexts/AuthContext";

const RatingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <CaptainLayout>
      <RatingsContainer ownerId={user?.id} />
    </CaptainLayout>
  );
};

export default RatingsPage;