import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Image,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Shield,
  ShieldCheck,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  BoatDocumentDTO,
  TourDocumentDTO,
  BoatDocumentType,
  TourDocumentType,
  BOAT_DOCUMENT_TYPE_LABELS,
  TOUR_DOCUMENT_TYPE_LABELS,
} from "@/types/document.types";
import { documentService } from "@/services/documentService";
import { useAuth } from "@/contexts/AuthContext";
import { LazyImage, LoadingOverlay } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";

interface DocumentCardProps<T extends BoatDocumentDTO | TourDocumentDTO> {
  document: T;
  onDelete: () => void;
  onEdit?: () => void;
  onVerificationUpdate?: (document: T) => void;
  showVerificationStatus?: boolean;
  showExpiryWarning?: boolean;
  className?: string;
  entityType: "boat" | "tour";
}

const DocumentCard = <T extends BoatDocumentDTO | TourDocumentDTO>({
  document,
  onDelete,
  onEdit,
  onVerificationUpdate,
  showVerificationStatus = true,
  showExpiryWarning = true,
  className,
  entityType,
}: DocumentCardProps<T>) => {
  const { t, i18n } = useTranslation();
  const { isAdmin } = useAuth();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [isUpdatingVerification, setIsUpdatingVerification] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState(
    document.verificationNotes || ""
  );

  // Get document type label
  const getDocumentTypeLabel = () => {
    const labels =
      entityType === "boat"
        ? BOAT_DOCUMENT_TYPE_LABELS
        : TOUR_DOCUMENT_TYPE_LABELS;
    const currentLang = i18n.language === "tr" ? "tr" : "en";
    return (
      labels[document.documentType]?.[currentLang] || document.documentType
    );
  };

  // Check if document is an image
  const isImage = () => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    return imageExtensions.some(
      (ext) =>
        document.filePath.toLowerCase().endsWith(ext) ||
        document.documentUrl.toLowerCase().includes(ext)
    );
  };

  // Check expiry status
  const getExpiryStatus = () => {
    if (!document.expiryDate) return null;

    const isExpired = documentService.isDocumentExpired(document.expiryDate);
    const isExpiringSoon = documentService.isDocumentExpiringSoon(
      document.expiryDate
    );

    if (isExpired) {
      return {
        status: "expired",
        variant: "destructive" as const,
        icon: AlertTriangle,
        text: t("documents.status.expired", "Expired"),
      };
    }

    if (isExpiringSoon) {
      return {
        status: "expiring",
        variant: "secondary" as const,
        icon: Clock,
        text: t("documents.status.expiringSoon", "Expiring Soon"),
      };
    }

    return {
      status: "valid",
      variant: "outline" as const,
      icon: CheckCircle,
      text: t("documents.status.valid", "Valid"),
    };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get file size from URL or estimate
  const getFileSize = () => {
    // This would typically come from the backend, but we can estimate or show "Unknown"
    return t("documents.fileSize.unknown", "Unknown size");
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting document:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (document.documentUrl) {
      window.open(document.documentUrl, "_blank");
    }
  };

  // Handle verification status update
  const handleVerificationUpdate = async (
    isVerified: boolean,
    notes?: string
  ) => {
    if (isUpdatingVerification) return;

    setIsUpdatingVerification(true);
    try {
      let updatedDocument: T;

      if (entityType === "boat") {
        updatedDocument = (await documentService.updateBoatDocumentVerification(
          document.id,
          isVerified,
          notes
        )) as T;
      } else {
        updatedDocument = (await documentService.updateTourDocumentVerification(
          document.id,
          isVerified,
          notes
        )) as T;
      }

      // Call the callback to update the parent component
      if (onVerificationUpdate) {
        onVerificationUpdate(updatedDocument);
      }

      setIsVerificationDialogOpen(false);
    } catch (error) {
      console.error("Error updating document verification:", error);
      // You might want to show a toast notification here
    } finally {
      setIsUpdatingVerification(false);
    }
  };

  // Handle quick verification (verify without notes)
  const handleQuickVerification = async (isVerified: boolean) => {
    await handleVerificationUpdate(isVerified);
  };

  // Handle verification with notes
  const handleVerificationWithNotes = async () => {
    await handleVerificationUpdate(!document.isVerified, verificationNotes);
  };

  const expiryStatus = getExpiryStatus();
  const documentTypeLabel = getDocumentTypeLabel();

  return (
    <TooltipProvider>
      <Card
        className={cn("group hover:shadow-md transition-shadow", className)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Document Icon */}
              <div className="flex-shrink-0">
                {isImage() ? (
                  <Image className="h-8 w-8 text-blue-600" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-600" />
                )}
              </div>

              {/* Document Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {document.documentName ||
                    t("documents.untitled", "Untitled Document")}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {documentTypeLabel}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Preview Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle>{document.documentName}</DialogTitle>
                      </DialogHeader>
                      <div className="flex items-center justify-center p-4">
                        {isImage() ? (
                          <LazyImage
                            src={document.documentUrl}
                            alt={document.documentName || "Document preview"}
                            className="max-w-full max-h-[70vh] object-contain rounded"
                            loadingComponent={
                              <div className="flex items-center justify-center w-full h-64 bg-gray-100 rounded">
                                <div className="text-center space-y-2">
                                  <Image className="h-8 w-8 text-gray-400 mx-auto animate-pulse" />
                                  <p className="text-sm text-gray-500">
                                    Loading preview...
                                  </p>
                                </div>
                              </div>
                            }
                            errorComponent={
                              <div className="text-center space-y-4">
                                <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                                <p className="text-gray-600">
                                  {t(
                                    "documents.preview.loadError",
                                    "Failed to load image preview"
                                  )}
                                </p>
                                <Button
                                  onClick={handleDownload}
                                  variant="outline"
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  {t("documents.download", "Download")}
                                </Button>
                              </div>
                            }
                          />
                        ) : (
                          <div className="text-center space-y-4">
                            <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                            <p className="text-gray-600">
                              {t(
                                "documents.preview.notAvailable",
                                "Preview not available for this file type"
                              )}
                            </p>
                            <Button onClick={handleDownload} variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              {t("documents.download", "Download")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TooltipTrigger>
                <TooltipContent>
                  {t("documents.actions.preview", "Preview")}
                </TooltipContent>
              </Tooltip>

              {/* Download Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("documents.actions.download", "Download")}
                </TooltipContent>
              </Tooltip>

              {/* Admin Verification Controls */}
              {isAdmin() && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isUpdatingVerification}
                      className={cn(
                        "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
                        document.isVerified &&
                          "text-green-600 hover:text-green-700 hover:bg-green-50"
                      )}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!document.isVerified ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleQuickVerification(true)}
                          disabled={isUpdatingVerification}
                        >
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          {t("documents.verification.verify", "Verify")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsVerificationDialogOpen(true)}
                          disabled={isUpdatingVerification}
                        >
                          <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                          {t(
                            "documents.verification.verifyWithNotes",
                            "Verify with Notes"
                          )}
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleQuickVerification(false)}
                          disabled={isUpdatingVerification}
                        >
                          <Shield className="h-4 w-4 mr-2 text-yellow-600" />
                          {t(
                            "documents.verification.unverify",
                            "Mark as Unverified"
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsVerificationDialogOpen(true)}
                          disabled={isUpdatingVerification}
                        >
                          <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                          {t(
                            "documents.verification.updateNotes",
                            "Update Notes"
                          )}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Edit Button */}
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t("documents.actions.edit", "Edit")}
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t("documents.actions.delete", "Delete")}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Verification Status */}
            {showVerificationStatus && (
              <Badge
                variant={document.isVerified ? "default" : "secondary"}
                className={cn(
                  "flex items-center gap-1",
                  document.isVerified
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                )}
              >
                {document.isVerified ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <Shield className="h-3 w-3" />
                )}
                {document.isVerified
                  ? t("documents.status.verified", "Verified")
                  : t("documents.status.pending", "Pending Verification")}
              </Badge>
            )}

            {/* Expiry Status */}
            {showExpiryWarning && expiryStatus && (
              <Badge
                variant={expiryStatus.variant}
                className="flex items-center gap-1"
              >
                <expiryStatus.icon className="h-3 w-3" />
                {expiryStatus.text}
              </Badge>
            )}
          </div>

          {/* Document Details */}
          <div className="space-y-2 text-sm text-gray-600">
            {/* Upload Date */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {t("documents.uploadedOn", "Uploaded on")}{" "}
                {formatDate(document.createdAt)}
              </span>
            </div>

            {/* Expiry Date */}
            {document.expiryDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {t("documents.expiresOn", "Expires on")}{" "}
                  {formatDate(document.expiryDate)}
                </span>
              </div>
            )}

            {/* File Size */}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{getFileSize()}</span>
            </div>
          </div>

          {/* Verification Notes */}
          {document.verificationNotes && (
            <Alert>
              <AlertDescription className="text-sm">
                <strong>{t("documents.verificationNotes", "Notes")}:</strong>{" "}
                {document.verificationNotes}
              </AlertDescription>
            </Alert>
          )}

          {/* Expiry Warning */}
          {showExpiryWarning && expiryStatus?.status === "expired" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t(
                  "documents.warnings.expired",
                  "This document has expired and needs to be renewed."
                )}
              </AlertDescription>
            </Alert>
          )}

          {showExpiryWarning && expiryStatus?.status === "expiring" && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                {t(
                  "documents.warnings.expiringSoon",
                  "This document will expire soon. Consider renewing it."
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {document.isVerified
                ? t(
                    "documents.verification.updateVerification",
                    "Update Verification"
                  )
                : t("documents.verification.verifyDocument", "Verify Document")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-notes">
                {t("documents.verification.notes", "Verification Notes")}
              </Label>
              <Textarea
                id="verification-notes"
                placeholder={t(
                  "documents.verification.notesPlaceholder",
                  "Add notes about the verification status..."
                )}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {verificationNotes.length}/1000{" "}
                {t("common.characters", "characters")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVerificationDialogOpen(false)}
              disabled={isUpdatingVerification}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              onClick={handleVerificationWithNotes}
              disabled={isUpdatingVerification}
              className={cn(
                document.isVerified
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {isUpdatingVerification ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  {t("common.updating", "Updating...")}
                </>
              ) : document.isVerified ? (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  {t(
                    "documents.verification.markUnverified",
                    "Mark as Unverified"
                  )}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("documents.verification.markVerified", "Mark as Verified")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default DocumentCard;
