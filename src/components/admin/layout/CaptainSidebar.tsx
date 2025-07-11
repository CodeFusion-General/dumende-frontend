
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  Map,
  Calendar,
  Clock,
  MessageSquare,
  DollarSign,
  ClipboardList,
  Building,
  User,
  Star,
  Shield,
  LogOut,
  Menu,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const CaptainSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  const menuItems = [
    { label: 'Anasayfa', icon: <LayoutDashboard size={20} />, path: '/captain' },
    { label: 'Taşıtlarım', icon: <Ship size={20} />, path: '/captain/vessels' },
    { label: 'Tekne Turlarım', icon: <Map size={20} />, path: '/captain/tours' },
    { label: 'Müsaitlik', icon: <Clock size={20} />, path: '/captain/availability' },
    { label: 'Mesajlar', icon: <MessageSquare size={20} />, path: '/captain/messages' },
    { label: 'Takvim', icon: <Calendar size={20} />, path: '/captain/calendar' },
    { label: 'Tekne Turu Takvimi', icon: <Calendar size={20} />, path: '/captain/tour-calendar' },
    { label: 'Fiyatlar', icon: <DollarSign size={20} />, path: '/captain/pricing' },
    { label: 'Finans', icon: <DollarSign size={20} />, path: '/captain/finance' },
    { label: 'Rezervasyonlar', icon: <ClipboardList size={20} />, path: '/captain/bookings' },
    { label: 'Şirket', icon: <Building size={20} />, path: '/captain/company' },
    { label: 'Profil', icon: <User size={20} />, path: '/captain/profile' },
    { label: 'Puanlarım', icon: <Star size={20} />, path: '/captain/ratings' },
    { label: 'Güvenlik', icon: <Shield size={20} />, path: '/captain/security' },
    { label: 'Çıkış Yap', icon: <LogOut size={20} />, path: '/captain/logout' },
  ];

  return (
    <Sidebar className={`${isCollapsed ? 'w-[60px]' : ''} transition-all duration-300 ease-in-out`}>
      <SidebarHeader className={`p-4 border-b border-gray-700 bg-[#2c3e50] flex items-center justify-between ${isCollapsed ? 'px-2 py-4' : ''}`}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="text-xl font-bold text-white">
              dümende<span className="text-[#15847c]">.kaptan</span>
            </div>
            <SidebarTrigger 
              className="text-white ml-2"
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            />
          </div>
        ) : (
          <SidebarTrigger 
            className="text-white mx-auto"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          />
        )}
      </SidebarHeader>
      
      <SidebarContent className="bg-[#2c3e50] text-white h-full overflow-y-auto">
        <nav className={`flex-1 ${isCollapsed ? 'pt-2' : 'pt-4'}`}>
          <ul className={`space-y-1 ${isCollapsed ? 'px-1' : 'px-2'}`}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              if (isCollapsed) {
                return (
                  <li key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to={item.path}
                          className={`flex justify-center items-center p-2 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-[#15847c] text-white' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                          aria-label={item.label}
                        >
                          <span>{item.icon}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                      isActive 
                        ? 'bg-[#15847c] text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    aria-label={item.label}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </SidebarContent>
      
      <SidebarFooter className={`p-4 border-t border-gray-700 bg-[#2c3e50] text-xs text-gray-400 ${isCollapsed ? 'px-1 py-2 text-center' : ''}`}>
        {!isCollapsed && <p>© 2025 dümende</p>}
      </SidebarFooter>
    </Sidebar>
  );
};

export default CaptainSidebar;
