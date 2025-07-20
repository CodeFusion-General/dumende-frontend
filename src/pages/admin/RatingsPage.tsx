import React from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import RatingsContainer from "@/components/admin/ratings/RatingsContainer";

const RatingsPage: React.FC = () => {
  return (
    <CaptainLayout>
      <RatingsContainer />
    </CaptainLayout>
  );
};

export default RatingsPage;