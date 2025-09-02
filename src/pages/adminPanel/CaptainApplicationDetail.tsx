import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import StatCard from "@/components/admin/ui/StatCard";
import ApplicantHistoryPanel from "@/components/admin/captainApplications/ApplicantHistoryPanel";
import DocumentVerificationPanel from "@/components/admin/captainApplications/DocumentVerificationPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  Award,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Shield,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Building,
  History,
  Search,
} from "lucide-react";
import { captainApplicationService } from "@/services/captainApplicationService";
import type { CaptainApplication } from "@/types/captain.types";

interface ApplicationTimeline {
  id: string;
  date: string;
  action: string;
  description: string;
  adminName?: string;
  type:
    | "created"
    | "updated"
    | "approved"
    | "rejected"
    | "document_added"
    | "note_added";
}

interface RiskAssessment {
  score: number;
  level: "low" | "medium" | "high";
  factors: {
    licenseExpiry: number;
    experienceLevel: number;
    documentCompleteness: number;
    applicationAge: number;
  };
  recommendations: string[];
}

interface DocumentVerificationHistory {
  documentName: string;
  status: "pending" | "verified" | "rejected";
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

const CaptainApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<CaptainApplication | null>(
    null
  );
  const [timeline, setTimeline] = useState<ApplicationTimeline[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [documentHistory, setDocumentHistory] = useState<
    DocumentVerificationHistory[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadApplicationDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const app = await captainApplicationService.getById(Number(id));
      setApplication(app);

      // Generate mock timeline (in real app, this would come from backend)
      generateTimeline(app);

      // Calculate risk assessment
      calculateRiskAssessment(app);

      // Generate document verification history
      generateDocumentHistory(app);
    } catch (e: any) {
      setError(e?.message || "Başvuru detayları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = (app: CaptainApplication) => {
    const timeline: ApplicationTimeline[] = [
      {
        id: "1",
        date: app.createdAt,
        action: "Başvuru Oluşturuldu",
        description: "Kaptan başvurusu sisteme kaydedildi",
        type: "created",
      },
    ];

    if (app.documentFilePaths?.length) {
      timeline.push({
        id: "2",
        date: app.createdAt,
        action: "Belgeler Yüklendi",
        description: `${app.documentFilePaths.length} belge yüklendi`,
        type: "document_added",
      });
    }

    if (app.status === "APPROVED") {
      timeline.push({
        id: "3",
        date: app.updatedAt,
        action: "Başvuru Onaylandı",
        description: "Başvuru admin tarafından onaylandı",
        adminName: "Admin User",
        type: "approved",
      });
    } else if (app.status === "REJECTED") {
      timeline.push({
        id: "3",
        date: app.updatedAt,
        action: "Başvuru Reddedildi",
        description: app.rejectionReason || "Başvuru reddedildi",
        adminName: "Admin User",
        type: "rejected",
      });
    }

    setTimeline(
      timeline.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const calculateRiskAssessment = (app: CaptainApplication) => {
    const now = new Date();
    const createdDate = new Date(app.createdAt);
    const daysSinceCreated = Math.floor(
      (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // License expiry score (0-100)
    let licenseScore = 100;
    if (app.professionalInfo?.licenseExpiry) {
      const expiryDate = new Date(app.professionalInfo.licenseExpiry);
      const daysUntilExpiry = Math.floor(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry < 30) licenseScore = 20;
      else if (daysUntilExpiry < 90) licenseScore = 60;
      else if (daysUntilExpiry < 180) licenseScore = 80;
    }

    // Experience score (0-100)
    const experience = app.professionalInfo?.yearsOfExperience || 0;
    const experienceScore = Math.min(experience * 10, 100);

    // Document completeness score (0-100)
    const documentScore = (app.documentFilePaths?.length || 0) * 25; // Assuming 4 required docs

    // Application age score (0-100) - newer is better
    const ageScore = Math.max(100 - daysSinceCreated * 5, 0);

    // Overall risk score
    const overallScore =
      (licenseScore + experienceScore + documentScore + ageScore) / 4;

    let level: "low" | "medium" | "high";
    if (overallScore >= 80) level = "low";
    else if (overallScore >= 60) level = "medium";
    else level = "high";

    const recommendations: string[] = [];
    if (licenseScore < 60)
      recommendations.push(
        "Lisans süresi yakında dolacak - acil kontrol gerekli"
      );
    if (experienceScore < 50)
      recommendations.push(
        "Deneyim seviyesi düşük - ek değerlendirme önerilir"
      );
    if (documentScore < 75)
      recommendations.push("Eksik belgeler var - tamamlanması gerekli");
    if (ageScore < 50)
      recommendations.push("Eski başvuru - öncelikli işlem gerekli");

    setRiskAssessment({
      score: Math.round(overallScore),
      level,
      factors: {
        licenseExpiry: licenseScore,
        experienceLevel: experienceScore,
        documentCompleteness: documentScore,
        applicationAge: ageScore,
      },
      recommendations,
    });
  };

  const generateDocumentHistory = (app: CaptainApplication) => {
    const history: DocumentVerificationHistory[] = [];

    app.documentFilePaths?.forEach((path, index) => {
      const fileName = path.split("/").pop() || `Belge ${index + 1}`;
      history.push({
        documentName: fileName,
        status: "verified", // Mock status
        verifiedBy: "Admin User",
        verifiedAt: app.updatedAt,
        notes: "Belge doğrulandı ve uygun bulundu",
      });
    });

    setDocumentHistory(history);
  };

  useEffect(() => {
    loadApplicationDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;

    try {
      setActionLoading(true);
      await captainApplicationService.review(Number(id), {
        status: "APPROVED",
      });
      await loadApplicationDetail();
    } catch (e: any) {
      setError(e?.message || "Onay işlemi başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason.trim()) return;

    try {
      setActionLoading(true);
      await captainApplicationService.review(Number(id), {
        status: "REJECTED",
        rejectionReason: rejectReason.trim(),
      });
      setShowRejectModal(false);
      setRejectReason("");
      await loadApplicationDetail();
    } catch (e: any) {
      setError(e?.message || "Red işlemi başarısız");
    } finally {
      setActionLoading(false);
    }
  };

  const downloadDocument = (filePath: string) => {
    // In real app, this would generate a signed URL
    window.open(
      `/api/captain-applications/${id}/documents?file=${encodeURIComponent(
        filePath
      )}`,
      "_blank"
    );
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTimelineIcon = (type: ApplicationTimeline["type"]) => {
    switch (type) {
      case "created":
        return <User className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "document_added":
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AdminPanelLayout title="Başvuru Detayı">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Yükleniyor...</div>
        </div>
      </AdminPanelLayout>
    );
  }

  if (!application) {
    return (
      <AdminPanelLayout title="Başvuru Detayı">
        <Alert variant="destructive">
          <AlertDescription>Başvuru bulunamadı</AlertDescription>
        </Alert>
      </AdminPanelLayout>
    );
  }

  return (
    <AdminPanelLayout
      title={`Başvuru Detayı #${application.id}`}
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        {
          label: "Kaptan Başvuruları",
          href: "/adminPanel/captain-applications",
        },
        {
          label: `Başvuru #${application.id}`,
          href: `/adminPanel/captain-applications/${application.id}`,
        },
      ]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          {application.status === "PENDING" && (
            <>
              <Button onClick={handleApprove} disabled={actionLoading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Onayla
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reddet
              </Button>
            </>
          )}
        </div>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Detaylar
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Belgeler
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Geçmiş
              </TabsTrigger>
              <TabsTrigger
                value="verification"
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                İnceleme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Başvuran Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Ad Soyad
                      </Label>
                      <p className="text-lg font-semibold">
                        {application.fullName || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Kullanıcı ID
                      </Label>
                      <p className="text-lg">{application.userId}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Telefon
                      </Label>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {application.phoneNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Durum
                      </Label>
                      <div className="mt-1">
                        {application.status === "PENDING" && (
                          <Badge variant="secondary">Beklemede</Badge>
                        )}
                        {application.status === "APPROVED" && (
                          <Badge className="bg-green-600">Onaylandı</Badge>
                        )}
                        {application.status === "REJECTED" && (
                          <Badge variant="destructive">Reddedildi</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {application.rejectionReason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <Label className="text-sm font-medium text-red-800">
                        Red Nedeni
                      </Label>
                      <p className="text-red-700 mt-1">
                        {application.rejectionReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Mesleki Bilgiler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Lisans Numarası
                      </Label>
                      <p className="text-lg font-mono">
                        {application.professionalInfo?.licenseNumber || "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Lisans Bitiş Tarihi
                      </Label>
                      <p className="text-lg">
                        {application.professionalInfo?.licenseExpiry
                          ? new Date(
                              application.professionalInfo.licenseExpiry
                            ).toLocaleDateString("tr-TR")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Deneyim
                      </Label>
                      <p className="text-lg">
                        {application.professionalInfo?.yearsOfExperience || 0}{" "}
                        yıl
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Uzmanlık Alanları
                      </Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {application.professionalInfo?.specializations?.map(
                          (spec, index) => (
                            <Badge key={index} variant="outline">
                              {spec}
                            </Badge>
                          )
                        ) || <span className="text-muted-foreground">-</span>}
                      </div>
                    </div>
                  </div>

                  {application.professionalInfo?.bio && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Biyografi
                      </Label>
                      <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {application.professionalInfo.bio}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Information */}
              {application.company && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Şirket Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Şirket Adı
                        </Label>
                        <p className="text-lg">
                          {application.company.legalName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Vergi Numarası
                        </Label>
                        <p className="text-lg font-mono">
                          {application.company.taxNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Yetkili Kişi
                        </Label>
                        <p className="text-lg">
                          {application.company.authorizedPerson}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          IBAN
                        </Label>
                        <p className="text-lg font-mono">
                          {application.company.iban}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Belgeler ({application.documentFilePaths?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {application.documentFilePaths?.length ? (
                    <div className="space-y-3">
                      {application.documentFilePaths.map((path, index) => {
                        const fileName =
                          path.split("/").pop() || `Belge ${index + 1}`;
                        const history = documentHistory.find(
                          (h) => h.documentName === fileName
                        );

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium">{fileName}</p>
                                {history && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant={
                                        history.status === "verified"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={
                                        history.status === "verified"
                                          ? "bg-green-600"
                                          : ""
                                      }
                                    >
                                      {history.status === "verified"
                                        ? "Doğrulandı"
                                        : "Beklemede"}
                                    </Badge>
                                    {history.verifiedBy && (
                                      <span className="text-xs text-muted-foreground">
                                        {history.verifiedBy} tarafından
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadDocument(path)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadDocument(path)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Henüz belge yüklenmemiş
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <DocumentVerificationPanel
                documents={application.documentFilePaths || []}
                applicationId={application.id}
                onDocumentVerified={(documentPath, status, notes) => {
                  console.log("Document verified:", {
                    documentPath,
                    status,
                    notes,
                  });
                  // In a real app, this would update the application state
                }}
              />
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <ApplicantHistoryPanel
                userId={application.userId}
                applicationId={application.id}
              />
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detaylı İnceleme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        Bu bölümde başvurunun tüm detayları incelenir ve karar
                        verilir.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Başvuru Durumu
                        </Label>
                        <div className="p-3 border rounded-lg">
                          {application.status === "PENDING" && (
                            <Badge variant="secondary">Beklemede</Badge>
                          )}
                          {application.status === "APPROVED" && (
                            <Badge className="bg-green-600">Onaylandı</Badge>
                          )}
                          {application.status === "REJECTED" && (
                            <Badge variant="destructive">Reddedildi</Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          İşlem Tarihi
                        </Label>
                        <div className="p-3 border rounded-lg">
                          {new Date(application.updatedAt).toLocaleDateString(
                            "tr-TR"
                          )}
                        </div>
                      </div>
                    </div>

                    {application.rejectionReason && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Red Nedeni
                        </Label>
                        <div className="p-3 border rounded-lg bg-red-50 border-red-200">
                          {application.rejectionReason}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Risk Assessment */}
          {riskAssessment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Risk Değerlendirmesi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                      riskAssessment.level
                    )}`}
                  >
                    {riskAssessment.level === "low" && "Düşük Risk"}
                    {riskAssessment.level === "medium" && "Orta Risk"}
                    {riskAssessment.level === "high" && "Yüksek Risk"}
                  </div>
                  <p className="text-2xl font-bold mt-2">
                    {riskAssessment.score}/100
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lisans Durumu</span>
                      <span>
                        {Math.round(riskAssessment.factors.licenseExpiry)}
                      </span>
                    </div>
                    <Progress value={riskAssessment.factors.licenseExpiry} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Deneyim Seviyesi</span>
                      <span>
                        {Math.round(riskAssessment.factors.experienceLevel)}
                      </span>
                    </div>
                    <Progress value={riskAssessment.factors.experienceLevel} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Belge Tamamlama</span>
                      <span>
                        {Math.round(
                          riskAssessment.factors.documentCompleteness
                        )}
                      </span>
                    </div>
                    <Progress
                      value={riskAssessment.factors.documentCompleteness}
                    />
                  </div>
                </div>

                {riskAssessment.recommendations.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium">Öneriler</Label>
                    <ul className="mt-2 space-y-1">
                      {riskAssessment.recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <AlertTriangle className="w-3 h-3 mt-0.5 text-yellow-600 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                İşlem Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {getTimelineIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleString("tr-TR")}
                        </span>
                        {item.adminName && (
                          <Badge variant="outline" className="text-xs">
                            {item.adminName}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
            <StatCard
              title="Başvuru Yaşı"
              value={`${Math.floor(
                (Date.now() - new Date(application.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )} gün`}
              icon={<Calendar className="w-4 h-4" />}
              color="blue"
            />
            <StatCard
              title="Belge Sayısı"
              value={application.documentFilePaths?.length || 0}
              icon={<FileText className="w-4 h-4" />}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <AdminModal
        title="Başvuruyu Reddet"
        size="md"
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
      >
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              Bu başvuru reddedilecek. Red nedeni başvurana iletilecektir.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="rejectReason">Red Nedeni *</Label>
            <Textarea
              id="rejectReason"
              rows={4}
              placeholder="Lütfen red nedenini detaylı olarak açıklayın..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
              disabled={actionLoading}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={actionLoading || rejectReason.trim().length < 5}
            >
              {actionLoading ? "İşleniyor..." : "Reddet"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </AdminPanelLayout>
  );
};

export default CaptainApplicationDetail;
