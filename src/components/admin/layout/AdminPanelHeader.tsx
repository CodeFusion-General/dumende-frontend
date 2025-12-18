import React from "react";
import { Bell, Search, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AdminPanelHeaderProps {
  title?: string;
  actions?: React.ReactNode;
}

/**
 * AdminPanelHeader - Admin paneli için üst bar bileşeni
 *
 * Özellikler:
 * - Sayfa başlığı
 * - Arama çubuğu
 * - Bildirim merkezi
 * - Kullanıcı profil dropdown'u
 * - Hızlı eylem butonları
 */
const AdminPanelHeader: React.FC<AdminPanelHeaderProps> = ({
  title = "Admin Panel",
  actions,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/my-profile");
  };

  const handleSettingsClick = () => {
    navigate("/adminPanel/system");
  };

  // Kullanıcının baş harflerini al
  const getUserInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.username?.charAt(0).toUpperCase() || "A";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Sol taraf - Başlık */}
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Orta - Arama çubuğu */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Kullanıcı, tekne, tur ara..."
            className="pl-10 pr-4 py-2 w-full"
          />
        </div>
      </div>

      {/* Sağ taraf - Eylemler ve kullanıcı menüsü */}
      <div className="flex items-center space-x-4">
        {/* Özel eylem butonları */}
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}

        {/* Bildirimler */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs p-0"
          >
            3
          </Badge>
        </Button>

        {/* Kullanıcı Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user?.profileImage}
                  alt={user?.fullName || user?.username || "Admin"}
                />
                <AvatarFallback className="bg-[#15847c] text-white">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || user?.username}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
                <Badge variant="secondary" className="w-fit text-xs mt-1">
                  {user?.role === "ADMIN" ? "Yönetici" : user?.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Ayarlar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminPanelHeader;
