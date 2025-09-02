import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  Send,
} from "lucide-react";
import type { CaptainApplication } from "@/types/captain.types";

interface BulkOperationsPanelProps {
  selectedApplications: number[];
  applications: CaptainApplication[];
  onBulkApprove: (applicationIds: number[]) => Promise<void>;
  onBulkReject: (applicationIds: number[], reason: string) => Promise<void>;
  onSelectionChange: (selectedIds: number[]) => void;
  loading?: boolean;
}

interface BulkOperationTemplate {
  id: string;
  name: string;
  type: "approve" | "reject";
  reason?: string;
  description: string;
}

const BulkOperationsPanel: React.FC<BulkOperationsPanelProps> = ({
  selectedApplications,
  applications,
  onBulkApprove,
  onBulkReject,
  onSelectionChange,
  loading = false,
}) => {
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [operationType, setOperationType] = useState<
    "approve" | "reject" | null
  >(null);
  const [bulkReason, setBulkReason] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [sendNotifications, setSendNotifications] = useState(true);

  // Predefined rejection reason templates
  const rejectionTemplates: BulkOperationTemplate[] = [
    {
      id: "incomplete_docs",
      name: "Eksik Belgeler",
      type: "reject",
      reason:
        "Başvurunuz eksik belgeler nedeniyle reddedilmiştir. Lütfen gerekli tüm belgeleri yükleyerek yeni bir başvuru yapınız.",
      description: "Belgeler eksik veya yetersiz",
    },
    {
      id: "invalid_license",
      name: "Geçersiz Lisans",
      type: "reject",
      reason:
        "Kaptan lisansınız geçersiz veya süresi dolmuş durumda. Lütfen geçerli bir lisans ile tekrar başvuru yapınız.",
      description: "Lisans geçersiz veya süresi dolmuş",
    },
    {
      id: "insufficient_experience",
      name: "Yetersiz Deneyim",
      type: "reject",
      reason:
        "Başvurunuz yetersiz deneyim nedeniyle reddedilmiştir. Minimum deneyim şartlarını karşıladıktan sonra tekrar başvuru yapabilirsiniz.",
      description: "Deneyim şartları karşılanmıyor",
    },
    {
      id: "document_quality",
      name: "Belge Kalitesi",
      type: "reject",
      reason:
        "Yüklenen belgeler okunamaz durumda veya kalitesiz. Lütfen net ve okunabilir belgeler yükleyerek tekrar başvuru yapınız.",
      description: "Belgeler okunamaz veya kalitesiz",
    },
  ];

  const selectedApplicationsData = applications.filter((app) =>
    selectedApplications.includes(app.id)
  );

  const handleSelectAll = () => {
    const pendingApplicationIds = applications
      .filter((app) => app.status === "PENDING")
      .map((app) => app.id);

    if (selectedApplications.length === pendingApplicationIds.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(pendingApplicationIds);
    }
  };

  const handleBulkOperation = (type: "approve" | "reject") => {
    setOperationType(type);
    setBulkReason("");
    setSelectedTemplate("");
    setShowBulkModal(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = rejectionTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setBulkReason(template.reason);
    }
  };

  const handleSubmitBulkOperation = async () => {
    if (!operationType || selectedApplications.length === 0) return;

    try {
      if (operationType === "approve") {
        await onBulkApprove(selectedApplications);
      } else {
        if (!bulkReason.trim()) return;
        await onBulkReject(selectedApplications, bulkReason.trim());
      }

      setShowBulkModal(false);
      onSelectionChange([]);
    } catch (error) {
      console.error("Bulk operation failed:", error);
    }
  };

  const pendingApplications = applications.filter(
    (app) => app.status === "PENDING"
  );
  const allPendingSelected =
    pendingApplications.length > 0 &&
    selectedApplications.length === pendingApplications.length;

  return (
    <div className="space-y-4">
      {/* Selection Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Toplu İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allPendingSelected}
                  onCheckedChange={handleSelectAll}
                  disabled={pendingApplications.length === 0}
                />
                <Label className="text-sm">
                  Tümünü Seç ({pendingApplications.length} bekleyen başvuru)
                </Label>
              </div>

              {selectedApplications.length > 0 && (
                <Badge variant="outline">
                  {selectedApplications.length} seçili
                </Badge>
              )}
            </div>

            {selectedApplications.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBulkOperation("approve")}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Toplu Onayla ({selectedApplications.length})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkOperation("reject")}
                  disabled={loading}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Toplu Reddet ({selectedApplications.length})
                </Button>
              </div>
            )}
          </div>

          {/* Selected Applications Summary */}
          {selectedApplications.length > 0 && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">
                Seçili Başvurular:
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {selectedApplicationsData.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded text-sm"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="truncate">
                      #{app.id} - {app.fullName || `Kullanıcı ${app.userId}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {selectedApplications.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Toplu işlem yapmak için önce başvuruları seçin.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Toplu Onay</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Seçili başvuruları aynı anda onaylayın
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Toplu Red</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Seçili başvuruları aynı anda reddedin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Operation Modal */}
      <AdminModal
        title={`Toplu ${operationType === "approve" ? "Onay" : "Red"} İşlemi`}
        size="lg"
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      >
        <div className="space-y-6">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {selectedApplications.length} başvuru{" "}
              {operationType === "approve" ? "onaylanacak" : "reddedilecek"}. Bu
              işlem geri alınamaz.
            </AlertDescription>
          </Alert>

          {/* Selected Applications List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Seçili Başvurular:</Label>
            <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-muted">
              {selectedApplicationsData.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="text-sm">
                    #{app.id} - {app.fullName || `Kullanıcı ${app.userId}`}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {app.professionalInfo?.yearsOfExperience || 0} yıl deneyim
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {operationType === "reject" && (
            <>
              {/* Rejection Templates */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Red Nedeni Şablonları:
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rejectionTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedTemplate === template.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Reason */}
              <div className="space-y-2">
                <Label htmlFor="bulkReason">Red Nedeni *</Label>
                <Textarea
                  id="bulkReason"
                  rows={4}
                  placeholder="Red nedenini detaylı olarak açıklayın..."
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Bu mesaj tüm reddedilen başvuru sahiplerine gönderilecektir.
                </p>
              </div>
            </>
          )}

          {/* Notification Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Bildirim Seçenekleri:</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={sendNotifications}
                onCheckedChange={setSendNotifications}
              />
              <Label className="text-sm">
                Başvuru sahiplerine email bildirimi gönder
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkModal(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              variant={operationType === "approve" ? "default" : "destructive"}
              onClick={handleSubmitBulkOperation}
              disabled={
                loading ||
                (operationType === "reject" && bulkReason.trim().length < 10)
              }
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {operationType === "approve" ? "Onayla" : "Reddet"}
                </>
              )}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};

export default BulkOperationsPanel;
