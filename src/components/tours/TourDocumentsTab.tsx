import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FileText, AlertCircle, CheckCircle, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  TourDocumentDTO,
  CreateTourDocumentDTO,
  TourDocumentType,
  DocumentMetadata,
  TOUR_DOCUMENT_TYPE_LABELS,
} from "@/types/document.types";
import { documentService } from "@/services/documentService";
import DocumentUploader from "@/components/documents/DocumentUploader";
import DocumentList from "@/components/documents/DocumentList";
import { cn } from "@/lib/utils";

interface TourDocumentsTabProps {
  tourId?: number; // undefined for new tours
  documents: TourDocumentDTO[];
  onDocumentsChange: (documents: TourDocumentDTO[]) => void;
  loading?: boolean;
  className?: string;
}

const TourDocumentsTab: React.FC<TourDocumentsTabProps> = ({
  tourId,
  documents,
  onDocumentsChange,
  loading = false,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationSummary, setValidationSummary] = useState<{
    hasErrors: boolean;
    hasWarnings: boolean;
    errors: string[];
    warnings: string[];
  }>({ hasErrors: false, hasWarnings: false, errors: [], warnings: [] });

  // Get document type labels for the current language
  const getDocumentTypeLabels = useCallback(() => {
    const currentLang = i18n.language === "tr" ? "tr" : "en";
    return Object.entries(TOUR_DOCUMENT_TYPE_LABELS).reduce(
      (acc, [key, value]) => {
        acc[key as TourDocumentType] = value[currentLang];
        return acc;
      },
      {} as Record<TourDocumentType, string>
    );
  }, [i18n.language]);

  // Validate documents and update summary
  const validateDocuments = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Only validate if there are documents
    if (documents.length === 0) {
      setValidationSummary({
        hasErrors: false,
        hasWarnings: false,
        errors: [],
        warnings: [],
      });
      return;
    }

    // Check for expired documents
    const expiredDocuments = documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      return documentService.isDocumentExpired(doc.expiryDate);
    });

    if (expiredDocuments.length > 0) {
      errors.push(`${expiredDocuments.length} belgenin süresi dolmuş`);
    }

    // Check for documents expiring soon
    const expiringSoonDocuments = documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      return (
        documentService.isDocumentExpiringSoon(doc.expiryDate) &&
        !documentService.isDocumentExpired(doc.expiryDate)
      );
    });

    if (expiringSoonDocuments.length > 0) {
      warnings.push(
        `${expiringSoonDocuments.length} belgenin süresi 30 gün içinde dolacak`
      );
    }

    // Check for unverified documents (skip this check since auto-verification is enabled)
    // const unverifiedDocuments = documents.filter((doc) => !doc.isVerified);
    // if (unverifiedDocuments.length > 0) {
    //   warnings.push(`${unverifiedDocuments.length} belge henüz doğrulanmamış`);
    // }

    // Check for required document types for tours
    const requiredDocTypes = [
      TourDocumentType.GUIDE_LICENSE,
      TourDocumentType.INSURANCE,
    ];
    const existingDocTypes = documents.map((doc) => doc.documentType);
    const missingRequiredDocs = requiredDocTypes.filter(
      (type) => !existingDocTypes.includes(type)
    );

    if (missingRequiredDocs.length > 0) {
      const docTypeLabels = getDocumentTypeLabels();
      const missingDocNames = missingRequiredDocs.map(
        (type) => docTypeLabels[type]
      );
      warnings.push(`Zorunlu belgeler eksik: ${missingDocNames.join(", ")}`);
    }

    // Check for duplicate document types
    const docTypeCounts = existingDocTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicateTypes = Object.entries(docTypeCounts)
      .filter(([_, count]) => Number(count) > 1)
      .map(([type, _]) => type);

    if (duplicateTypes.length > 0) {
      const docTypeLabels = getDocumentTypeLabels();
      const duplicateNames = duplicateTypes.map(
        (type) => docTypeLabels[type as TourDocumentType] || type
      );
      errors.push(
        `Aynı tipte birden fazla belge: ${duplicateNames.join(", ")}`
      );
    }

    setValidationSummary({
      hasErrors: errors.length > 0,
      hasWarnings: warnings.length > 0,
      errors,
      warnings,
    });
  }, [documents, getDocumentTypeLabels]);

  // Update validation summary when documents change
  useEffect(() => {
    validateDocuments();
  }, [validateDocuments]);

  const documentTypeLabels = getDocumentTypeLabels();

  // Handle document upload
  const handleDocumentUpload = useCallback(
    async (
      file: File,
      documentType: TourDocumentType,
      metadata: DocumentMetadata,
      event?: Event
    ) => {
      // Prevent form submission
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (!tourId) {
        // For new tours, we'll store the document data temporarily
        // and upload it when the tour is created
        try {
          setIsUploading(true);
          setUploadError(null);

          // Convert file to base64
          const { base64 } = await documentService.convertFileToBase64(file);

          // Create a temporary document object
          const tempDocument: TourDocumentDTO = {
            id: Date.now(), // Temporary ID
            tourId: 0, // Will be set when tour is created
            documentType,
            documentName: metadata.documentName || file.name,
            filePath: "", // Will be set by backend
            documentUrl: "", // Will be set by backend
            expiryDate: metadata.expiryDate,
            isVerified: true, // Otomatik olarak onaylanmış duruma ayarla
            verificationNotes: metadata.verificationNotes,
            displayOrder: documents.length + 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Add to documents list
          onDocumentsChange([...documents, tempDocument]);

          toast({
            title: t("documents.upload.success", "Upload successful!"),
            description: t(
              "documents.upload.successDescription",
              "Document will be saved when the tour is created."
            ),
          });
        } catch (error) {
          console.error("Error preparing document for upload:", error);
          const errorMessage = documentService.getUserFriendlyErrorMessage(
            documentService.handleDocumentError(error),
            {
              fileName: file.name,
              operation: "upload",
            }
          );
          setUploadError(errorMessage);
          toast({
            title: t("documents.upload.error", "Upload failed"),
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      } else {
        // For existing tours, upload directly to the backend
        try {
          setIsUploading(true);
          setUploadError(null);

          const { base64 } = await documentService.convertFileToBase64(file);

          const createDTO: CreateTourDocumentDTO = {
            documentType,
            documentName: metadata.documentName || file.name,
            documentData: base64,
            expiryDate: metadata.expiryDate,
            isVerified: true, // Otomatik olarak onaylanmış duruma ayarla
            verificationNotes: metadata.verificationNotes,
            displayOrder: documents.length + 1,
          };

          const newDocument = await documentService.createTourDocument(
            tourId,
            createDTO
          );

          // Add to documents list
          onDocumentsChange([...documents, newDocument]);

          toast({
            title: t("documents.upload.success", "Upload successful!"),
            description: t(
              "documents.upload.successDescription",
              "Document has been uploaded and saved."
            ),
          });
        } catch (error) {
          console.error("Error uploading document:", error);
          const errorMessage = documentService.getUserFriendlyErrorMessage(
            documentService.handleDocumentError(error),
            {
              fileName: file.name,
              operation: "upload",
            }
          );
          setUploadError(errorMessage);
          toast({
            title: t("documents.upload.error", "Upload failed"),
            description: errorMessage,
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    },
    [tourId, documents, onDocumentsChange, t]
  );

  // Handle document deletion
  const handleDocumentDelete = useCallback(
    async (documentId: number) => {
      if (!tourId) {
        // For new tours, just remove from the list
        const updatedDocuments = documents.filter(
          (doc) => doc.id !== documentId
        );
        onDocumentsChange(updatedDocuments);

        toast({
          title: t("documents.delete.success", "Document removed"),
          description: t(
            "documents.delete.successDescription",
            "Document has been removed from the list."
          ),
        });
        return;
      }

      try {
        await documentService.deleteTourDocument(documentId);

        // Remove from documents list
        const updatedDocuments = documents.filter(
          (doc) => doc.id !== documentId
        );
        onDocumentsChange(updatedDocuments);

        toast({
          title: t("documents.delete.success", "Document deleted"),
          description: t(
            "documents.delete.successDescription",
            "Document has been permanently deleted."
          ),
        });
      } catch (error) {
        console.error("Error deleting document:", error);
        const errorMessage = documentService.getUserFriendlyErrorMessage(
          documentService.handleDocumentError(error),
          {
            operation: "delete",
          }
        );
        toast({
          title: t("documents.delete.error", "Delete failed"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [tourId, documents, onDocumentsChange, t]
  );

  // Handle document reordering
  const handleDocumentReorder = useCallback(
    async (reorderedDocuments: TourDocumentDTO[]) => {
      if (!tourId) {
        // For new tours, just update the order locally
        onDocumentsChange(reorderedDocuments);
        return;
      }

      try {
        // Update display order for each document
        const updatePromises = reorderedDocuments.map((doc, index) =>
          documentService.updateTourDocument({
            id: doc.id,
            displayOrder: index + 1,
          })
        );

        await Promise.all(updatePromises);
        onDocumentsChange(reorderedDocuments);

        toast({
          title: t("documents.reorder.success", "Order updated"),
          description: t(
            "documents.reorder.successDescription",
            "Document order has been saved."
          ),
        });
      } catch (error) {
        console.error("Error reordering documents:", error);
        const errorMessage = documentService.getUserFriendlyErrorMessage(
          documentService.handleDocumentError(error),
          {
            operation: "reorder",
          }
        );
        toast({
          title: t("documents.reorder.error", "Reorder failed"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [tourId, onDocumentsChange, t]
  );

  // Handle document verification update
  const handleVerificationUpdate = useCallback(
    (updatedDocument: TourDocumentDTO) => {
      const updatedDocuments = documents.map((doc) =>
        doc.id === updatedDocument.id ? updatedDocument : doc
      );
      onDocumentsChange(updatedDocuments);

      toast({
        title: t("documents.verification.success", "Verification updated"),
        description: t(
          "documents.verification.successDescription",
          "Document verification status has been updated."
        ),
      });
    },
    [documents, onDocumentsChange, t]
  );

  // Get document statistics
  const getDocumentStats = useCallback(() => {
    const total = documents.length;
    const verified = documents.filter((doc) => doc.isVerified).length;
    const expired = documents.filter((doc) =>
      documentService.isDocumentExpired(doc.expiryDate)
    ).length;
    const expiringSoon = documents.filter((doc) =>
      documentService.isDocumentExpiringSoon(doc.expiryDate)
    ).length;

    return { total, verified, expired, expiringSoon };
  }, [documents]);

  const stats = getDocumentStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {t("documents.tour.title", "Tour Documents")}
            </h2>
            <p className="text-gray-600 mt-1">
              {t(
                "documents.tour.description",
                "Upload and manage required documents for your tour"
              )}
            </p>
          </div>

          {/* Document Statistics */}
          {stats.total > 0 && (
            <div className="flex gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {stats.total} {t("documents.total", "Total")}
              </Badge>
              {stats.verified > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3" />
                  {stats.verified} {t("documents.verified", "Verified")}
                </Badge>
              )}
              {stats.expired > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200"
                >
                  <AlertCircle className="h-3 w-3" />
                  {stats.expired} {t("documents.expired", "Expired")}
                </Badge>
              )}
              {stats.expiringSoon > 0 && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200"
                >
                  <AlertCircle className="h-3 w-3" />
                  {stats.expiringSoon}{" "}
                  {t("documents.expiringSoon", "Expiring Soon")}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Info Alert for New Tours */}
        {!tourId && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t(
                "documents.tour.newTourInfo",
                "Documents will be uploaded when the tour is created. You can prepare them now and they will be saved automatically."
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Error */}
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Document Validation Summary */}
        {(validationSummary.hasErrors || validationSummary.hasWarnings) && (
          <div className="space-y-2">
            {validationSummary.hasErrors && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {t("documents.validation.errors", "Document Errors:")}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validationSummary.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validationSummary.hasWarnings && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {t("documents.validation.warnings", "Document Warnings:")}
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {validationSummary.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      {/* Document Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("documents.upload.title", "Upload Document")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <DocumentUploader
              documentTypes={documentTypeLabels}
              onUpload={handleDocumentUpload}
              loading={isUploading || loading}
              entityType="tour"
              maxFileSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={[
                "application/pdf",
                "image/jpeg",
                "image/jpg",
                "image/png",
                "image/webp",
              ]}
            />
          </form>
        </CardContent>
      </Card>

      {/* Document List Section */}
      <DocumentList
        documents={documents}
        onDelete={handleDocumentDelete}
        onReorder={handleDocumentReorder}
        onVerificationUpdate={handleVerificationUpdate}
        loading={loading}
        entityType="tour"
        emptyMessage={t(
          "documents.tour.emptyMessage",
          "No tour documents uploaded yet. Upload your first document to get started."
        )}
        showFilters={documents.length > 3}
        showSearch={documents.length > 5}
        enableReordering={!loading}
      />

      {/* Required Documents Info */}
      {documents.length === 0 && (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("documents.tour.requiredTitle", "Required Documents")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(
                    "documents.tour.requiredDescription",
                    "Upload the following documents to comply with tourism regulations:"
                  )}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-left max-w-2xl mx-auto">
                {Object.entries(documentTypeLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TourDocumentsTab;
