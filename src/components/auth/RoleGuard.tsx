import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types/auth.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Ship, Shield, User } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: UserType[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    description: '',
    icon: <User className="w-16 h-16 text-primary mx-auto mb-4" />,
    buttonText: '',
    buttonAction: () => {}
  });

  useEffect(() => {
    // Eğer kullanıcı giriş yapmamışsa veya uygun role sahip değilse
    if (!isAuthenticated || !user || !requiredRoles.includes(user.role)) {
      
      // Hangi sayfadan geldiğini kontrol et
      const isAdminPage = location.pathname.startsWith('/admin');
      const isCaptainPage = location.pathname.startsWith('/captain');
      
      if (isAdminPage) {
        // Admin sayfası için popup
        setDialogConfig({
          title: 'Yönetici Yetkisi Gerekli',
          description: 'Bu sayfaya erişmek için yönetici yetkisine sahip olmanız gerekiyor.',
          icon: <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />,
          buttonText: 'Ana Sayfaya Dön',
          buttonAction: () => {
            setShowDialog(false);
            navigate('/');
          }
        });
      } else if (isCaptainPage) {
        // Kaptan sayfası için popup
        if (user?.role === 'CUSTOMER') {
          setDialogConfig({
            title: 'Kaptan Değilsiniz',
            description: 'Bu sayfaya erişmek için tekne sahibi olmanız gerekiyor. Tekne sahibi olmak için lütfen başvurunuzu yapın.',
            icon: <Ship className="w-16 h-16 text-blue-500 mx-auto mb-4" />,
            buttonText: 'Tekne Sahibi Başvurusu Yap',
            buttonAction: () => {
              setShowDialog(false);
              navigate('/boat-owner-application');
            }
          });
        } else {
          setDialogConfig({
            title: 'Yetkisiz Erişim',
            description: 'Bu sayfaya erişmek için tekne sahibi veya yönetici olmanız gerekiyor.',
            icon: <Ship className="w-16 h-16 text-blue-500 mx-auto mb-4" />,
            buttonText: 'Ana Sayfaya Dön',
            buttonAction: () => {
              setShowDialog(false);
              navigate('/');
            }
          });
        }
      }
      
      setShowDialog(true);
    }
  }, [isAuthenticated, user, requiredRoles, location.pathname, navigate]);

  // Eğer kullanıcı yetkili ise children'ı render et
  if (isAuthenticated && user && requiredRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Yetkisiz erişim durumunda popup göster
  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex flex-col items-center">
            {dialogConfig.icon}
            <AlertDialogTitle className="text-center text-xl">
              {dialogConfig.title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-center text-gray-600">
            {dialogConfig.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={dialogConfig.buttonAction}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {dialogConfig.buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}; 