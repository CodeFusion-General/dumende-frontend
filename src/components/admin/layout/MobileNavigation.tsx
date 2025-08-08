
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Clock, MessageSquare, ClipboardList, MoreHorizontal } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerTrigger,
} from '@/components/ui/drawer';

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const MobileNavigation = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Navigation items for the bottom bar
  const mainNavItems: NavItem[] = [
    { label: 'Müsaitlik', path: '/captain/availability', icon: <Clock size={20} /> },
    { label: 'Tur Müsaitlik', path: '/captain/tour-availability', icon: <Clock size={20} /> },
    { label: 'Mesajlar', path: '/captain/messages', icon: <MessageSquare size={20} /> },
    { label: 'Rezervasyonlar', path: '/captain/reservations', icon: <ClipboardList size={20} /> },
  ];

  // Navigation items for the "More" drawer
  const moreNavItems: NavItem[] = [
    { label: 'Anasayfa', path: '/captain', icon: <Clock size={20} /> },
    { label: 'Taşıtlarım', path: '/captain/vessels', icon: <Clock size={20} /> },
    { label: 'Turlarım', path: '/captain/tours', icon: <Clock size={20} /> },
    // Fiyatlar kaldırıldı
    { label: 'Finans', path: '/captain/finance', icon: <Clock size={20} /> },
    { label: 'Şirket', path: '/captain/company', icon: <Clock size={20} /> },
    { label: 'Profil', path: '/captain/profile', icon: <Clock size={20} /> },
    { label: 'Puanlarım', path: '/captain/ratings', icon: <Clock size={20} /> },
    { label: 'Güvenlik', path: '/captain/security', icon: <Clock size={20} /> },
    { label: 'Çıkış Yap', path: '/captain/logout', icon: <Clock size={20} /> },
  ];

  // Only render on mobile devices
  if (!isMobile) return null;

  const isActive = (path: string) => location.pathname === path;

  // Use bottom sheet (drawer) on mobile, side sheet on larger screens
  const MoreMenu = () => (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center justify-center h-full rounded-none px-2"
        >
          <MoreHorizontal 
            size={24} 
            className={isActive('/captain/more') ? 'text-[#00bfa5]' : 'text-[#000000e6]'} 
          />
          <span className="text-xs mt-1">Diğer</span>
        </Button>
      </DrawerTrigger>
      <DrawerPortal>
        <DrawerOverlay />
        <DrawerContent className="h-[85vh] max-h-[85vh] rounded-t-[16px]">
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-4 text-center">Menü</h3>
            <div className="grid gap-2">
              {moreNavItems.map((item) => (
                <DrawerClose key={item.path} asChild>
                  <Link
                    to={item.path}
                    className={`flex items-center p-3 rounded-md ${
                      isActive(item.path)
                        ? 'bg-[#00bfa5]/10 text-[#00bfa5]'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                </DrawerClose>
              ))}
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 flex items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {mainNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="flex flex-col items-center justify-center flex-1 h-full text-left"
        >
          <span className={isActive(item.path) ? 'text-[#00bfa5]' : 'text-[#000000e6]'}>
            {item.icon}
          </span>
          <span className={`text-xs mt-1 ${isActive(item.path) ? 'text-[#00bfa5]' : 'text-[#000000e6]'}`}>
            {item.label}
          </span>
        </Link>
      ))}
      <div className="flex flex-1 h-full">
        <MoreMenu />
      </div>
    </div>
  );
};

export default MobileNavigation;
