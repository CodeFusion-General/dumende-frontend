import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Ship,
  Map,
  ClipboardList,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
} from "lucide-react";

interface QuickAction {
  title: string;
  icon: React.ReactNode;
  color: string;
  path: string;
  description?: string;
}

/**
 * QuickActions - Dashboard hızlı eylem butonları bileşeni
 *
 * Admin panelindeki ana sayfalara hızlı erişim sağlar.
 */
const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const quickActions: QuickAction[] = [
    {
      title: "Kullanıcı Yönetimi",
      icon: <Users className="w-8 h-8" />,
      color: "text-blue-600",
      path: "/adminPanel/users",
      description: "Kullanıcıları görüntüle ve yönet",
    },
    {
      title: "Tekne Onayları",
      icon: <Ship className="w-8 h-8" />,
      color: "text-green-600",
      path: "/adminPanel/boats/pending",
      description: "Bekleyen tekne başvurularını onayla",
    },
    {
      title: "Tur Yönetimi",
      icon: <Map className="w-8 h-8" />,
      color: "text-purple-600",
      path: "/adminPanel/tours",
      description: "Turları görüntüle ve yönet",
    },
    {
      title: "Rezervasyonlar",
      icon: <ClipboardList className="w-8 h-8" />,
      color: "text-orange-600",
      path: "/adminPanel/bookings",
      description: "Rezervasyonları yönet",
    },
    {
      title: "Ödeme Yönetimi",
      icon: <CreditCard className="w-8 h-8" />,
      color: "text-emerald-600",
      path: "/adminPanel/payments",
      description: "Ödemeleri ve finansları yönet",
    },
    {
      title: "Belge Doğrulama",
      icon: <FileText className="w-8 h-8" />,
      color: "text-red-600",
      path: "/adminPanel/documents",
      description: "Belgeleri doğrula ve yönet",
    },
    {
      title: "Mesaj Yönetimi",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "text-indigo-600",
      path: "/adminPanel/messages",
      description: "Mesajları moderasyon yap",
    },
    {
      title: "Sistem Ayarları",
      icon: <Settings className="w-8 h-8" />,
      color: "text-gray-600",
      path: "/adminPanel/system",
      description: "Sistem ayarlarını yönet",
    },
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Hızlı Eylemler
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
            onClick={() => handleActionClick(action.path)}
          >
            <CardContent className="p-4 text-center">
              <div
                className={`${action.color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-200`}
              >
                {action.icon}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {action.title}
              </p>
              {action.description && (
                <p className="text-xs text-gray-500">{action.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
