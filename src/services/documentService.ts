import { BaseService } from "./base/BaseService";
import {
  BoatDocumentDTO,
  TourDocumentDTO,
  CreateBoatDocumentDTO,
  CreateTourDocumentDTO,
  UpdateBoatDocumentDTO,
  UpdateTourDocumentDTO,
  DocumentError,
  DocumentValidationResult,
  BoatDocumentType,
  TourDocumentType,
} from "@/types/document.types";
import {
  fileOptimizationService,
  CompressionOptions,
  OptimizationResult,
} from "@/utils/fileOptimization";

class DocumentService extends BaseService {
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super("");
  }

  /**
   * Cached GET request to avoid duplicate API calls
   */
  private async cachedGet<T>(url: string, cacheKey?: string): Promise<T> {
    const key = cacheKey || url;

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Check cache first
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Make the request
    const requestPromise = this.get<T>(url);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;

      // Cache the result
      this.requestCache.set(key, {
        data: result,
        timestamp: Date.now(),
      });

      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  /**
   * Invalidates cache for a specific key or pattern
   */
  private invalidateCache(keyPattern: string): void {
    for (const key of this.requestCache.keys()) {
      if (key.includes(keyPattern)) {
        this.requestCache.delete(key);
      }
    }
  }

  // ==================== BOAT DOCUMENTS ====================

  // Boat Documents - Query Methods
  public async getBoatDocuments(boatId: number): Promise<BoatDocumentDTO[]> {
    try {
      return await this.cachedGet<BoatDocumentDTO[]>(
        `/boats/${boatId}/documents`,
        `boat-documents-${boatId}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getBoatDocument(documentId: number): Promise<BoatDocumentDTO> {
    try {
      return await this.cachedGet<BoatDocumentDTO>(
        `/boat-documents/${documentId}`,
        `boat-document-${documentId}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async checkBoatDocumentExists(documentId: number): Promise<boolean> {
    try {
      return await this.get<boolean>(`/boat-documents/${documentId}/exists`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Boat Documents - Command Methods
  public async createBoatDocument(
    boatId: number,
    data: CreateBoatDocumentDTO
  ): Promise<BoatDocumentDTO> {
    try {
      const payload = {
        ...data,
        boatId,
        // Otomatik olarak onaylanmış duruma ayarla
        isVerified: true,
      };
      const result = await this.post<BoatDocumentDTO>(
        "/boat-documents",
        payload
      );

      // Invalidate related cache
      this.invalidateCache(`boat-documents-${boatId}`);

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateBoatDocument(
    data: UpdateBoatDocumentDTO
  ): Promise<BoatDocumentDTO> {
    try {
      const result = await this.put<BoatDocumentDTO>("/boat-documents", data);

      // Invalidate related cache
      this.invalidateCache(`boat-document-${data.id}`);
      if ("boatId" in data) {
        this.invalidateCache(`boat-documents-${(data as any).boatId}`);
      }

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async deleteBoatDocument(documentId: number): Promise<void> {
    try {
      const result = await this.delete<void>(`/boat-documents/${documentId}`);

      // Invalidate related cache
      this.invalidateCache(`boat-document-${documentId}`);
      this.invalidateCache(`boat-documents-`); // Invalidate all boat document lists

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateBoatDocumentDisplayOrder(
    documentId: number,
    displayOrder: number
  ): Promise<void> {
    try {
      return await this.patch<void>(
        `/boat-documents/${documentId}/display-order?displayOrder=${displayOrder}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ==================== TOUR DOCUMENTS ====================

  // Tour Documents - Query Methods
  public async getTourDocuments(tourId: number): Promise<TourDocumentDTO[]> {
    try {
      return await this.cachedGet<TourDocumentDTO[]>(
        `/tours/${tourId}/documents`,
        `tour-documents-${tourId}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async getTourDocument(documentId: number): Promise<TourDocumentDTO> {
    try {
      return await this.cachedGet<TourDocumentDTO>(
        `/tour-documents/${documentId}`,
        `tour-document-${documentId}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async checkTourDocumentExists(documentId: number): Promise<boolean> {
    try {
      return await this.get<boolean>(`/tour-documents/${documentId}/exists`);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Tour Documents - Command Methods
  public async createTourDocument(
    tourId: number,
    data: CreateTourDocumentDTO
  ): Promise<TourDocumentDTO> {
    try {
      const payload = {
        ...data,
        tourId,
        // Otomatik olarak onaylanmış duruma ayarla
        isVerified: true,
      };
      const result = await this.post<TourDocumentDTO>(
        "/tour-documents",
        payload
      );

      // Invalidate related cache
      this.invalidateCache(`tour-documents-${tourId}`);

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateTourDocument(
    data: UpdateTourDocumentDTO
  ): Promise<TourDocumentDTO> {
    try {
      const result = await this.put<TourDocumentDTO>("/tour-documents", data);

      // Invalidate related cache
      this.invalidateCache(`tour-document-${data.id}`);
      if ("tourId" in data) {
        this.invalidateCache(`tour-documents-${(data as any).tourId}`);
      }

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async deleteTourDocument(documentId: number): Promise<void> {
    try {
      const result = await this.delete<void>(`/tour-documents/${documentId}`);

      // Invalidate related cache
      this.invalidateCache(`tour-document-${documentId}`);
      this.invalidateCache(`tour-documents-`); // Invalidate all tour document lists

      return result;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  public async updateTourDocumentDisplayOrder(
    documentId: number,
    displayOrder: number
  ): Promise<void> {
    try {
      return await this.patch<void>(
        `/tour-documents/${documentId}/display-order?displayOrder=${displayOrder}`
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ==================== VERIFICATION METHODS ====================

  /**
   * Updates verification status for a boat document (Admin only)
   * @param documentId - The document ID
   * @param isVerified - Verification status
   * @param verificationNotes - Optional verification notes
   * @returns Promise with updated document
   */
  public async updateBoatDocumentVerification(
    documentId: number,
    isVerified: boolean,
    verificationNotes?: string
  ): Promise<BoatDocumentDTO> {
    try {
      const payload = {
        isVerified,
        verificationNotes: verificationNotes || null,
      };
      return await this.patch<BoatDocumentDTO>(
        `/boat-documents/${documentId}/verification`,
        payload
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Updates verification status for a tour document (Admin only)
   * @param documentId - The document ID
   * @param isVerified - Verification status
   * @param verificationNotes - Optional verification notes
   * @returns Promise with updated document
   */
  public async updateTourDocumentVerification(
    documentId: number,
    isVerified: boolean,
    verificationNotes?: string
  ): Promise<TourDocumentDTO> {
    try {
      const payload = {
        isVerified,
        verificationNotes: verificationNotes || null,
      };
      return await this.patch<TourDocumentDTO>(
        `/tour-documents/${documentId}/verification`,
        payload
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validates a document file before upload
   * @param file - The file to validate
   * @returns Promise with validation result
   */
  public async validateDocumentFile(
    file: File
  ): Promise<DocumentValidationResult> {
    const errors: DocumentError[] = [];

    // Check if file exists
    if (!file) {
      errors.push({
        type: "VALIDATION",
        message: "No file selected.",
        code: "NO_FILE_SELECTED",
        field: "file",
      });
      return { isValid: false, errors };
    }

    // File size validation (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size === 0) {
      errors.push({
        type: "VALIDATION",
        message: "File is empty.",
        code: "EMPTY_FILE",
        field: "file",
      });
    } else if (file.size > maxFileSize) {
      errors.push({
        type: "VALIDATION",
        message: `File size too large. Maximum size is ${this.formatFileSize(
          maxFileSize
        )}.`,
        code: "FILE_TOO_LARGE",
        field: "file",
      });
    }

    // File type validation
    const acceptedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    const acceptedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (
      !acceptedTypes.includes(file.type) &&
      !acceptedExtensions.includes(fileExtension)
    ) {
      errors.push({
        type: "VALIDATION",
        message:
          "Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.",
        code: "INVALID_FILE_TYPE",
        field: "file",
      });
    }

    // File name validation
    if (!file.name || file.name.trim().length === 0) {
      errors.push({
        type: "VALIDATION",
        message: "File name is required.",
        code: "MISSING_FILE_NAME",
        field: "fileName",
      });
    } else if (file.name.length > 255) {
      errors.push({
        type: "VALIDATION",
        message: "File name is too long. Maximum length is 255 characters.",
        code: "FILE_NAME_TOO_LONG",
        field: "fileName",
      });
    }

    // Check for potentially dangerous file extensions
    const dangerousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".scr",
      ".vbs",
      ".js",
      ".html",
      ".htm",
    ];
    if (dangerousExtensions.includes(fileExtension)) {
      errors.push({
        type: "VALIDATION",
        message: "File type not allowed for security reasons.",
        code: "DANGEROUS_FILE_TYPE",
        field: "file",
      });
    }

    // Check for special characters in filename that might cause issues
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (invalidChars.test(file.name)) {
      errors.push({
        type: "VALIDATION",
        message: "File name contains invalid characters.",
        code: "INVALID_FILE_NAME_CHARS",
        field: "fileName",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Converts a file to base64 string with optional optimization
   * @param file - The file to convert
   * @param optimize - Whether to optimize the file before conversion
   * @param compressionOptions - Options for file compression
   * @returns Promise with base64 string and optimization info
   */
  public async convertFileToBase64(
    file: File,
    optimize: boolean = true,
    compressionOptions?: CompressionOptions
  ): Promise<{
    base64: string;
    optimizationResult?: OptimizationResult;
  }> {
    try {
      // Check cache first
      const cachedData = await fileOptimizationService.getCachedFileData(file);
      if (cachedData) {
        return { base64: cachedData };
      }

      let fileToConvert = file;
      let optimizationResult: OptimizationResult | undefined;

      // Optimize file if requested and it's an image
      if (optimize && file.type.startsWith("image/")) {
        optimizationResult = await fileOptimizationService.compressImage(
          file,
          compressionOptions
        );
        fileToConvert = optimizationResult.file;
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async () => {
          try {
            const result = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
            const base64 = result.split(",")[1];

            // Cache the result
            await fileOptimizationService.cacheFileData(fileToConvert, base64);

            resolve({ base64, optimizationResult });
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error("Failed to convert file to base64"));
        };

        reader.readAsDataURL(fileToConvert);
      });
    } catch (error) {
      console.warn("File optimization failed, using original file:", error);

      // Fallback to original conversion without optimization
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve({ base64 });
        };

        reader.onerror = () => {
          reject(new Error("Failed to convert file to base64"));
        };

        reader.readAsDataURL(file);
      });
    }
  }

  /**
   * Validates document metadata
   * @param documentType - The document type
   * @param metadata - The document metadata
   * @returns Validation result
   */
  public validateDocumentMetadata(
    documentType: BoatDocumentType | TourDocumentType,
    metadata: {
      documentName?: string;
      expiryDate?: string;
      verificationNotes?: string;
    }
  ): DocumentValidationResult {
    const errors: DocumentError[] = [];

    // Document name validation
    if (metadata.documentName && metadata.documentName.trim().length > 255) {
      errors.push({
        type: "VALIDATION",
        message: "Document name cannot exceed 255 characters.",
        code: "DOCUMENT_NAME_TOO_LONG",
        field: "documentName",
      });
    }

    // Expiry date validation
    if (metadata.expiryDate) {
      const expiryDate = new Date(metadata.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(expiryDate.getTime())) {
        errors.push({
          type: "VALIDATION",
          message: "Invalid expiry date format.",
          code: "INVALID_EXPIRY_DATE",
          field: "expiryDate",
        });
      } else if (expiryDate < today) {
        errors.push({
          type: "VALIDATION",
          message: "Expiry date cannot be in the past.",
          code: "EXPIRY_DATE_IN_PAST",
          field: "expiryDate",
        });
      }
    }

    // Verification notes validation
    if (
      metadata.verificationNotes &&
      metadata.verificationNotes.trim().length > 1000
    ) {
      errors.push({
        type: "VALIDATION",
        message: "Verification notes cannot exceed 1000 characters.",
        code: "VERIFICATION_NOTES_TOO_LONG",
        field: "verificationNotes",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Checks if a document is expiring soon (within 30 days)
   * @param expiryDate - The expiry date string
   * @returns True if expiring soon
   */
  public isDocumentExpiringSoon(expiryDate?: string): boolean {
    if (!expiryDate) return false;

    const expiry = new Date(expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    return expiry <= thirtyDaysFromNow && expiry >= today;
  }

  /**
   * Checks if a document is expired
   * @param expiryDate - The expiry date string
   * @returns True if expired
   */
  public isDocumentExpired(expiryDate?: string): boolean {
    if (!expiryDate) return false;

    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return expiry < today;
  }

  /**
   * Handles document upload errors and provides user-friendly messages
   * @param error - The error object
   * @returns DocumentError with user-friendly message
   */
  public handleDocumentError(error: any): DocumentError {
    if (error.response?.status === 413) {
      return {
        type: "VALIDATION",
        message: "File size too large. Maximum size is 10MB.",
        code: "FILE_TOO_LARGE",
      };
    }

    if (error.response?.status === 415) {
      return {
        type: "VALIDATION",
        message:
          "Invalid file type. Only PDF, JPG, PNG, and WEBP files are allowed.",
        code: "INVALID_FILE_TYPE",
      };
    }

    if (error.response?.status === 400) {
      return {
        type: "VALIDATION",
        message: error.response.data?.message || "Invalid document data.",
        code: "INVALID_DATA",
      };
    }

    if (error.response?.status === 404) {
      return {
        type: "SERVER",
        message: "Document or resource not found.",
        code: "NOT_FOUND",
      };
    }

    if (error.response?.status >= 500) {
      return {
        type: "SERVER",
        message: "Server error occurred. Please try again later.",
        code: "SERVER_ERROR",
      };
    }

    if (!error.response) {
      return {
        type: "NETWORK",
        message: "Network error. Please check your connection and try again.",
        code: "NETWORK_ERROR",
      };
    }

    return {
      type: "SERVER",
      message: "An unexpected error occurred. Please try again.",
      code: "UNKNOWN_ERROR",
    };
  }

  // ==================== ENHANCED ERROR HANDLING ====================

  /**
   * Validates multiple files at once
   * @param files - Array of files to validate
   * @returns Promise with validation results for each file
   */
  public async validateMultipleFiles(
    files: File[]
  ): Promise<Array<{ file: File; validation: DocumentValidationResult }>> {
    const results = await Promise.all(
      files.map(async (file) => ({
        file,
        validation: await this.validateDocumentFile(file),
      }))
    );

    return results;
  }

  /**
   * Validates document type is appropriate for the entity
   * @param documentType - The document type
   * @param entityType - Either 'boat' or 'tour'
   * @returns Validation result
   */
  public validateDocumentTypeForEntity(
    documentType: BoatDocumentType | TourDocumentType,
    entityType: "boat" | "tour"
  ): DocumentValidationResult {
    const errors: DocumentError[] = [];

    if (entityType === "boat") {
      const validBoatTypes = Object.values(BoatDocumentType);
      if (!validBoatTypes.includes(documentType as BoatDocumentType)) {
        errors.push({
          type: "VALIDATION",
          message: "Invalid document type for boat.",
          code: "INVALID_BOAT_DOCUMENT_TYPE",
          field: "documentType",
        });
      }
    } else if (entityType === "tour") {
      const validTourTypes = Object.values(TourDocumentType);
      if (!validTourTypes.includes(documentType as TourDocumentType)) {
        errors.push({
          type: "VALIDATION",
          message: "Invalid document type for tour.",
          code: "INVALID_TOUR_DOCUMENT_TYPE",
          field: "documentType",
        });
      }
    } else {
      errors.push({
        type: "VALIDATION",
        message: "Invalid entity type. Must be 'boat' or 'tour'.",
        code: "INVALID_ENTITY_TYPE",
        field: "entityType",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates complete document creation data
   * @param data - Document creation data
   * @param entityType - Either 'boat' or 'tour'
   * @returns Validation result
   */
  public validateDocumentCreationData(
    data: CreateBoatDocumentDTO | CreateTourDocumentDTO,
    entityType: "boat" | "tour"
  ): DocumentValidationResult {
    const errors: DocumentError[] = [];

    // Validate document type
    const typeValidation = this.validateDocumentTypeForEntity(
      data.documentType,
      entityType
    );
    errors.push(...typeValidation.errors);

    // Validate document data (base64)
    if (!data.documentData || data.documentData.trim().length === 0) {
      errors.push({
        type: "VALIDATION",
        message: "Document data is required.",
        code: "MISSING_DOCUMENT_DATA",
        field: "documentData",
      });
    } else {
      // Basic base64 validation
      try {
        atob(data.documentData);
      } catch {
        errors.push({
          type: "VALIDATION",
          message: "Invalid document data format.",
          code: "INVALID_DOCUMENT_DATA_FORMAT",
          field: "documentData",
        });
      }
    }

    // Validate metadata
    const metadataValidation = this.validateDocumentMetadata(
      data.documentType,
      {
        documentName: data.documentName,
        expiryDate: data.expiryDate,
        verificationNotes: data.verificationNotes,
      }
    );
    errors.push(...metadataValidation.errors);

    // Validate display order
    if (data.displayOrder !== undefined && data.displayOrder < 0) {
      errors.push({
        type: "VALIDATION",
        message: "Display order must be a non-negative number.",
        code: "INVALID_DISPLAY_ORDER",
        field: "displayOrder",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets user-friendly error message based on error type and context
   * @param error - The document error
   * @param context - Additional context about the operation
   * @returns User-friendly error message
   */
  public getUserFriendlyErrorMessage(
    error: DocumentError,
    context?: { fileName?: string; operation?: string }
  ): string {
    const fileName = context?.fileName ? ` for file "${context.fileName}"` : "";
    const operation = context?.operation || "operation";

    switch (error.code) {
      case "FILE_TOO_LARGE":
        return `The file${fileName} is too large. Please select a file smaller than 10MB.`;

      case "INVALID_FILE_TYPE":
        return `The file type${fileName} is not supported. Please select a PDF, JPG, PNG, or WEBP file.`;

      case "EMPTY_FILE":
        return `The selected file${fileName} is empty. Please select a valid file.`;

      case "NO_FILE_SELECTED":
        return "Please select a file to upload.";

      case "DANGEROUS_FILE_TYPE":
        return `The file type${fileName} is not allowed for security reasons.`;

      case "INVALID_FILE_NAME_CHARS":
        return `The file name${fileName} contains invalid characters. Please rename the file.`;

      case "FILE_NAME_TOO_LONG":
        return `The file name${fileName} is too long. Please use a shorter name.`;

      case "MISSING_DOCUMENT_DATA":
        return "Document data is missing. Please try uploading the file again.";

      case "INVALID_DOCUMENT_DATA_FORMAT":
        return "The document data format is invalid. Please try uploading the file again.";

      case "DOCUMENT_NAME_TOO_LONG":
        return "The document name is too long. Please use a shorter name (max 255 characters).";

      case "INVALID_EXPIRY_DATE":
        return "The expiry date format is invalid. Please select a valid date.";

      case "EXPIRY_DATE_IN_PAST":
        return "The expiry date cannot be in the past. Please select a future date.";

      case "VERIFICATION_NOTES_TOO_LONG":
        return "The verification notes are too long. Please use fewer characters (max 1000).";

      case "INVALID_DISPLAY_ORDER":
        return "The display order must be a positive number.";

      case "NOT_FOUND":
        return "The requested document was not found. It may have been deleted.";

      case "SERVER_ERROR":
        return `A server error occurred during the ${operation}. Please try again later.`;

      case "NETWORK_ERROR":
        return `A network error occurred during the ${operation}. Please check your connection and try again.`;

      default:
        return (
          error.message ||
          `An error occurred during the ${operation}. Please try again.`
        );
    }
  }

  /**
   * Retries a document operation with exponential backoff
   * @param operation - The operation to retry
   * @param maxRetries - Maximum number of retries
   * @param baseDelay - Base delay in milliseconds
   * @returns Promise with operation result
   */
  public async retryDocumentOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry validation errors or client errors (except 429)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          if (error.response.status !== 429) {
            throw error;
          }
        }

        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Creates multiple boat documents in batch
   * @param boatId - The boat ID
   * @param documents - Array of document creation data
   * @returns Promise with created documents
   */
  public async createBoatDocumentsBatch(
    boatId: number,
    documents: CreateBoatDocumentDTO[]
  ): Promise<BoatDocumentDTO[]> {
    try {
      const payload = documents.map((doc) => ({ ...doc, boatId }));
      return await this.post<BoatDocumentDTO[]>(
        "/boat-documents/batch",
        payload
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Creates multiple tour documents in batch
   * @param tourId - The tour ID
   * @param documents - Array of document creation data
   * @returns Promise with created documents
   */
  public async createTourDocumentsBatch(
    tourId: number,
    documents: CreateTourDocumentDTO[]
  ): Promise<TourDocumentDTO[]> {
    try {
      const payload = documents.map((doc) => ({ ...doc, tourId }));
      return await this.post<TourDocumentDTO[]>(
        "/tour-documents/batch",
        payload
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Updates display order for multiple boat documents
   * @param updates - Array of document ID and display order pairs
   * @returns Promise that resolves when complete
   */
  public async updateBoatDocumentsDisplayOrder(
    updates: Array<{ id: number; displayOrder: number }>
  ): Promise<void> {
    try {
      return await this.patch<void>(
        "/boat-documents/display-order/batch",
        updates
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  /**
   * Updates display order for multiple tour documents
   * @param updates - Array of document ID and display order pairs
   * @returns Promise that resolves when complete
   */
  public async updateTourDocumentsDisplayOrder(
    updates: Array<{ id: number; displayOrder: number }>
  ): Promise<void> {
    try {
      return await this.patch<void>(
        "/tour-documents/display-order/batch",
        updates
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // ==================== OPTIMIZATION METHODS ====================

  /**
   * Analyzes a file and provides optimization suggestions
   * @param file - The file to analyze
   * @returns Analysis result with suggestions
   */
  public analyzeFileForOptimization(file: File): {
    suggestions: string[];
    canOptimize: boolean;
    estimatedSavings?: number;
    recommendedOptions?: CompressionOptions;
  } {
    const analysis = fileOptimizationService.analyzeFile(file);

    // Add document-specific recommendations
    let recommendedOptions: CompressionOptions | undefined;

    if (file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        recommendedOptions = {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.7,
          format: "jpeg",
          maxFileSize: 2 * 1024 * 1024, // 2MB
        };
      } else if (file.size > 2 * 1024 * 1024) {
        // 2MB
        recommendedOptions = {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: "jpeg",
          maxFileSize: 1 * 1024 * 1024, // 1MB
        };
      }
    }

    return {
      ...analysis,
      recommendedOptions,
    };
  }

  /**
   * Optimizes a file for upload
   * @param file - The file to optimize
   * @param options - Optimization options
   * @returns Promise with optimization result
   */
  public async optimizeFileForUpload(
    file: File,
    options?: CompressionOptions
  ): Promise<OptimizationResult> {
    if (!file.type.startsWith("image/")) {
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        wasCompressed: false,
        format: file.type,
      };
    }

    return await fileOptimizationService.compressImage(file, options);
  }

  /**
   * Estimates upload time for a file
   * @param file - The file to estimate for
   * @param connectionSpeed - Connection speed in bytes per second
   * @returns Upload time estimation
   */
  public estimateUploadTime(
    file: File,
    connectionSpeed?: number
  ): {
    estimatedSeconds: number;
    formattedTime: string;
  } {
    return fileOptimizationService.estimateUploadTime(
      file.size,
      connectionSpeed
    );
  }

  /**
   * Gets cache statistics for file optimization
   * @returns Cache statistics
   */
  public getOptimizationCacheStats(): {
    entries: number;
    totalSize: number;
    maxSize: number;
    formattedTotalSize: string;
    formattedMaxSize: string;
  } {
    const stats = fileOptimizationService.getCacheStats();
    return {
      ...stats,
      formattedTotalSize: this.formatFileSize(stats.totalSize),
      formattedMaxSize: this.formatFileSize(stats.maxSize),
    };
  }

  /**
   * Clears the optimization cache
   */
  public clearOptimizationCache(): void {
    fileOptimizationService.clearCache();
  }

  /**
   * Clears all document service caches
   */
  public clearAllCaches(): void {
    this.requestCache.clear();
    this.pendingRequests.clear();
    fileOptimizationService.clearCache();
  }

  /**
   * Gets cache statistics
   */
  public getCacheStats(): {
    requestCacheSize: number;
    pendingRequests: number;
    optimizationCache: ReturnType<typeof fileOptimizationService.getCacheStats>;
  } {
    return {
      requestCacheSize: this.requestCache.size,
      pendingRequests: this.pendingRequests.size,
      optimizationCache: fileOptimizationService.getCacheStats(),
    };
  }

  /**
   * Validates file with optimization suggestions
   * @param file - The file to validate
   * @returns Promise with enhanced validation result
   */
  public async validateDocumentFileWithOptimization(file: File): Promise<
    DocumentValidationResult & {
      optimizationSuggestions?: string[];
      canOptimize?: boolean;
      estimatedSavings?: number;
    }
  > {
    const baseValidation = await this.validateDocumentFile(file);
    const optimization = this.analyzeFileForOptimization(file);

    return {
      ...baseValidation,
      optimizationSuggestions: optimization.suggestions,
      canOptimize: optimization.canOptimize,
      estimatedSavings: optimization.estimatedSavings,
    };
  }

  /**
   * Formats file size in human readable format
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  private formatFileSize(bytes: number): string {
    return fileOptimizationService.formatFileSize(bytes);
  }
}

export const documentService = new DocumentService();
