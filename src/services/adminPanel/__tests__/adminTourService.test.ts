import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminTourService } from "../adminTourService";
import { tourService } from "../../tourService";
import { documentService } from "../../documentService";

// Mock the dependencies
vi.mock("../../tourService");
vi.mock("../../documentService");

describe("AdminTourService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTourStats", () => {
    it("should calculate tour statistics correctly", async () => {
      // Mock tour data
      const mockTours = [
        {
          id: 1,
          name: "Test Tour 1",
          status: "ACTIVE",
          rating: 4.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Test Tour 2",
          status: "DRAFT",
          rating: 3.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 3,
          name: "Test Tour 3",
          status: "INACTIVE",
          rating: 4.2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(tourService.getTours).mockResolvedValue(mockTours as any);
      vi.mocked(tourService.getTourDocuments).mockResolvedValue([]);

      const stats = await adminTourService.getTourStats();

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(1);
      expect(stats.pending).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.draft).toBe(1);
      expect(stats.averageRating).toBeGreaterThan(0);
    });
  });

  describe("approveTour", () => {
    it("should approve a tour successfully", async () => {
      const tourId = 1;
      const approvalRequest = {
        tourId,
        action: "approve" as const,
        note: "Tour approved after review",
      };

      vi.mocked(tourService.updateTourStatus).mockResolvedValue();

      await expect(
        adminTourService.approveTour(approvalRequest)
      ).resolves.not.toThrow();

      expect(tourService.updateTourStatus).toHaveBeenCalledWith(
        tourId,
        "ACTIVE"
      );
    });
  });

  describe("rejectTour", () => {
    it("should reject a tour successfully", async () => {
      const tourId = 1;
      const rejectionRequest = {
        tourId,
        action: "reject" as const,
        reason: "Tour content inappropriate",
      };

      vi.mocked(tourService.updateTourStatus).mockResolvedValue();

      await expect(
        adminTourService.rejectTour(rejectionRequest)
      ).resolves.not.toThrow();

      expect(tourService.updateTourStatus).toHaveBeenCalledWith(
        tourId,
        "INACTIVE"
      );
    });
  });

  describe("verifyTourDocument", () => {
    it("should verify a tour document successfully", async () => {
      const documentId = 1;
      const mockDocument = {
        id: documentId,
        tourId: 1,
        documentType: "license",
        isVerified: false,
      };

      vi.mocked(documentService.getTourDocument).mockResolvedValue(
        mockDocument as any
      );
      vi.mocked(documentService.updateTourDocument).mockResolvedValue(
        mockDocument as any
      );

      const result = await adminTourService.verifyTourDocument(
        documentId,
        "verified",
        "Document is valid"
      );

      expect(result.documentId).toBe(documentId);
      expect(result.status).toBe("verified");
      expect(result.reason).toBe("Document is valid");
      expect(documentService.updateTourDocument).toHaveBeenCalledWith({
        id: documentId,
        isVerified: true,
        verificationNotes: "Document is valid",
      });
    });
  });

  describe("performBulkOperation", () => {
    it("should perform bulk approval operation", async () => {
      const bulkOperation = {
        tourIds: [1, 2, 3],
        operation: "approve" as const,
        note: "Bulk approval",
      };

      vi.mocked(tourService.updateTourStatus).mockResolvedValue();

      await expect(
        adminTourService.performBulkOperation(bulkOperation)
      ).resolves.not.toThrow();

      expect(tourService.updateTourStatus).toHaveBeenCalledTimes(3);
    });
  });

  describe("getTourDocumentsWithVerification", () => {
    it("should enhance documents with verification status", async () => {
      const tourId = 1;
      const mockDocuments = [
        {
          id: 1,
          tourId,
          isVerified: true,
          verificationNotes: "Verified",
          expiryDate: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000
          ).toISOString(), // 60 days from now
        },
        {
          id: 2,
          tourId,
          isVerified: false,
          verificationNotes: null,
          expiryDate: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000
          ).toISOString(), // 10 days ago (expired)
        },
      ];

      vi.mocked(tourService.getTourDocuments).mockResolvedValue(
        mockDocuments as any
      );

      const result = await adminTourService.getTourDocumentsWithVerification(
        tourId
      );

      expect(result).toHaveLength(2);
      expect(result[0].verificationStatus).toBe("verified");
      expect(result[0].isExpired).toBe(false);
      expect(result[1].verificationStatus).toBe("pending");
      expect(result[1].isExpired).toBe(true);
    });
  });

  describe("getTourPerformanceMetrics", () => {
    it("should calculate performance metrics", async () => {
      const mockTours = [
        {
          id: 1,
          name: "High Performing Tour",
          status: "ACTIVE",
          rating: 4.8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          guideId: 1,
        },
        {
          id: 2,
          name: "Low Performing Tour",
          status: "ACTIVE",
          rating: 2.5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          guideId: 2,
        },
      ];

      vi.mocked(tourService.getTours).mockResolvedValue(mockTours as any);
      vi.mocked(tourService.getTourDocuments).mockResolvedValue([]);

      const metrics = await adminTourService.getTourPerformanceMetrics();

      expect(metrics.topPerformingTours).toBeDefined();
      expect(metrics.underPerformingTours).toBeDefined();
      expect(metrics.averageMetrics).toBeDefined();
      expect(metrics.averageMetrics.averageRating).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getTourStatsByGuide", () => {
    it("should calculate statistics by guide", async () => {
      const mockTours = [
        {
          id: 1,
          name: "Tour 1",
          status: "ACTIVE",
          rating: 4.5,
          guideId: 1,
          location: "Istanbul",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Tour 2",
          status: "ACTIVE",
          rating: 4.0,
          guideId: 1,
          location: "Ankara",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(tourService.getTours).mockResolvedValue(mockTours as any);
      vi.mocked(tourService.getTourDocuments).mockResolvedValue([]);

      const stats = await adminTourService.getTourStatsByGuide();

      expect(stats).toHaveLength(1);
      expect(stats[0].guideId).toBe(1);
      expect(stats[0].totalTours).toBe(2);
      expect(stats[0].activeTours).toBe(2);
      expect(stats[0].averageRating).toBe(4.25);
    });
  });

  describe("getTourStatsByLocation", () => {
    it("should calculate statistics by location", async () => {
      const mockTours = [
        {
          id: 1,
          name: "Tour 1",
          status: "ACTIVE",
          rating: 4.5,
          guideId: 1,
          location: "Istanbul",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: "Tour 2",
          status: "ACTIVE",
          rating: 4.0,
          guideId: 2,
          location: "Istanbul",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      vi.mocked(tourService.getTours).mockResolvedValue(mockTours as any);
      vi.mocked(tourService.getTourDocuments).mockResolvedValue([]);

      const stats = await adminTourService.getTourStatsByLocation();

      expect(stats).toHaveLength(1);
      expect(stats[0].location).toBe("Istanbul");
      expect(stats[0].totalTours).toBe(2);
      expect(stats[0].activeTours).toBe(2);
      expect(stats[0].averageRating).toBe(4.25);
    });
  });


  describe("updateTourContent", () => {
    it("should update tour content and add note", async () => {
      const tourId = 1;
      const updates = {
        name: "Updated Tour Name",
        price: 150,
      };

      const mockTour = {
        id: tourId,
        name: "Original Tour",
        price: 100,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      vi.mocked(tourService.getTourById).mockResolvedValue(mockTour as any);
      vi.mocked(tourService.updateTour).mockResolvedValue({
        ...mockTour,
        ...updates,
      } as any);

      const result = await adminTourService.updateTourContent(tourId, updates);

      expect(result.name).toBe("Updated Tour Name");
      expect(result.price).toBe(150);
      expect(tourService.updateTour).toHaveBeenCalledWith({
        id: tourId,
        ...updates,
      });
    });
  });
});
