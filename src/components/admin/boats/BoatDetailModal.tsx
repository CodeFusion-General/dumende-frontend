import React, { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { BoatDocumentManager } from "./BoatDocumentManager";
import {
  AdminBoatView,
  BoatOwnerInfo,
  BoatDocumentManagement,
} from "@/types/adminBoat";
import { useAdminBoatManagement } from "@/hooks/useAdminBoatManagement";
import {
  Ship,
  User,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Star,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";

interface BoatDetailModalProps {
  boat: AdminBoatView;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (boatId: number, reason?: string) => void;
  onReject: (boatId: number, reason: string) => void;
}

export const BoatDetailModal: React.FC<BoatDetailModalProps> = ({
  boat,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const { getBoatOwnerInfo, getBoatDocuments } = useAdminBoatManagement();

  const [activeTab, setActiveTab] = useState("details");
  const [ownerInfo, setOwnerInfo] = useState<BoatOwnerInfo | null>(null);
  const [documentManagement, setDocumentManagement] =
    useState<BoatDocumentManagement | null>(null);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoadingOwner, setIsLoadingOwner] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);

  // Load additional data when modal opens
  useEffect(() => {
    if (isOpen && boat) {
      loadOwnerInfo();
      loadDocumentManagement();
    }
  }, [isOpen, boat]);

  const loadOwnerInfo = async () => {
    try {
      setIsLoadingOwner(true);
      const info = await getBoatOwnerInfo(boat.ownerId);
      setOwnerInfo(info);
    } catch (error) {
      console.error("Error loading owner info:", error);
      toast.error("Sahip bilgileri yüklenemedi");
    } finally {
      setIsLoadingOwner(false);
    }
  };

  const loadDocumentManagement = async () => {
    try {
      setIsLoadingDocuments(true);
      const docs = await getBoatDocuments(boat.id);
      setDocumentManagement(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Belge bilgileri yüklenemedi");
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const handleApprove = () => {
    onApprove(boat.id, approvalReason || undefined);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Red sebebi zorunludur");
      return;
    }
    onReject(boat.id, rejectionReason);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      case "pending":
        return <Badge variant="secondary">Onay Bekliyor</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentStatusBadge = (
    status: "all_verified" | "pending" | "expired" | "missing"
  ) => {
    switch (status) {
      case "all_verified":
        return (
          <Badge className="bg-green-100 text-green-800">
            Tüm Belgeler Onaylı
          </Badge>
        );
      case "pending":
        return <Badge variant="secondary">Bekleyen Belgeler Var</Badge>;
      case "expired":
        return <Badge variant="destructive">Süresi Dolmuş Belgeler Var</Badge>;
      case "missing":
        return <Badge variant="outline">Belge Yok</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminModal
      title={`Tekne Detayları - ${boat.name}`}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
      actions={
        boat.approvalStatus === "pending"
          ? [
              {
                label: "Reddet",
                variant: "destructive",
                onClick: handleReject,
                disabled: !rejectionReason.trim(),
              },
              {
                label: "Onayla",
                variant: "default",
                onClick: handleApprove,
              },
            ]
          : []
      }
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Ship className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{boat.name}</h2>
              <p className="text-gray-500">
                {boat.type} • {boat.location}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                {getStatusBadge(boat.approvalStatus)}
                {documentManagement &&
                  getDocumentStatusBadge(documentManagement.verificationStatus)}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₺{boat.dailyPrice.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">günlük</div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Tekne Detayları</TabsTrigger>
            <TabsTrigger value="owner">Sahip Bilgileri</TabsTrigger>
            <TabsTrigger value="documents">Belgeler</TabsTrigger>
            <TabsTrigger value="approval">Onay İşlemleri</TabsTrigger>
          </TabsList>

          {/* Boat Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Ship className="h-5 w-5" />
                    <span>Temel Bilgiler</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Model:</span>
                    <span className="font-medium">
                      {boat.model || "Belirtilmemiş"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Yıl:</span>
                    <span className="font-medium">
                      {boat.year || "Belirtilmemiş"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Uzunluk:</span>
                    <span className="font-medium">
                      {boat.length ? `${boat.length}m` : "Belirtilmemiş"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kapasite:</span>
                    <span className="font-medium flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {boat.capacity} kişi
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kaptan Dahil:</span>
                    <span className="font-medium">
                      {boat.captainIncluded ? "Evet" : "Hayır"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Fiyatlandırma</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Günlük Fiyat:</span>
                    <span className="font-medium text-green-600">
                      ₺{boat.dailyPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Saatlik Fiyat:</span>
                    <span className="font-medium text-green-600">
                      ₺{boat.hourlyPrice.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Location Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Konum Bilgileri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Lokasyon:</span>
                    <span className="font-medium">{boat.location}</span>
                  </div>
                  {boat.latitude && boat.longitude && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Enlem:</span>
                        <span className="font-medium">{boat.latitude}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Boylam:</span>
                        <span className="font-medium">{boat.longitude}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5" />
                    <span>İstatistikler</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ortalama Puan:</span>
                    <span className="font-medium flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      {boat.bookingStats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Toplam Rezervasyon:</span>
                    <span className="font-medium">
                      {boat.bookingStats.totalBookings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bu Ay Rezervasyon:</span>
                    <span className="font-medium">
                      {boat.bookingStats.thisMonthBookings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Toplam Gelir:</span>
                    <span className="font-medium text-green-600">
                      ₺{boat.bookingStats.revenue.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {boat.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Açıklama</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {boat.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {boat.features && boat.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Özellikler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {boat.features.map((feature) => (
                      <Badge key={feature.id} variant="outline">
                        {feature.featureName}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            {boat.images && boat.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fotoğraflar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {boat.images.map((image) => (
                      <div key={image.id} className="relative">
                        <img
                          src={image.imageUrl}
                          alt={`${boat.name} - ${image.displayOrder}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {image.isPrimary && (
                          <Badge className="absolute top-2 left-2 bg-blue-600">
                            Ana Fotoğraf
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Owner Information Tab */}
          <TabsContent value="owner" className="space-y-4">
            {isLoadingOwner ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : ownerInfo ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Sahip Bilgileri</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ad Soyad:</span>
                        <span className="font-medium">
                          {ownerInfo.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">E-posta:</span>
                        <span className="font-medium flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {ownerInfo.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Telefon:</span>
                        <span className="font-medium flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {ownerInfo.phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Üyelik Tarihi:</span>
                        <span className="font-medium">
                          {new Date(ownerInfo.joinDate).toLocaleDateString(
                            "tr-TR"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Toplam Tekne:</span>
                        <span className="font-medium">
                          {ownerInfo.totalBoats}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Aktif Tekne:</span>
                        <span className="font-medium">
                          {ownerInfo.activeBoats}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Toplam Gelir:</span>
                        <span className="font-medium text-green-600">
                          ₺{ownerInfo.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Ortalama Puan:</span>
                        <span className="font-medium flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          {ownerInfo.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-500">
                Sahip bilgileri yüklenemedi
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {isLoadingDocuments ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : documentManagement ? (
              <BoatDocumentManager
                boatId={boat.id}
                documentManagement={documentManagement}
                onDocumentUpdate={loadDocumentManagement}
              />
            ) : (
              <div className="text-center text-gray-500">
                Belge bilgileri yüklenemedi
              </div>
            )}
          </TabsContent>

          {/* Approval Actions Tab */}
          <TabsContent value="approval" className="space-y-4">
            {boat.approvalStatus === "pending" ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span>Tekneyi Onayla</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="approval-reason">
                        Onay Notu (İsteğe Bağlı)
                      </Label>
                      <Textarea
                        id="approval-reason"
                        placeholder="Onay ile ilgili not ekleyebilirsiniz..."
                        value={approvalReason}
                        onChange={(e) => setApprovalReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span>Tekneyi Reddet</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="rejection-reason">Red Sebebi *</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Red sebebini detaylı olarak açıklayın..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    {boat.approvalStatus === "approved" ? (
                      <>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Tekne Onaylandı
                          </h3>
                          <p className="text-gray-500">
                            Bu tekne{" "}
                            {boat.approvalDate
                              ? new Date(boat.approvalDate).toLocaleDateString(
                                  "tr-TR"
                                )
                              : ""}{" "}
                            tarihinde onaylandı.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-12 w-12 text-red-500" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Tekne Reddedildi
                          </h3>
                          <p className="text-gray-500">
                            Bu tekne daha önce reddedilmiş.
                          </p>
                          {boat.rejectionReason && (
                            <div className="mt-2 p-3 bg-red-50 rounded-lg">
                              <p className="text-sm text-red-700">
                                <strong>Red Sebebi:</strong>{" "}
                                {boat.rejectionReason}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminModal>
  );
};
