import React from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import MessagesContainer from "@/components/admin/messages/MessagesContainer";

const MessagesPage = () => {

  return (
    <CaptainLayout noPadding>
      <MessagesContainer />
    </CaptainLayout>
  );
};

export default MessagesPage;
