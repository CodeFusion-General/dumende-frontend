import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserType } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles: UserType[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles, 
  fallbackPath = '/' 
}) => {
  const { user, isAuthenticated } = useAuth();

  // Eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Eğer kullanıcının rolü gerekli roller arasında değilse anasayfaya yönlendir
  if (!user || !requiredRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Eğer her şey tamam ise children'ı render et
  return <>{children}</>;
}; 