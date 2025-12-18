import React from "react";
import AdminPanelSidebar from "./AdminPanelSidebar";
import AdminPanelHeader from "./AdminPanelHeader";
import AdminPanelBreadcrumb, { BreadcrumbItem } from "./AdminPanelBreadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminPanelLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  noPadding?: boolean;
}

/**
 * AdminPanelLayout - Kapsamlı admin paneli için ana layout bileşeni
 *
 * Özellikler:
 * - Sidebar navigasyon
 * - Üst header bar
 * - Breadcrumb navigasyon
 * - Responsive tasarım
 * - Hızlı eylem butonları desteği
 */
const AdminPanelLayout: React.FC<AdminPanelLayoutProps> = ({
  children,
  title,
  breadcrumbs,
  actions,
  noPadding = false,
}) => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        {/* Sidebar */}
        <AdminPanelSidebar />

        {/* Ana içerik alanı */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminPanelHeader title={title} actions={actions} />

          {/* Breadcrumb */}
          <AdminPanelBreadcrumb items={breadcrumbs} />

          {/* Ana içerik */}
          <main
            className={`flex-1 ${noPadding ? "" : "p-6"} ${
              isMobile && !noPadding ? "pb-20" : ""
            }`}
          >
            <div className={`${noPadding ? "" : "max-w-[1400px] mx-auto"}`}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPanelLayout;
