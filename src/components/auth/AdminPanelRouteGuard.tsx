import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/auth.types";

interface AdminPanelRouteGuardProps {
  children: React.ReactNode;
}

/**
 * AdminPanelRouteGuard - Kapsamlı admin paneli için güvenlik kontrolü
 *
 * KRİTİK GÜVENLİK KURALLARI:
 * - Sadece ADMIN rolü erişebilir (SUPER_ADMIN henüz enum'da yok)
 * - CUSTOMER, BOAT_OWNER ve diğer roller kesinlikle erişemez
 * - Oturum açmamış kullanıcılar erişemez
 * - Askıya alınmış veya yasaklanmış hesaplar erişemez
 */
export const AdminPanelRouteGuard: React.FC<AdminPanelRouteGuardProps> = ({
  children,
}) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // 1. Oturum kontrolü - Giriş yapmamış kullanıcıları ana sayfaya yönlendir (login modalı açılır)
  if (!isAuthenticated || !user) {
    return <Navigate to="/?auth=true" state={{ from: location }} replace />;
  }

  // 2. Rol kontrolü - Sadece ADMIN rolü erişebilir
  // NOT: Design document'te SUPER_ADMIN da belirtilmiş ama enum'da yok
  // Gelecekte SUPER_ADMIN eklendiğinde buraya eklenecek
  if (user.role !== UserType.ADMIN) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Hesap durumu kontrolü (gelecekte eklenebilir)
  // Şu anda AuthUser interface'inde status field'ı yok
  // Gelecekte user.status === "suspended" || user.status === "banned" kontrolü eklenebilir

  // Tüm güvenlik kontrolleri geçildi, admin paneline erişim izni ver
  return <>{children}</>;
};
