import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BoatDocumentType,
  TourDocumentType,
  DocumentMetadata,
  DocumentError,
  BOAT_DOCUMENT_TYPE_LABELS,
  TOUR_DOCUMENT_TYPE_LABELS,
} from "@/types/document.types";
import { documentService } from "@/services/documentService";
import { OptimizationResult } from "@/utils/fileOptimization";
import { ProgressIndicator } from "@/components/ui/loading-states";
import { cn } from "@/lib/utils";

interface DocumentUploaderProps<T extends BoatDocumentType | TourDocumentType> {
  documentTypes: Record<T, string>;
  onUpload: (
    file: File,
    documentType: T,
    metadata: DocumentMetadata
  ) => Promise<void>;
  loading?: boolean;
  maxFileSize?: number;
  acceptedTypes?: string[];
  entityType: "boat" | "tour";
  className?: string;
}

interface UploadState {
  file: File | null;
  documentType: string;
  documentName: string;
  expiryDate: string;
  verificationNotes: string;
  progress: number;
  status: "idle" | "uploading" | "success" | "error" | "optimizing";
  errors: DocumentError[];
  retryCount: number;
  canRetry: boolean;
  uploadStartTime?: number;
  uploadSpeed?: number; // bytes per second
  optimizationResult?: OptimizationResult;
  optimizationSuggestions?: string[];
  canOptimize?: boolean;
  estimatedSavings?: number;
  showOptimizationSuggestions?: boolean;
  enableOptimization?: boolean;
}

