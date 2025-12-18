import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  User,
  Ship,
  FileCheck,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Activity {
  id: string;
  type: "user" | "boat" | "document" | "payment" | "message" | "system";
  title: string;
  description: string;
  timestamp: Date;
  status: "success" | "warning" | "error" | "info";
  entityId?: string;
  entityName?: string;
}

interface RecentActivitiesProps {
  activities?: Activity[];
  loading?: boolean;
  maxItems?: number;
}

/**
 * RecentActivities - Son aktiviteleri gösteren bileşen
 *
 * Dashboard'da son sistem aktivitelerini listeler.
 */
const RecentActivities: React.FC<RecentActivitiesProps> = ({
  activities = [],
  loading = false,
  maxItems = 10,
}) => {
  // Mock data - gerçek implementasyonda API'den gelecek
  const mockActivities: Activity[] = [
    {
      id: "1",
      type: "boat",
      title: "Tekne Onaylandı",
      description: "Deniz Yıldızı teknesi onaylandı",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
      status: "success",
      entityId: "boat-123",
      entityName: "Deniz Yıldızı",
    },
    {
      id: "2",
      type: "user",
      title: "Yeni Kullanıcı Kaydı",
      description: "Ahmet Yılmaz platformda kayıt oldu",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
      status: "info",
      entityId: "user-456",
      entityName: "Ahmet Yılmaz",
    },
    {
      id: "3",
      type: "document",
      title: "Belge Doğrulama Talebi",
      description: "Kaptan belgesi doğrulama bekliyor",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 saat önce
      status: "warning",
      entityId: "doc-789",
      entityName: "Kaptan Belgesi",
    },
    {
      id: "4",
      type: "payment",
      title: "Ödeme Başarısız",
      description: "Rezervasyon ödemesi başarısız oldu",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 saat önce
      status: "error",
      entityId: "payment-101",
      entityName: "Rezervasyon #1234",
    },
    {
      id: "5",
      type: "message",
      title: "Yeni Mesaj",
      description: "Müşteri destek talebi gönderdi",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 saat önce
      status: "info",
      entityId: "message-202",
      entityName: "Destek Talebi",
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4" />;
      case "boat":
        return <Ship className="w-4 h-4" />;
      case "document":
        return <FileCheck className="w-4 h-4" />;
      case "payment":
        return <CreditCard className="w-4 h-4" />;
      case "message":
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default:
        return <Clock className="w-3 h-3 text-blue-500" />;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Son Aktiviteler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Son Aktiviteler
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {limitedActivities.length} aktivite
        </Badge>
      </CardHeader>
      <CardContent>
        {limitedActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Henüz aktivite bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {limitedActivities.map((activity) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors hover:shadow-sm ${getStatusColor(
                  activity.status
                )}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(activity.status)}
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.description}
                  </p>
                  {activity.entityName && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {activity.entityName}
                    </Badge>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(activity.timestamp, {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
