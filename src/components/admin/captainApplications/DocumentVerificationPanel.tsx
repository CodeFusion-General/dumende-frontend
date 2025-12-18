import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import {
  FileText,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Clock,
  Zoom,
} from "lucide-react";

interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  filePath: string;
  uploadedAt: string;
  size: number;
  status: "pending" | "verified" | "rejected";
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  expiryDate?: string;
  isRequired: boolean;
}

interface DocumentVerificationPanelProps {
  documents: string[];
  applicationId: number;
  onDocumentVerified?: (
    documentPath: string,
    status: "verified" | "rejected",
    notes?: string
  ) => void;
}

const DocumentVerificationPanel: React.FC<DocumentVerificationPanelProps> = ({
  documents,
  applicationId,
  onDocumentVerified,
}) => {
  const [selectedDocument, setSelectedDocument] = useState<DocumentInfo | null>(
    null
  );
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState<
    "verify" | "reject" | null
  >(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Convert file paths to document info objects
  const documentInfos: DocumentInfo[] = documents.map((path, index) => {
    const fileName = path.split("/").pop() || `Belge ${index + 1}`;
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

    // Determine document type based on filename
    let type = "Diğer";
    if (
      fileName.toLowerCase().includes("lisans") ||
      fileName.toLowerCase().includes("license")
    ) {
      type = "Kaptan Lisansı";
    } else if (
      fileName.toLowerCase().includes("kimlik") ||
      fileName.toLowerCase().includes("id")
    ) {
      type = "Kimlik Belgesi";
    } else if (
      fileName.toLowerCase().includes("diploma") ||
      fileName.toLowerCase().includes("certificate")
    ) {
      type = "Diploma/Sertifika";
    } else if (
      fileName.toLowerCase().includes("saglik") ||
      fileName.toLowerCase().includes("health")
    ) {
      type = "Sağlık Raporu";
    }

    return {
      id: `doc_${index}`,
      name: fileName,
      type,
      filePath: path,
      uploadedAt: new Date().toISOString(), // Mock data
      size: Math.floor(Math.random() * 5000000) + 100000, // Mock size
      status: "pending" as const,
      isRequired: true,
      expiryDate: type === "Kaptan Lisansı" ? "2025-12-31" : undefined,
    };
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "Kaptan Lisansı":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "Kimlik Belgesi":
        return <User className="w-5 h-5 text-green-600" />;
      case "Sağlık Raporu":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: DocumentInfo["status"]) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600">Doğrulandı</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      case "pending":
        return <Badge variant="secondary">Beklemede</Badge>;
    }
  };

  const isDocumentExpired = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isDocumentExpiringSoon = (expiryDate?: string): boolean => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    return expiry < thirtyDaysFromNow && expiry > now;
  };

  const handleViewDocument = (document: DocumentInfo) => {
    // In a real application, this would open the document in a viewer
    window.open(
      `/api/captain-applications/${applicationId}/documents?file=${encodeURIComponent(
        document.filePath
      )}`,
      "_blank"
    );
  };

  const handleDownloadDocument = (document: DocumentInfo) => {
    // In a real application, this would download the document
    const link = document.createElement("a");
    link.href = `/api/captain-applications/${applicationId}/documents?file=${encodeURIComponent(
      document.filePath
    )}&download=true`;
    link.download = document.name;
    link.click();
  };

  const handleVerificationAction = (
    document: DocumentInfo,
    action: "verify" | "reject"
  ) => {
    setSelectedDocument(document);
    setVerificationAction(action);
    setVerificationNotes("");
    setShowVerificationModal(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedDocument || !verificationAction) return;

    try {
      setLoading(true);

      // In a real application, this would call the API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay

      onDocumentVerified?.(
        selectedDocument.filePath,
        verificationAction,
        verificationNotes.trim() || undefined
      );

      setShowVerificationModal(false);
      setSelectedDocument(null);
      setVerificationAction(null);
      setVerificationNotes("");
    } catch (error) {
      console.error("Verification failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Belge Doğrulama ({documentInfos.length} belge)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documentInfos.length > 0 ? (
            <div className="space-y-4">
              {documentInfos.map((document) => (
                <div key={document.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getDocumentTypeIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {document.name}
                          </h4>
                          {document.isRequired && (
                            <Badge variant="outline" className="text-xs">
                              Zorunlu
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-4">
                            <span>Tür: {document.type}</span>
                            <span>Boyut: {formatFileSize(document.size)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Yükleme:{" "}
                              {new Date(document.uploadedAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </div>
                          {document.expiryDate && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>
                                Son Geçerlilik:{" "}
                                {new Date(
                                  document.expiryDate
                                ).toLocaleDateString("tr-TR")}
                              </span>
                              {isDocumentExpired(document.expiryDate) && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  Süresi Dolmuş
                                </Badge>
                              )}
                              {isDocumentExpiringSoon(document.expiryDate) &&
                                !isDocumentExpired(document.expiryDate) && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-yellow-600 border-yellow-600"
                                  >
                                    Yakında Dolacak
                                  </Badge>
                                )}
                            </div>
                          )}
                        </div>

                        {/* Verification Status */}
                        <div className="mt-3 flex items-center gap-2">
                          {getStatusBadge(document.status)}
                          {document.verifiedBy && (
                            <span className="text-xs text-muted-foreground">
                              {document.verifiedBy} tarafından
                            </span>
                          )}
                          {document.verifiedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(document.verifiedAt).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          )}
                        </div>

                        {/* Verification Notes */}
                        {document.verificationNotes && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Not:</strong> {document.verificationNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>

                      {document.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              handleVerificationAction(document, "verify")
                            }
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleVerificationAction(document, "reject")
                            }
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Henüz belge yüklenmemiş</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Verification Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Doğrulama Özeti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documentInfos.filter((d) => d.status === "verified").length}
              </div>
              <div className="text-sm text-muted-foreground">Doğrulandı</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documentInfos.filter((d) => d.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Beklemede</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {documentInfos.filter((d) => d.status === "rejected").length}
              </div>
              <div className="text-sm text-muted-foreground">Reddedildi</div>
            </div>
          </div>

          {/* Warnings */}
          {documentInfos.some(
            (d) =>
              isDocumentExpired(d.expiryDate) ||
              isDocumentExpiringSoon(d.expiryDate)
          ) && (
            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {documentInfos.filter((d) => isDocumentExpired(d.expiryDate))
                  .length > 0 && <div>Süresi dolmuş belgeler var!</div>}
                {documentInfos.filter((d) =>
                  isDocumentExpiringSoon(d.expiryDate)
                ).length > 0 && <div>Yakında süresi dolacak belgeler var!</div>}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <AdminModal
        title={`Belge ${
          verificationAction === "verify" ? "Doğrula" : "Reddet"
        }`}
        size="md"
        open={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                {getDocumentTypeIcon(selectedDocument.type)}
                <div>
                  <div className="font-medium">{selectedDocument.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDocument.type}
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Bu belgeyi{" "}
                {verificationAction === "verify" ? "doğrulamak" : "reddetmek"}{" "}
                üzeresiniz.
                {verificationAction === "reject" &&
                  " Lütfen red nedenini belirtin."}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="verificationNotes">
                {verificationAction === "verify"
                  ? "Doğrulama Notu (İsteğe bağlı)"
                  : "Red Nedeni *"}
              </Label>
              <Textarea
                id="verificationNotes"
                rows={3}
                placeholder={
                  verificationAction === "verify"
                    ? "Belge ile ilgili notlarınızı yazın..."
                    : "Red nedenini detaylı olarak açıklayın..."
                }
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVerificationModal(false)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                variant={
                  verificationAction === "verify" ? "default" : "destructive"
                }
                onClick={handleSubmitVerification}
                disabled={
                  loading ||
                  (verificationAction === "reject" &&
                    verificationNotes.trim().length < 5)
                }
              >
                {loading
                  ? "İşleniyor..."
                  : verificationAction === "verify"
                  ? "Doğrula"
                  : "Reddet"}
              </Button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
};

export default DocumentVerificationPanel;