const DocumentUploader = <T extends BoatDocumentType | TourDocumentType>({
  documentTypes,
  onUpload,
  loading = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ],
  entityType,
  className,
}: DocumentUploaderProps<T>) => {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    documentType: "",
    documentName: "",
    expiryDate: "",
    verificationNotes: "",
    progress: 0,
    status: "idle",
    errors: [],
    retryCount: 0,
    canRetry: false,
    showOptimizationSuggestions: false,
    enableOptimization: true,
  });

  // Get document type labels based on entity type and current language
  const getDocumentTypeLabels = useCallback(() => {
    const labels =
      entityType === "boat"
        ? BOAT_DOCUMENT_TYPE_LABELS
        : TOUR_DOCUMENT_TYPE_LABELS;
    const currentLang = i18n.language === "tr" ? "tr" : "en";

    return Object.entries(labels).reduce((acc, [key, value]) => {
      acc[key as T] = value[currentLang];
      return acc;
    }, {} as Record<T, string>);
  }, [entityType, i18n.language]);

  const documentTypeLabels = getDocumentTypeLabels();

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadState((prev) => ({
      ...prev,
      file,
      documentName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      status: "idle",
      errors: [],
      progress: 0,
      retryCount: 0,
      canRetry: false,
      uploadStartTime: undefined,
      uploadSpeed: undefined,
      optimizationResult: undefined,
      optimizationSuggestions: undefined,
      canOptimize: false,
      estimatedSavings: undefined,
      showOptimizationSuggestions: false,
    }));

    // Validate file with optimization analysis
    const validation =
      await documentService.validateDocumentFileWithOptimization(file);

    if (!validation.isValid) {
      setUploadState((prev) => ({
        ...prev,
        status: "error",
        errors: validation.errors,
        canRetry: false, // Don't allow retry for validation errors
      }));
    } else {
      // Show optimization suggestions if available
      setUploadState((prev) => ({
        ...prev,
        optimizationSuggestions: validation.optimizationSuggestions,
        canOptimize: validation.canOptimize,
        estimatedSavings: validation.estimatedSavings,
        showOptimizationSuggestions: validation.canOptimize || false,
      }));
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  // Handle form field changes
  const handleFieldChange = useCallback(
    (field: keyof UploadState, value: string) => {
      setUploadState((prev) => ({
        ...prev,
        [field]: value,
        errors: prev.errors.filter((error) => error.field !== field),
      }));
    },
    []
  );

  // Clear file selection
  const clearFile = useCallback(() => {
    setUploadState({
      file: null,
      documentType: "",
      documentName: "",
      expiryDate: "",
      verificationNotes: "",
      progress: 0,
      status: "idle",
      errors: [],
      retryCount: 0,
      canRetry: false,
      uploadStartTime: undefined,
      uploadSpeed: undefined,
      optimizationResult: undefined,
      optimizationSuggestions: undefined,
      canOptimize: false,
      estimatedSavings: undefined,
      showOptimizationSuggestions: false,
      enableOptimization: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Handle file optimization
  const handleOptimizeFile = useCallback(async () => {
    if (!uploadState.file) return;

    try {
      setUploadState((prev) => ({
        ...prev,
        status: "optimizing",
        progress: 0,
      }));

      const analysis = documentService.analyzeFileForOptimization(
        uploadState.file
      );
      const optimizationResult = await documentService.optimizeFileForUpload(
        uploadState.file,
        analysis.recommendedOptions
      );

      setUploadState((prev) => ({
        ...prev,
        status: "idle",
        optimizationResult,
        file: optimizationResult.file,
        documentName: optimizationResult.file.name.replace(/\.[^/.]+$/, ""),
        showOptimizationSuggestions: false,
      }));
    } catch (error) {
      console.warn("File optimization failed:", error);
      setUploadState((prev) => ({
        ...prev,
        status: "idle",
        showOptimizationSuggestions: false,
      }));
    }
  }, [uploadState.file]);

  // Handle upload with retry functionality
  const handleUpload = useCallback(
    async (isRetry: boolean = false) => {
      if (!uploadState.file || !uploadState.documentType) {
        return;
      }

      try {
        const startTime = Date.now();

        setUploadState((prev) => ({
          ...prev,
          status: "uploading",
          progress: 0,
          errors: [],
          uploadStartTime: startTime,
          canRetry: false,
          retryCount: isRetry ? prev.retryCount + 1 : 0,
        }));

        // Validate metadata before upload
        const metadataValidation = documentService.validateDocumentMetadata(
          uploadState.documentType as T,
          {
            documentName: uploadState.documentName,
            expiryDate: uploadState.expiryDate,
            verificationNotes: uploadState.verificationNotes,
          }
        );

        if (!metadataValidation.isValid) {
          setUploadState((prev) => ({
            ...prev,
            status: "error",
            errors: metadataValidation.errors,
            canRetry: false, // Don't allow retry for validation errors
          }));
          return;
        }

        // Enhanced progress simulation with speed calculation
        let progressValue = 0;
        const progressInterval = setInterval(() => {
          progressValue = Math.min(progressValue + Math.random() * 15 + 5, 90);
          const currentTime = Date.now();
          const elapsed = (currentTime - startTime) / 1000; // seconds
          const estimatedSpeed = uploadState.file
            ? (uploadState.file.size * (progressValue / 100)) / elapsed
            : 0;

          setUploadState((prev) => ({
            ...prev,
            progress: progressValue,
            uploadSpeed: estimatedSpeed,
          }));
        }, 200);

        const metadata: DocumentMetadata = {
          documentName: uploadState.documentName || uploadState.file.name,
          expiryDate: uploadState.expiryDate || undefined,
          verificationNotes: uploadState.verificationNotes || undefined,
        };

        // Use retry functionality from documentService
        await documentService.retryDocumentOperation(
          () =>
            onUpload(
              uploadState.file!,
              uploadState.documentType as T,
              metadata
            ),
          3, // max retries
          1000 // base delay
        );

        clearInterval(progressInterval);
        const endTime = Date.now();
        const totalTime = (endTime - startTime) / 1000;
        const finalSpeed = uploadState.file.size / totalTime;

        setUploadState((prev) => ({
          ...prev,
          progress: 100,
          status: "success",
          uploadSpeed: finalSpeed,
        }));

        // Clear form after successful upload with success message
        setTimeout(() => {
          clearFile();
        }, 3000);
      } catch (error: any) {
        const documentError = documentService.handleDocumentError(error);
        const canRetryError =
          documentError.type === "NETWORK" ||
          documentError.type === "SERVER" ||
          (documentError.code === "SERVER_ERROR" && uploadState.retryCount < 3);

        setUploadState((prev) => ({
          ...prev,
          status: "error",
          progress: 0,
          errors: [documentError],
          canRetry: canRetryError,
          uploadSpeed: undefined,
        }));
      }
    },
    [uploadState, onUpload, clearFile]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    handleUpload(true);
  }, [handleUpload]);

  // Get file size display
  const getFileSizeDisplay = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Check if form is valid
  const isFormValid =
    uploadState.file &&
    uploadState.documentType &&
    uploadState.errors.length === 0 &&
    uploadState.status !== "uploading" &&
    uploadState.status !== "optimizing";

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t("documents.upload.title", "Upload Document")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-gray-300",
            uploadState.file ? "border-green-300 bg-green-50" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadState.file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-green-800">
                    {uploadState.file.name}
                  </p>
                  <p className="text-sm text-green-600">
                    {getFileSizeDisplay(uploadState.file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="ml-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {uploadState.status === "optimizing" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Zap className="h-5 w-5 animate-pulse" />
                    <span>
                      {t("documents.upload.optimizing", "Optimizing file...")}
                    </span>
                  </div>
                  <Progress value={50} className="w-full" />
                </div>
              )}

              {uploadState.status === "uploading" && (
                <div className="space-y-3">
                  <ProgressIndicator
                    progress={uploadState.progress}
                    status={
                      uploadState.retryCount > 0
                        ? t(
                            "documents.upload.retryAttempt",
                            "Retry attempt {{count}}",
                            { count: uploadState.retryCount }
                          )
                        : t("documents.upload.uploading", "Uploading...")
                    }
                    showPercentage={true}
                  />
                  {uploadState.uploadSpeed && (
                    <div className="text-center text-sm text-gray-500">
                      {getFileSizeDisplay(uploadState.uploadSpeed)}/s
                    </div>
                  )}
                </div>
              )}

              {uploadState.status === "success" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      {t("documents.upload.success", "Upload successful!")}
                    </span>
                  </div>
                  {uploadState.optimizationResult?.wasCompressed && (
                    <div className="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded">
                      <Zap className="h-3 w-3 inline mr-1" />
                      {t(
                        "documents.upload.optimizationSuccess",
                        "File optimized: {{originalSize}} → {{compressedSize}} ({{ratio}}% reduction)",
                        {
                          originalSize: getFileSizeDisplay(
                            uploadState.optimizationResult.originalSize
                          ),
                          compressedSize: getFileSizeDisplay(
                            uploadState.optimizationResult.compressedSize
                          ),
                          ratio: Math.round(
                            (1 -
                              uploadState.optimizationResult.compressionRatio) *
                              100
                          ),
                        }
                      )}
                    </div>
                  )}
                  {uploadState.uploadSpeed && (
                    <p className="text-xs text-center text-gray-500">
                      {t(
                        "documents.upload.uploadSpeed",
                        "Average speed: {{speed}}",
                        {
                          speed:
                            getFileSizeDisplay(uploadState.uploadSpeed) + "/s",
                        }
                      )}
                    </p>
                  )}
                  <p className="text-xs text-center text-gray-500">
                    {t(
                      "documents.upload.autoClose",
                      "This form will clear automatically..."
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {t(
                    "documents.upload.dropZone.title",
                    "Drop your document here"
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {t(
                    "documents.upload.dropZone.subtitle",
                    "or click to browse files"
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {t("documents.upload.selectFile", "Select File")}
              </Button>
              <p className="text-xs text-gray-400">
                {t(
                  "documents.upload.acceptedTypes",
                  "Accepted: PDF, JPG, PNG, WEBP (max {{size}})",
                  {
                    size: getFileSizeDisplay(maxFileSize),
                  }
                )}
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Optimization Suggestions */}
        {uploadState.showOptimizationSuggestions &&
          uploadState.optimizationSuggestions && (
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="space-y-3">
                  <div className="font-medium text-blue-800">
                    {t(
                      "documents.upload.optimization.title",
                      "File Optimization Available"
                    )}
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                    {uploadState.optimizationSuggestions.map(
                      (suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      )
                    )}
                  </ul>
                  {uploadState.estimatedSavings && (
                    <p className="text-sm text-blue-600">
                      {t(
                        "documents.upload.optimization.estimatedSavings",
                        "Estimated savings: {{savings}}",
                        {
                          savings: getFileSizeDisplay(
                            uploadState.estimatedSavings
                          ),
                        }
                      )}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t border-blue-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleOptimizeFile}
                      disabled={uploadState.status === "optimizing"}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {uploadState.status === "optimizing"
                        ? t(
                            "documents.upload.optimization.optimizing",
                            "Optimizing..."
                          )
                        : t(
                            "documents.upload.optimization.optimize",
                            "Optimize File"
                          )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setUploadState((prev) => ({
                          ...prev,
                          showOptimizationSuggestions: false,
                        }))
                      }
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      {t("documents.upload.optimization.skip", "Skip")}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

        {/* Document Type Selection */}
        {uploadState.file && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">
                {t("documents.upload.documentType", "Document Type")} *
              </Label>
              <Select
                value={uploadState.documentType}
                onValueChange={(value) =>
                  handleFieldChange("documentType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      "documents.upload.selectType",
                      "Select document type"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {String(label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="documentName">
                {t("documents.upload.documentName", "Document Name")}
              </Label>
              <Input
                id="documentName"
                value={uploadState.documentName}
                onChange={(e) =>
                  handleFieldChange("documentName", e.target.value)
                }
                placeholder={t(
                  "documents.upload.documentNamePlaceholder",
                  "Enter document name"
                )}
                maxLength={255}
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiryDate">
                {t("documents.upload.expiryDate", "Expiry Date")}
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={uploadState.expiryDate}
                onChange={(e) =>
                  handleFieldChange("expiryDate", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Verification Notes */}
            <div className="space-y-2">
              <Label htmlFor="verificationNotes">
                {t("documents.upload.verificationNotes", "Notes")}
              </Label>
              <Textarea
                id="verificationNotes"
                value={uploadState.verificationNotes}
                onChange={(e) =>
                  handleFieldChange("verificationNotes", e.target.value)
                }
                placeholder={t(
                  "documents.upload.verificationNotesPlaceholder",
                  "Add any additional notes"
                )}
                maxLength={1000}
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {uploadState.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <ul className="list-disc list-inside space-y-1">
                  {uploadState.errors.map((error, index) => (
                    <li key={index}>
                      {documentService.getUserFriendlyErrorMessage(error, {
                        fileName: uploadState.file?.name,
                        operation: "upload",
                      })}
                    </li>
                  ))}
                </ul>

                {uploadState.canRetry && (
                  <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={loading}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      {t("documents.upload.retry", "Try Again")}
                    </Button>
                    {uploadState.retryCount > 0 && (
                      <span className="text-xs text-red-600">
                        {t(
                          "documents.upload.retryCount",
                          "Attempts: {{count}}/3",
                          {
                            count: uploadState.retryCount,
                          }
                        )}
                      </span>
                    )}
                  </div>
                )}

                {!uploadState.canRetry &&
                  uploadState.errors[0]?.type === "VALIDATION" && (
                    <p className="text-xs text-red-600 pt-2 border-t border-red-200">
                      {t(
                        "documents.upload.fixErrors",
                        "Please fix the errors above and try uploading again."
                      )}
                    </p>
                  )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Button */}
        {uploadState.file && uploadState.status !== "success" && (
          <Button
            onClick={() => handleUpload(false)}
            disabled={
              !isFormValid ||
              loading ||
              uploadState.status === "uploading" ||
              uploadState.status === "optimizing"
            }
            className="w-full"
            size="lg"
          >
            {uploadState.status === "uploading" ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                {uploadState.retryCount > 0
                  ? t("documents.upload.retrying", "Retrying...")
                  : t("documents.upload.uploading", "Uploading...")}
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {uploadState.status === "error" && uploadState.canRetry
                  ? t("documents.upload.retryButton", "Retry Upload")
                  : t("documents.upload.uploadButton", "Upload Document")}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUploader;
