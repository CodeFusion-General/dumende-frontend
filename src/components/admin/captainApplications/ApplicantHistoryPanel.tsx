import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Ship,
  MapPin,
  Star,
} from "lucide-react";

interface ApplicantHistory {
  userId: number;
  previousApplications: {
    id: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
    rejectionReason?: string;
  }[];
  userActivity: {
    registrationDate: string;
    lastLoginDate?: string;
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating?: number;
    totalReviews: number;
  };
  boatOwnerHistory?: {
    totalBoats: number;
    activeBoats: number;
    totalTours: number;
    activeTours: number;
    totalRevenue: number;
    averageRating?: number;
  };
  verificationHistory: {
    documentType: string;
    status: "verified" | "pending" | "rejected";
    verifiedAt?: string;
    verifiedBy?: string;
    notes?: string;
  }[];
  riskFactors: {
    factor: string;
    level: "low" | "medium" | "high";
    description: string;
  }[];
}

interface ApplicantHistoryPanelProps {
  userId: number;
  applicationId: number;
}

const ApplicantHistoryPanel: React.FC<ApplicantHistoryPanelProps> = ({
  userId,
  applicationId,
}) => {
  const [history, setHistory] = useState<ApplicantHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApplicantHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real application, this would be an API call
      // For now, we'll generate mock data based on the userId
      const mockHistory: ApplicantHistory = {
        userId,
        previousApplications: [
          {
            id: applicationId,
            status: "PENDING",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        userActivity: {
          registrationDate: "2023-06-15T10:30:00Z",
          lastLoginDate: "2024-12-30T14:22:00Z",
          totalBookings: 12,
          completedBookings: 10,
          cancelledBookings: 2,
          averageRating: 4.6,
          totalReviews: 8,
        },
        boatOwnerHistory: {
          totalBoats: 2,
          activeBoats: 2,
          totalTours: 15,
          activeTours: 12,
          totalRevenue: 45000,
          averageRating: 4.8,
        },
        verificationHistory: [
          {
            documentType: "Kimlik Belgesi",
            status: "verified",
            verifiedAt: "2023-06-16T09:15:00Z",
            verifiedBy: "Admin User",
            notes: "Belge doğrulandı",
          },
          {
            documentType: "Adres Belgesi",
            status: "verified",
            verifiedAt: "2023-06-16T09:20:00Z",
            verifiedBy: "Admin User",
          },
        ],
        riskFactors: [
          {
            factor: "Yeni Kullanıcı",
            level: "medium",
            description: "Hesap 1.5 yıllık, orta düzey güvenilirlik",
          },
          {
            factor: "Yüksek Değerlendirme",
            level: "low",
            description: "4.6/5 ortalama değerlendirme, güvenilir kullanıcı",
          },
        ],
      };

      setHistory(mockHistory);
    } catch (e: any) {
      setError(e?.message || "Geçmiş bilgiler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicantHistory();
  }, [userId, applicationId]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-muted-foreground">
            Başvuran geçmişi yükleniyor...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!history) {
    return (
      <Alert>
        <AlertDescription>Başvuran geçmişi bulunamadı</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Kullanıcı Aktivite Özeti
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Kayıt Tarihi</div>
              <div className="font-medium">
                {new Date(
                  history.userActivity.registrationDate
                ).toLocaleDateString("tr-TR")}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Son Giriş</div>
              <div className="font-medium">
                {history.userActivity.lastLoginDate
                  ? new Date(
                      history.userActivity.lastLoginDate
                    ).toLocaleDateString("tr-TR")
                  : "Bilinmiyor"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Toplam Rezervasyon
              </div>
              <div className="font-medium">
                {history.userActivity.totalBookings}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tamamlanan</div>
              <div className="font-medium text-green-600">
                {history.userActivity.completedBookings}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">İptal Edilen</div>
              <div className="font-medium text-red-600">
                {history.userActivity.cancelledBookings}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Ortalama Değerlendirme
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-medium">
                  {history.userActivity.averageRating?.toFixed(1) || "N/A"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({history.userActivity.totalReviews} değerlendirme)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Boat Owner History (if applicable) */}
      {history.boatOwnerHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Tekne Sahibi Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Toplam Tekne
                </div>
                <div className="font-medium">
                  {history.boatOwnerHistory.totalBoats}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Aktif Tekne</div>
                <div className="font-medium text-green-600">
                  {history.boatOwnerHistory.activeBoats}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Toplam Tur</div>
                <div className="font-medium">
                  {history.boatOwnerHistory.totalTours}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Aktif Tur</div>
                <div className="font-medium text-green-600">
                  {history.boatOwnerHistory.activeTours}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Toplam Gelir
                </div>
                <div className="font-medium text-blue-600">
                  ₺
                  {history.boatOwnerHistory.totalRevenue.toLocaleString(
                    "tr-TR"
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Ortalama Değerlendirme
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium">
                    {history.boatOwnerHistory.averageRating?.toFixed(1) ||
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Önceki Başvurular
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.previousApplications.length > 0 ? (
            <div className="space-y-3">
              {history.previousApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(app.status)}
                    <div>
                      <div className="font-medium">Başvuru #{app.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        app.status === "APPROVED"
                          ? "default"
                          : app.status === "REJECTED"
                          ? "destructive"
                          : "secondary"
                      }
                      className={
                        app.status === "APPROVED" ? "bg-green-600" : ""
                      }
                    >
                      {app.status === "APPROVED" && "Onaylandı"}
                      {app.status === "REJECTED" && "Reddedildi"}
                      {app.status === "PENDING" && "Beklemede"}
                    </Badge>
                    {app.rejectionReason && (
                      <div className="text-xs text-muted-foreground mt-1 max-w-48 truncate">
                        {app.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              Önceki başvuru bulunamadı
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Verification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Belge Doğrulama Geçmişi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.verificationHistory.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">{doc.documentType}</div>
                    {doc.verifiedAt && (
                      <div className="text-sm text-muted-foreground">
                        {new Date(doc.verifiedAt).toLocaleDateString("tr-TR")} -{" "}
                        {doc.verifiedBy}
                      </div>
                    )}
                    {doc.notes && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {doc.notes}
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant={
                    doc.status === "verified"
                      ? "default"
                      : doc.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                  className={doc.status === "verified" ? "bg-green-600" : ""}
                >
                  {doc.status === "verified" && "Doğrulandı"}
                  {doc.status === "rejected" && "Reddedildi"}
                  {doc.status === "pending" && "Beklemede"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Risk Faktörleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.riskFactors.map((risk, index) => (
              <div
                key={index}
                className={`p-3 border rounded-lg ${getRiskColor(risk.level)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{risk.factor}</div>
                  <Badge
                    variant="outline"
                    className={`border-current ${
                      risk.level === "low"
                        ? "text-green-600"
                        : risk.level === "medium"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {risk.level === "low" && "Düşük"}
                    {risk.level === "medium" && "Orta"}
                    {risk.level === "high" && "Yüksek"}
                  </Badge>
                </div>
                <div className="text-sm">{risk.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicantHistoryPanel;
