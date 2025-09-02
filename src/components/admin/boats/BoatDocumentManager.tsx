import React, { useState } from "react";
import { BoatDocumentManagement } from "@/types/adminBoat";
import { BoatDocumentDTO } from "@/types/document.types";
import { documentService } from "@/services/documentService";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Download,
  Calendar,
  User,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface BoatDocumentManagerProps {
  boatId: number;
  documentManagement: BoatDocumentManagement;
  onDocumentUpdate: () => void;
}

interface DocumentViewerModalProps {
  document: BoatDocumentDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentVerificationModalProps {
  document: BoatDocumentDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onVerify: (documentId: number, verified: boolean, notes?: string) => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document.documentName}</DialogTitle>
          <DialogDescription>
            {document.documentType} • Yükleme Tarihi:{" "}
            {new Date(document.uploadDate).toLocaleDateString("tr-TR")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Document Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Dosya Adı:</span>
              <span className="ml-2 font-medium">{document.fileName}</span>
            </div>
            <div>
              <span className="text-gray-500">Dosya Boyutu:</span>
              <span className="ml-2 font-medium">
                {document.fileSize
                  ? `${(document.fileSize / 1024).toFixed(1)} KB`
                  : "Bilinmiyor"}
              </span>
            </div>
            {document.expiryDate && (
              <div>
                <span className="text-gray-500">Son Kullanma:</span>
                <span className="ml-2 font-medium">
                  {new Date(document.expiryDate).toLocaleDateString("tr-TR")}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Durum:</span>
              <span className="ml-2">
                {document.verificationStatus === "verified" && (
                  <Badge className="bg-green-100 text-green-800">Onaylı</Badge>
                )}
                {document.verificationStatus === "pending" && (
                  <Badge variant="secondary">Beklemede</Badge>
                )}
                {document.verificationStatus === "rejected" && (
                  <Badge variant="destructive">Reddedildi</Badge>
                )}
              </span>
            </div>
          </div>

          <Separator />

          {/* Document Preview */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
            {document.fileUrl ? (
              <div className="w-full">
                {document.fileName?.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={document.fileUrl}
                    className="w-full h-96 border rounded"
                    title={document.documentName}
                  />
                ) : (
                  <img
                    src={document.fileUrl}
                    alt={document.documentName}
                    className="max-w-full max-h-96 object-contain mx-auto"
                  />
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4" />
                <p>Belge önizlemesi mevcut değil</p>
              </div>
            )}
          </div>

          {/* Verification Notes */}
          {document.verificationNotes && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Doğrulama Notları
              </h4>
              <p className="text-blue-800 text-sm">
                {document.verificationNotes}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
          {document.fileUrl && (
            <Button asChild>
              <a
                href={document.fileUrl}
                download={document.fileName}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                İndir
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DocumentVerificationModal: React.FC<DocumentVerificationModalProps> = ({
  document,
  isOpen,
  onClose,
  onVerify,
}) => {
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!document) return null;

  const handleVerify = async (verified: boolean) => {
    setIsProcessing(true);
    try {
      await onVerify(document.id, verified, notes || undefined);
      onClose();
      setNotes("");
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Belge Doğrulama</DialogTitle>
          <DialogDescription>
            {document.documentName} belgesini doğrulayın
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span className="font-medium">{document.documentName}</span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Tip: {document.documentType}</p>
              <p>
                Yükleme:{" "}
                {new Date(document.uploadDate).toLocaleDateString("tr-TR")}
              </p>
              {document.expiryDate && (
                <p>
                  Son Kullanma:{" "}
                  {new Date(document.expiryDate).toLocaleDateString("tr-TR")}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="verification-notes">Doğrulama Notları</Label>
            <Textarea
              id="verification-notes"
              placeholder="Doğrulama ile ilgili notlarınızı buraya yazın..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleVerify(false)}
            disabled={isProcessing}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reddet
          </Button>
          <Button onClick={() => handleVerify(true)} disabled={isProcessing}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Onayla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const BoatDocumentManager: React.FC<BoatDocumentManagerProps> = ({
  boatId,
  documentManagement,
  onDocumentUpdate,
}) => {
  const [selectedDocument, setSelectedDocument] =
    useState<BoatDocumentDTO | null>(null);
  const [verificationDocument, setVerificationDocument] =
    useState<BoatDocumentDTO | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);

  const getDocumentStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800">Onaylı</Badge>;
      case "rejected":
        return <Badge variant="destructive">Reddedildi</Badge>;
      case "pending":
      default:
        return <Badge variant="secondary">Beklemede</Badge>;
    }
  };

  const isDocumentExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isDocumentExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiry = new Date(expiryDate);
    return expiry > new Date() && expiry <= thirtyDaysFromNow;
  };

  const handleViewDocument = (document: BoatDocumentDTO) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleVerifyDocument = (document: BoatDocumentDTO) => {
    setVerificationDocument(document);
    setIsVerificationOpen(true);
  };

  const handleDocumentVerification = async (
    documentId: number,
    verified: boolean,
    notes?: string
  ) => {
    try {
      await documentService.updateDocumentVerificationStatus(
        documentId,
        verified,
        notes
      );
      toast.success(verified ? "Belge onaylandı" : "Belge reddedildi");
      onDocumentUpdate();
    } catch (error) {
      toast.error("Doğrulama işlemi başarısız");
      throw error;
    }
  };

  const { documents, verificationStatus, expiringSoon, expired } =
    documentManagement;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{documents.length}</div>
                <div className="text-sm text-gray-500">Toplam Belge</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {
                    documents.filter((d) => d.verificationStatus === "verified")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">Onaylı</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {
                    documents.filter((d) => d.verificationStatus === "pending")
                      .length
                  }
                </div>
                <div className="text-sm text-gray-500">Beklemede</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{expired.length}</div>
                <div className="text-sm text-gray-500">Süresi Dolmuş</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Warning */}
      {expiringSoon.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Süresi Yaklaşan Belgeler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringSoon.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">{doc.documentName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-yellow-700">
                      {doc.expiryDate &&
                        new Date(doc.expiryDate).toLocaleDateString("tr-TR")}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Documents Warning */}
      {expired.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <XCircle className="h-5 w-5" />
              <span>Süresi Dolmuş Belgeler</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expired.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-white rounded"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{doc.documentName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-700">
                      {doc.expiryDate &&
                        new Date(doc.expiryDate).toLocaleDateString("tr-TR")}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDocument(doc)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Tüm Belgeler</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Bu tekne için henüz belge yüklenmemiş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getDocumentStatusIcon(document.verificationStatus)}
                    <div>
                      <div className="font-medium">{document.documentName}</div>
                      <div className="text-sm text-gray-500">
                        {document.documentType} •{" "}
                        {new Date(document.uploadDate).toLocaleDateString(
                          "tr-TR"
                        )}
                        {document.expiryDate && (
                          <>
                            {" • Son Kullanma: "}
                            <span
                              className={
                                isDocumentExpired(document.expiryDate)
                                  ? "text-red-600 font-medium"
                                  : isDocumentExpiringSoon(document.expiryDate)
                                  ? "text-yellow-600 font-medium"
                                  : "text-gray-500"
                              }
                            >
                              {new Date(document.expiryDate).toLocaleDateString(
                                "tr-TR"
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getDocumentStatusBadge(document.verificationStatus)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewDocument(document)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </DropdownMenuItem>
                        {document.fileUrl && (
                          <DropdownMenuItem asChild>
                            <a
                              href={document.fileUrl}
                              download={document.fileName}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              İndir
                            </a>
                          </DropdownMenuItem>
                        )}
                        {document.verificationStatus === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleVerifyDocument(document)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Doğrula
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        document={selectedDocument}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedDocument(null);
        }}
      />

      {/* Document Verification Modal */}
      <DocumentVerificationModal
        document={verificationDocument}
        isOpen={isVerificationOpen}
        onClose={() => {
          setIsVerificationOpen(false);
          setVerificationDocument(null);
        }}
        onVerify={handleDocumentVerification}
      />
    </div>
  );
};
