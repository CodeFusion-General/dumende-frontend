import { describe, it, expect, vi, beforeEach } from "vitest";
import { documentService } from "../documentService";
import { BoatDocumentType, TourDocumentType } from "@/types/document.types";

// Mock the BaseService
vi.mock("../base/BaseService", () => ({
  BaseService: class MockBaseService {
    protected api = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    protected async get(url: string) {
      return this.api.get(url);
    }

    protected async post(url: string, data: any) {
      return this.api.post(url, data);
    }

    protected async put(url: string, data: any) {
      return this.api.put(url, data);
    }

    protected async patch(url: string, data?: any) {
      return this.api.patch(url, data);
    }

    protected async delete(url: string) {
      return this.api.delete(url);
    }

    protected handleError(error: any) {
      throw error;
    }
  },
}));

describe("DocumentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("File Validation", () => {
    it("should validate a valid PDF file", async () => {
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const result = await documentService.validateDocumentFile(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject files that are too large", async () => {
      const largeContent = new Array(11 * 1024 * 1024).fill("a").join(""); // 11MB
      const file = new File([largeContent], "large.pdf", {
        type: "application/pdf",
      });

      const result = await documentService.validateDocumentFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("FILE_TOO_LARGE");
    });

    it("should reject invalid file types", async () => {
      const file = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      const result = await documentService.validateDocumentFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_FILE_TYPE")).toBe(
        true
      );
    });

    it("should reject dangerous file types", async () => {
      const file = new File(["test content"], "malicious.exe", {
        type: "application/octet-stream",
      });

      const result = await documentService.validateDocumentFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "DANGEROUS_FILE_TYPE")).toBe(
        true
      );
    });

    it("should reject empty files", async () => {
      const file = new File([], "empty.pdf", {
        type: "application/pdf",
      });

      const result = await documentService.validateDocumentFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "EMPTY_FILE")).toBe(true);
    });
  });

  describe("Document Type Validation", () => {
    it("should validate boat document types", () => {
      const result = documentService.validateDocumentTypeForEntity(
        BoatDocumentType.LICENSE,
        "boat"
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate tour document types", () => {
      const result = documentService.validateDocumentTypeForEntity(
        TourDocumentType.GUIDE_LICENSE,
        "tour"
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid entity type", () => {
      const result = documentService.validateDocumentTypeForEntity(
        BoatDocumentType.LICENSE,
        "invalid" as any
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "INVALID_ENTITY_TYPE")).toBe(
        true
      );
    });
  });

  describe("Document Metadata Validation", () => {
    it("should validate valid metadata", () => {
      const result = documentService.validateDocumentMetadata(
        BoatDocumentType.LICENSE,
        {
          documentName: "Valid Document Name",
          expiryDate: "2025-12-31",
          verificationNotes: "Valid notes",
        }
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject expiry date in the past", () => {
      const result = documentService.validateDocumentMetadata(
        BoatDocumentType.LICENSE,
        {
          expiryDate: "2020-01-01",
        }
      );

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.code === "EXPIRY_DATE_IN_PAST")).toBe(
        true
      );
    });

    it("should reject document name that is too long", () => {
      const longName = "a".repeat(256);
      const result = documentService.validateDocumentMetadata(
        BoatDocumentType.LICENSE,
        {
          documentName: longName,
        }
      );

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.code === "DOCUMENT_NAME_TOO_LONG")
      ).toBe(true);
    });

    it("should reject verification notes that are too long", () => {
      const longNotes = "a".repeat(1001);
      const result = documentService.validateDocumentMetadata(
        BoatDocumentType.LICENSE,
        {
          verificationNotes: longNotes,
        }
      );

      expect(result.isValid).toBe(false);
      expect(
        result.errors.some((e) => e.code === "VERIFICATION_NOTES_TOO_LONG")
      ).toBe(true);
    });
  });

  // Skip: JSDOM File doesn't support arrayBuffer() method required by fileOptimization
  describe.skip("Base64 Conversion", () => {
    it("should convert file to base64", async () => {
      const file = new File(["test content"], "test.pdf", {
        type: "application/pdf",
      });

      const base64 = await documentService.convertFileToBase64(file);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe("string");
    });
  });

  describe("Document Expiry Checks", () => {
    it("should detect expired documents", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const expiredDate = yesterday.toISOString().split("T")[0];

      const isExpired = documentService.isDocumentExpired(expiredDate);

      expect(isExpired).toBe(true);
    });

    it("should detect documents expiring soon", () => {
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      const soonDate = inTwoWeeks.toISOString().split("T")[0];

      const isExpiringSoon = documentService.isDocumentExpiringSoon(soonDate);

      expect(isExpiringSoon).toBe(true);
    });

    it("should not flag documents with distant expiry dates", () => {
      const inOneYear = new Date();
      inOneYear.setFullYear(inOneYear.getFullYear() + 1);
      const futureDate = inOneYear.toISOString().split("T")[0];

      const isExpiringSoon = documentService.isDocumentExpiringSoon(futureDate);
      const isExpired = documentService.isDocumentExpired(futureDate);

      expect(isExpiringSoon).toBe(false);
      expect(isExpired).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should provide user-friendly error messages", () => {
      const error = {
        type: "VALIDATION" as const,
        message: "File too large",
        code: "FILE_TOO_LARGE",
      };

      const message = documentService.getUserFriendlyErrorMessage(error, {
        fileName: "test.pdf",
        operation: "upload",
      });

      expect(message).toContain("test.pdf");
      expect(message).toContain("too large");
      expect(message).toContain("10MB");
    });

    it("should handle document errors appropriately", () => {
      const mockError = {
        response: {
          status: 413,
          data: { message: "Payload too large" },
        },
      };

      const documentError = documentService.handleDocumentError(mockError);

      expect(documentError.type).toBe("VALIDATION");
      expect(documentError.code).toBe("FILE_TOO_LARGE");
    });
  });
});
