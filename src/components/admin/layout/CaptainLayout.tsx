
import React from 'react';
import CaptainSidebar from './CaptainSidebar';
import MobileNavigation from './MobileNavigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface CaptainLayoutProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

const CaptainLayout: React.FC<CaptainLayoutProps> = ({ children, noPadding = false }) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CaptainSidebar />
        <div className="flex-1 relative transition-all duration-300 ease-in-out">
          {/* Only add padding-top for regular content, not full-page content */}
          <main className={`w-full h-full ${noPadding ? '' : 'pt-16 p-6 bg-[#f8f9fa] max-w-[1400px] mx-auto'} ${isMobile && !noPadding ? 'pb-20' : ''}`}>
            {children}
          </main>
        </div>
        <MobileNavigation />
      </div>
    </SidebarProvider>
  );
};

export default CaptainLayout;
