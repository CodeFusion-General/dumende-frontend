import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface AdminPanelBreadcrumbProps {
  items?: BreadcrumbItem[];
}

/**
 * AdminPanelBreadcrumb - Admin paneli için breadcrumb navigasyon sistemi
 *
 * Otomatik olarak URL'den breadcrumb oluşturur veya manuel items alır
 */
const AdminPanelBreadcrumb: React.FC<AdminPanelBreadcrumbProps> = ({
  items,
}) => {
  const location = useLocation();

  // URL'den otomatik breadcrumb oluştur
  const generateBreadcrumbFromPath = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split("/").filter(Boolean);

    // Admin panel path'lerini temizle
    if (pathSegments[0] === "adminPanel") {
      pathSegments.shift(); // "adminPanel" kısmını çıkar
    }

    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: "Dashboard",
        href: "/adminPanel",
        icon: <Home className="w-4 h-4" />,
      },
    ];

    // Path segment'lerini breadcrumb'a çevir
    const pathMap: Record<string, string> = {
      users: "Kullanıcı Yönetimi",
      boats: "Tekne Yönetimi",
      tours: "Tur Yönetimi",
      bookings: "Rezervasyon Yönetimi",
      payments: "Ödeme Yönetimi",
      documents: "Belge Yönetimi",
      messages: "Mesaj Yönetimi",
      "captain-applications": "Kaptan Başvuruları",
      reports: "Raporlar",
      system: "Sistem Yönetimi",
      security: "Güvenlik",
      customers: "Müşteriler",
      "boat-owners": "Tekne Sahipleri",
      admins: "Yöneticiler",
      pending: "Bekleyen",
      active: "Aktif",
      rejected: "Reddedilen",
    };

    let currentPath = "/adminPanel";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label =
        pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

      // Son segment ise href verme (aktif sayfa)
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbFromPath();

  // Sadece dashboard'da breadcrumb gösterme
  if (location.pathname === "/adminPanel") {
    return null;
  }

  return (
    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.href}
                      className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.label}</span>
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="flex items-center space-x-1 text-gray-900 font-medium">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight className="w-4 h-4" />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default AdminPanelBreadcrumb;
