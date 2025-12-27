import { BaseService } from "../base/BaseService";
import { tourService } from "../tourService";
import {
  AdminTourView,
  AdminTourNote,
  AdminTourFilters,
  AdminTourStats,
  TourBulkOperation,
  TourApprovalRequest,
  AdminTourSearchOptions,
  TourDocumentVerification,
} from "@/types/adminTour";
import { TourDTO, TourStatus } from "@/types/tour.types";
import { documentService } from "../documentService";

class AdminTourService extends BaseService {
  constructor() {
    super("/admin/tours"); // axios baseURL zaten /api
  }

  // ======= Tour Management Operations =======

  /**
   * Get all tours with admin-specific information from backend
   */
  public async getAdminTours(options?: AdminTourSearchOptions): Promise<{
    tours: AdminTourView[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      // Build query params
      const params = new URLSearchParams();
      params.set("page", String((options?.page || 1) - 1)); // Backend uses 0-indexed pages
      params.set("size", String(options?.limit || 20));

      if (options?.filters?.approvalStatus?.length) {
        params.set("approvalStatus", options.filters.approvalStatus[0]);
      }
      if (options?.query) {
        params.set("guideName", options.query);
      }

      // Call backend endpoint - returns AdminTourListResponseDTO
      const response = await this.get<{
        tours: Array<{
          id: number;
          name: string;
          description: string;
          type: string | null;
          duration: number | null;
          price: number | null;
          location: string;
          status: string | null;
          rating: number | null;
          reviewCount: number | null;
          createdAt: string;
          updatedAt: string;
          guideInfo: {
            id: number;
            name: string;
            email: string;
            phone: string;
          } | null;
          approvalStatus: string;
          approvalDate: string | null;
          rejectionReason: string | null;
        }>;
        totalCount: number;
        page: number;
        size: number;
        totalPages: number;
      }>(`?${params.toString()}`);

      // Map backend response to frontend AdminTourView
      const tours: AdminTourView[] = (response.tours || []).map((tour) => this.mapBackendTourToAdminView(tour));

      // Apply client-side search if needed (backend may not support full-text search)
      let filteredTours = tours;
      if (options?.query) {
        filteredTours = this.applySearch(tours, options.query);
      }

      // Apply client-side sorting if needed
      if (options?.sortBy) {
        filteredTours = this.applySorting(
          filteredTours,
          options.sortBy,
          options.sortOrder || "desc"
        );
      }

      return {
        tours: filteredTours,
        total: response.totalCount || 0,
        page: (response.page || 0) + 1, // Convert to 1-indexed for frontend
        limit: response.size || 20,
      };
    } catch (error) {
      console.error("AdminTourService.getAdminTours error:", error);
      // Fallback to client-side approach if backend fails
      return this.getAdminToursClientSide(options);
    }
  }

  /**
   * Fallback: Get tours using client-side approach
   */
  private async getAdminToursClientSide(options?: AdminTourSearchOptions): Promise<{
    tours: AdminTourView[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const tours = await tourService.getTours();
      const adminTours = await Promise.all(
        tours.map((tour) => this.enhanceTourWithAdminData(tour))
      );

      let filteredTours = adminTours;
      if (options?.filters) {
        filteredTours = this.applyFilters(adminTours, options.filters);
      }
      if (options?.query) {
        filteredTours = this.applySearch(filteredTours, options.query);
      }
      if (options?.sortBy) {
        filteredTours = this.applySorting(
          filteredTours,
          options.sortBy,
          options.sortOrder || "desc"
        );
      }

      const page = options?.page || 1;
      const limit = options?.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginatedTours = filteredTours.slice(startIndex, startIndex + limit);

      return {
        tours: paginatedTours,
        total: filteredTours.length,
        page,
        limit,
      };
    } catch (error) {
      console.error("AdminTourService.getAdminToursClientSide error:", error);
      throw error;
    }
  }

  /**
   * Map backend tour response to frontend AdminTourView
   */
  private mapBackendTourToAdminView(tour: {
    id: number;
    name: string;
    description: string;
    type: string | null;
    duration: number | null;
    price: number | null;
    location: string;
    status: string | null;
    rating: number | null;
    reviewCount: number | null;
    createdAt: string;
    updatedAt: string;
    guideInfo: {
      id: number;
      name: string;
      email: string;
      phone: string;
    } | null;
    approvalStatus: string;
    approvalDate: string | null;
    rejectionReason: string | null;
  }): AdminTourView {
    return {
      id: tour.id,
      name: tour.name || "",
      description: tour.description || "",
      tourType: tour.type || undefined,
      price: tour.price || 0,
      location: tour.location || "",
      status: (tour.status as TourStatus) || "DRAFT",
      rating: tour.rating || 0,
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      guideId: tour.guideInfo?.id || 0,
      guideInfo: tour.guideInfo ? {
        id: tour.guideInfo.id,
        name: tour.guideInfo.name || "Bilinmiyor",
        email: tour.guideInfo.email || "",
        phone: tour.guideInfo.phone || "",
        joinDate: "",
        isVerified: true,
        isCertified: true,
        totalTours: 0,
        rating: 0,
        responseRate: 0,
      } : {
        id: 0,
        name: "Bilinmiyor",
        email: "",
        phone: "",
        joinDate: "",
        isVerified: false,
        isCertified: false,
        totalTours: 0,
        rating: 0,
        responseRate: 0,
      },
      approvalStatus: (tour.approvalStatus as "pending" | "approved" | "rejected" | "suspended") || "pending",
      approvalDate: tour.approvalDate || undefined,
      rejectionReason: tour.rejectionReason || undefined,
      moderationNotes: [],
      documentStatus: { total: 0, verified: 0, pending: 0, expired: 0, expiringSoon: 0 },
      bookingStats: { totalBookings: 0, thisMonthBookings: 0, revenue: 0, averageRating: 0, completionRate: 0 },
      lastActivity: tour.updatedAt,
      isActive: tour.status === "ACTIVE",
      isFeatured: false,
      viewCount: 0,
      reportCount: 0,
      maxGuests: 0,
      tourImages: [],
      tourDates: [],
      capacity: 0,
    } as AdminTourView;
  }

  /**
   * Get single tour with admin information
   */
  public async getAdminTour(tourId: number): Promise<AdminTourView> {
    try {
      const tour = await tourService.getTourById(tourId);
      return await this.enhanceTourWithAdminData(tour);
    } catch (error) {
      console.error("AdminTourService.getAdminTour error:", error);
      throw error;
    }
  }

  /**
   * Get tours by status for admin panel
   */
  public async getToursByStatus(status: TourStatus): Promise<AdminTourView[]> {
    try {
      const tours = await tourService.getTours();
      const filteredTours = tours.filter((tour) => tour.status === status);
      return await Promise.all(
        filteredTours.map((tour) => this.enhanceTourWithAdminData(tour))
      );
    } catch (error) {
      console.error("AdminTourService.getToursByStatus error:", error);
      throw error;
    }
  }

  /**
   * Get tours by guide for admin panel
   */
  public async getToursByGuide(guideId: number): Promise<AdminTourView[]> {
    try {
      const tours = await tourService.getToursByGuideId(guideId);
      return await Promise.all(
        tours.map((tour) => this.enhanceTourWithAdminData(tour))
      );
    } catch (error) {
      console.error("AdminTourService.getToursByGuide error:", error);
      throw error;
    }
  }

  // ======= Tour Moderation Operations =======

  /**
   * Approve a tour
   */
  public async approveTour(request: TourApprovalRequest): Promise<void> {
    try {
      // Update tour status to active
      await tourService.updateTourStatus(request.tourId, "ACTIVE");

      // Add admin note
      if (request.note) {
        await this.addTourNote(request.tourId, {
          note: request.note,
          type: "approval",
        });
      }

      // Verify documents if provided
      if (request.documentVerifications) {
        for (const verification of request.documentVerifications) {
          // This would be implemented when document verification is available
          console.log("Document verification:", verification);
        }
      }

      console.log(`Tour ${request.tourId} approved successfully`);
    } catch (error) {
      console.error("AdminTourService.approveTour error:", error);
      throw error;
    }
  }

  /**
   * Reject a tour
   */
  public async rejectTour(request: TourApprovalRequest): Promise<void> {
    try {
      // Update tour status to inactive
      await tourService.updateTourStatus(request.tourId, "INACTIVE");

      // Add admin note with rejection reason
      await this.addTourNote(request.tourId, {
        note: request.reason || "Tour rejected",
        type: "rejection",
      });

      console.log(`Tour ${request.tourId} rejected successfully`);
    } catch (error) {
      console.error("AdminTourService.rejectTour error:", error);
      throw error;
    }
  }

  /**
   * Suspend a tour
   */
  public async suspendTour(tourId: number, reason?: string): Promise<void> {
    try {
      await tourService.updateTourStatus(tourId, "INACTIVE");

      if (reason) {
        await this.addTourNote(tourId, {
          note: reason,
          type: "warning",
        });
      }

      console.log(`Tour ${tourId} suspended successfully`);
    } catch (error) {
      console.error("AdminTourService.suspendTour error:", error);
      throw error;
    }
  }

  /**
   * Activate a tour
   */
  public async activateTour(tourId: number, note?: string): Promise<void> {
    try {
      await tourService.updateTourStatus(tourId, "ACTIVE");

      if (note) {
        await this.addTourNote(tourId, {
          note,
          type: "info",
        });
      }

      console.log(`Tour ${tourId} activated successfully`);
    } catch (error) {
      console.error("AdminTourService.activateTour error:", error);
      throw error;
    }
  }

  // ======= Bulk Operations =======

  /**
   * Perform bulk operations on tours
   */
  public async performBulkOperation(
    operation: TourBulkOperation
  ): Promise<void> {
    try {
      const promises = operation.tourIds.map(async (tourId) => {
        switch (operation.operation) {
          case "approve":
            return this.approveTour({
              tourId,
              action: "approve",
              note: operation.note,
            });
          case "reject":
            return this.rejectTour({
              tourId,
              action: "reject",
              reason: operation.reason,
              note: operation.note,
            });
          case "suspend":
            return this.suspendTour(tourId, operation.reason);
          case "activate":
            return this.activateTour(tourId, operation.note);
          case "delete":
            return tourService.deleteTour(tourId);
          default:
            throw new Error(
              `Unsupported bulk operation: ${operation.operation}`
            );
        }
      });

      await Promise.all(promises);
      console.log(
        `Bulk operation ${operation.operation} completed for ${operation.tourIds.length} tours`
      );
    } catch (error) {
      console.error("AdminTourService.performBulkOperation error:", error);
      throw error;
    }
  }

  // ======= Document Verification =======

  /**
   * Verify a tour document
   */
  public async verifyTourDocument(
    documentId: number,
    status: "verified" | "rejected",
    reason?: string
  ): Promise<TourDocumentVerification> {
    try {
      // Get the document first to ensure it exists
      const document = await documentService.getTourDocument(documentId);

      // Create verification record
      const adminInfo = this.getCurrentAdminInfo();
      const verification: TourDocumentVerification = {
        documentId,
        status,
        reason,
        verifiedBy: adminInfo.id,
        verifiedAt: new Date().toISOString(),
      };

      // Update document verification status using existing document service
      await documentService.updateTourDocument({
        id: documentId,
        isVerified: status === "verified",
        verificationNotes: reason,
      });

      console.log(`Document ${documentId} ${status}:`, reason);
      return verification;
    } catch (error) {
      console.error("AdminTourService.verifyTourDocument error:", error);
      throw error;
    }
  }

  /**
   * Bulk verify tour documents
   */
  public async bulkVerifyTourDocuments(
    documentIds: number[],
    status: "verified" | "rejected",
    reason?: string
  ): Promise<TourDocumentVerification[]> {
    try {
      const promises = documentIds.map((documentId) =>
        this.verifyTourDocument(documentId, status, reason)
      );

      const results = await Promise.all(promises);
      console.log(
        `Bulk ${status} completed for ${documentIds.length} documents`
      );
      return results;
    } catch (error) {
      console.error("AdminTourService.bulkVerifyTourDocuments error:", error);
      throw error;
    }
  }

  /**
   * Get tour documents with verification status
   */
  public async getTourDocumentsWithVerification(
    tourId: number
  ): Promise<Array<any>> {
    try {
      const documents = await tourService.getTourDocuments(tourId);

      // Enhance documents with verification information
      return documents.map((doc) => ({
        ...doc,
        verificationStatus: doc.isVerified ? "verified" : "pending",
        verificationNotes: doc.verificationNotes,
        isExpired: doc.expiryDate
          ? new Date(doc.expiryDate) < new Date()
          : false,
        isExpiringSoon: doc.expiryDate
          ? new Date(doc.expiryDate) <=
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : false,
      }));
    } catch (error) {
      console.error(
        "AdminTourService.getTourDocumentsWithVerification error:",
        error
      );
      throw error;
    }
  }

  /**
   * Get documents requiring verification
   */
  public async getDocumentsRequiringVerification(): Promise<Array<any>> {
    try {
      // This would ideally be a backend endpoint that returns all unverified documents
      // For now, we'll simulate by getting all tours and checking their documents
      const tours = await tourService.getTours();
      const allDocuments = [];

      for (const tour of tours) {
        try {
          const documents = await this.getTourDocumentsWithVerification(
            tour.id
          );
          const unverifiedDocs = documents
            .filter((doc) => doc.verificationStatus === "pending")
            .map((doc) => ({
              ...doc,
              tourId: tour.id,
              tourName: tour.name,
              guideId: tour.guideId,
            }));
          allDocuments.push(...unverifiedDocs);
        } catch (error) {
          console.warn(`Failed to get documents for tour ${tour.id}:`, error);
        }
      }

      return allDocuments;
    } catch (error) {
      console.error(
        "AdminTourService.getDocumentsRequiringVerification error:",
        error
      );
      throw error;
    }
  }

  // ======= Advanced Tour Management =======

  /**
   * Update tour content (admin-only)
   */
  public async updateTourContent(
    tourId: number,
    updates: {
      name?: string;
      description?: string;
      price?: number;
      maxGuests?: number;
      location?: string;
      tourType?: string;
    }
  ): Promise<TourDTO> {
    try {
      const tour = await tourService.getTourById(tourId);

      const updateData = {
        id: tourId,
        ...updates,
      };

      const updatedTour = await tourService.updateTour(updateData);

      // Add admin note about the content update
      await this.addTourNote(tourId, {
        note: `Tour content updated: ${Object.keys(updates).join(", ")}`,
        type: "info",
      });

      return updatedTour;
    } catch (error) {
      console.error("AdminTourService.updateTourContent error:", error);
      throw error;
    }
  }

  /**
   * Feature/unfeature a tour
   */
  public async setTourFeatured(
    tourId: number,
    featured: boolean,
    reason?: string
  ): Promise<void> {
    try {
      // This would update a featured flag in the database
      // For now, we'll just add a note
      await this.addTourNote(tourId, {
        note: `Tour ${featured ? "featured" : "unfeatured"}${
          reason ? `: ${reason}` : ""
        }`,
        type: featured ? "important" : "info",
      });

      console.log(`Tour ${tourId} ${featured ? "featured" : "unfeatured"}`);
    } catch (error) {
      console.error("AdminTourService.setTourFeatured error:", error);
      throw error;
    }
  }

  /**
   * Manage tour dates (admin operations)
   */
  public async manageTourDates(
    tourId: number,
    operation: "add" | "remove" | "update",
    dateData?: any
  ): Promise<void> {
    try {
      switch (operation) {
        case "add":
          if (dateData) {
            await tourService.createTourDate({
              tourId,
              ...dateData,
            });
          }
          break;
        case "remove":
          if (dateData?.dateId) {
            await tourService.deleteTourDate(dateData.dateId);
          }
          break;
        case "update":
          if (dateData) {
            await tourService.updateTourDate(dateData);
          }
          break;
      }

      await this.addTourNote(tourId, {
        note: `Tour dates ${operation}ed`,
        type: "info",
      });
    } catch (error) {
      console.error("AdminTourService.manageTourDates error:", error);
      throw error;
    }
  }

  /**
   * Get tour moderation history
   */
  public async getTourModerationHistory(tourId: number): Promise<
    Array<{
      action: string;
      adminId: number;
      adminName: string;
      timestamp: string;
      reason?: string;
      details?: any;
    }>
  > {
    try {
      // This would fetch from a moderation history table
      // For now, return the notes as moderation history
      const notes = await this.getTourNotes(tourId);

      return notes.map((note) => ({
        action: note.type,
        adminId: note.adminId,
        adminName: note.adminName,
        timestamp: note.createdAt,
        reason: note.note,
        details: null,
      }));
    } catch (error) {
      console.error("AdminTourService.getTourModerationHistory error:", error);
      throw error;
    }
  }

  /**
   * Generate tour report
   */
  public async generateTourReport(
    tourId: number,
    includeFinancials: boolean = false
  ): Promise<{
    tour: AdminTourView;
    documents: any[];
    moderationHistory: any[];
    bookingStats: any;
    financialData?: any;
  }> {
    try {
      const tour = await this.getAdminTour(tourId);
      const documents = await this.getTourDocumentsWithVerification(tourId);
      const moderationHistory = await this.getTourModerationHistory(tourId);
      const bookingStats = await this.getBookingStats(tourId);

      const report: any = {
        tour,
        documents,
        moderationHistory,
        bookingStats,
      };

      if (includeFinancials) {
        report.financialData = {
          totalRevenue: tour.bookingStats.revenue,
          commission: tour.bookingStats.revenue * 0.15, // 15% commission
          netRevenue: tour.bookingStats.revenue * 0.85,
          averageBookingValue:
            tour.bookingStats.totalBookings > 0
              ? tour.bookingStats.revenue / tour.bookingStats.totalBookings
              : 0,
        };
      }

      return report;
    } catch (error) {
      console.error("AdminTourService.generateTourReport error:", error);
      throw error;
    }
  }

  // ======= Tour Notes Management =======

  /**
   * Add a note to a tour
   */
  public async addTourNote(
    tourId: number,
    note: Omit<
      AdminTourNote,
      "id" | "adminId" | "adminName" | "createdAt" | "isVisible"
    >
  ): Promise<AdminTourNote> {
    try {
      // This would be implemented with proper backend support
      const adminInfo = this.getCurrentAdminInfo();
      const newNote: AdminTourNote = {
        id: Date.now(), // Temporary ID
        adminId: adminInfo.id,
        adminName: adminInfo.name,
        createdAt: new Date().toISOString(),
        isVisible: true,
        ...note,
      };

      console.log(`Note added to tour ${tourId}:`, newNote);
      return newNote;
    } catch (error) {
      console.error("AdminTourService.addTourNote error:", error);
      throw error;
    }
  }

  /**
   * Get tour notes
   */
  public async getTourNotes(tourId: number): Promise<AdminTourNote[]> {
    try {
      // This would be implemented with proper backend support
      // For now, return empty array
      return [];
    } catch (error) {
      console.error("AdminTourService.getTourNotes error:", error);
      throw error;
    }
  }

  // ======= Statistics =======

  /**
   * Get tour statistics for admin dashboard from backend
   */
  public async getTourStats(): Promise<AdminTourStats> {
    try {
      // Call backend statistics endpoint
      const response = await this.get<{
        success: boolean;
        data: {
          totalTours: number;
          activeTours: number;
          pendingTours: number;
          rejectedTours: number;
          newToursThisMonth: number;
          toursByType: Record<string, number>;
          toursByLocation: Record<string, number>;
        };
        message: string;
      }>("/statistics");

      const backendStats = response.data;

      // Map backend response to frontend AdminTourStats
      const stats: AdminTourStats = {
        total: backendStats.totalTours,
        active: backendStats.activeTours,
        pending: backendStats.pendingTours,
        rejected: backendStats.rejectedTours,
        suspended: 0, // Backend doesn't track this separately
        draft: 0, // Backend doesn't track this separately
        newThisMonth: backendStats.newToursThisMonth,
        totalRevenue: 0, // Would need booking integration
        thisMonthRevenue: 0, // Would need booking integration
        averageRating: 0, // Would need review integration
        totalBookings: 0, // Would need booking integration
        completionRate: 0, // Would need booking integration
        reportedTours: 0, // Would need report integration
        expiredDocuments: 0, // Would need document integration
        expiringSoonDocuments: 0, // Would need document integration
      };

      return stats;
    } catch (error) {
      console.error("AdminTourService.getTourStats error:", error);
      // Fallback to client-side calculation
      return this.getTourStatsClientSide();
    }
  }

  /**
   * Fallback: Calculate tour statistics client-side
   */
  private async getTourStatsClientSide(): Promise<AdminTourStats> {
    try {
      const tours = await tourService.getTours();

      const stats: AdminTourStats = {
        total: tours.length,
        active: tours.filter((t) => t.status === "ACTIVE").length,
        pending: tours.filter((t) => t.status === "DRAFT" || t.status === "PENDING").length,
        rejected: tours.filter((t) => t.status === "INACTIVE" || t.status === "REJECTED").length,
        suspended: 0,
        draft: tours.filter((t) => t.status === "DRAFT").length,
        newThisMonth: this.getNewThisMonth(tours),
        totalRevenue: 0,
        thisMonthRevenue: 0,
        averageRating: this.calculateAverageRating(tours),
        totalBookings: 0,
        completionRate: 0,
        reportedTours: 0,
        expiredDocuments: 0,
        expiringSoonDocuments: 0,
      };

      return stats;
    } catch (error) {
      console.error("AdminTourService.getTourStatsClientSide error:", error);
      throw error;
    }
  }

  /**
   * Get detailed tour statistics by period
   */
  public async getTourStatsByPeriod(
    period: "daily" | "weekly" | "monthly" | "yearly",
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      period: string;
      totalTours: number;
      activeTours: number;
      newTours: number;
      revenue: number;
      bookings: number;
    }>
  > {
    try {
      const tours = await tourService.getTours();

      // This would be enhanced with proper date filtering and booking data
      const now = new Date();
      const stats = [];

      // Generate sample data based on period
      const periods = this.generatePeriods(period, startDate, endDate);

      for (const periodKey of periods) {
        stats.push({
          period: periodKey,
          totalTours: Math.floor(Math.random() * tours.length),
          activeTours: Math.floor(Math.random() * tours.length * 0.8),
          newTours: Math.floor(Math.random() * 10),
          revenue: Math.floor(Math.random() * 50000),
          bookings: Math.floor(Math.random() * 100),
        });
      }

      return stats;
    } catch (error) {
      console.error("AdminTourService.getTourStatsByPeriod error:", error);
      throw error;
    }
  }

  /**
   * Get tour performance metrics
   */
  public async getTourPerformanceMetrics(): Promise<{
    topPerformingTours: Array<{
      id: number;
      name: string;
      revenue: number;
      bookings: number;
      rating: number;
    }>;
    underPerformingTours: Array<{
      id: number;
      name: string;
      revenue: number;
      bookings: number;
      rating: number;
      issues: string[];
    }>;
    averageMetrics: {
      bookingsPerTour: number;
      revenuePerTour: number;
      averageRating: number;
      completionRate: number;
    };
  }> {
    try {
      const tours = await tourService.getTours();
      const enhancedTours = await Promise.all(
        tours.map((tour) => this.enhanceTourWithAdminData(tour))
      );

      // Sort by revenue for top performers
      const topPerforming = enhancedTours
        .sort((a, b) => b.bookingStats.revenue - a.bookingStats.revenue)
        .slice(0, 10)
        .map((tour) => ({
          id: tour.id,
          name: tour.name,
          revenue: tour.bookingStats.revenue,
          bookings: tour.bookingStats.totalBookings,
          rating: tour.rating || 0,
        }));

      // Identify underperforming tours
      const underPerforming = enhancedTours
        .filter((tour) => {
          const issues = [];
          if (tour.bookingStats.revenue < 1000) issues.push("Low revenue");
          if (tour.bookingStats.totalBookings < 5) issues.push("Few bookings");
          if ((tour.rating || 0) < 3.5) issues.push("Low rating");
          if (tour.documentStatus.expired > 0) issues.push("Expired documents");
          return issues.length > 0;
        })
        .slice(0, 10)
        .map((tour) => ({
          id: tour.id,
          name: tour.name,
          revenue: tour.bookingStats.revenue,
          bookings: tour.bookingStats.totalBookings,
          rating: tour.rating || 0,
          issues: [],
        }));

      // Calculate average metrics
      const totalBookings = enhancedTours.reduce(
        (sum, tour) => sum + tour.bookingStats.totalBookings,
        0
      );
      const totalRevenue = enhancedTours.reduce(
        (sum, tour) => sum + tour.bookingStats.revenue,
        0
      );
      const totalRating = enhancedTours.reduce(
        (sum, tour) => sum + (tour.rating || 0),
        0
      );

      return {
        topPerformingTours: topPerforming,
        underPerformingTours: underPerforming,
        averageMetrics: {
          bookingsPerTour: tours.length > 0 ? totalBookings / tours.length : 0,
          revenuePerTour: tours.length > 0 ? totalRevenue / tours.length : 0,
          averageRating: tours.length > 0 ? totalRating / tours.length : 0,
          completionRate: 85, // Would be calculated from actual booking data
        },
      };
    } catch (error) {
      console.error("AdminTourService.getTourPerformanceMetrics error:", error);
      throw error;
    }
  }

  // ======= Helper Methods =======

  /**
   * Enhance tour data with admin-specific information
   */
  private async enhanceTourWithAdminData(
    tour: TourDTO
  ): Promise<AdminTourView> {
    try {
      // Get guide information
      const guideInfo = await this.getGuideInfo(tour.guideId);

      // Get document status
      const documentStatus = await this.getDocumentStatus(tour.id);

      // Get booking stats
      const bookingStats = await this.getBookingStats(tour.id);

      // Get moderation notes
      const moderationNotes = await this.getTourNotes(tour.id);

      const adminTour: AdminTourView = {
        ...tour,
        guideInfo,
        approvalStatus: this.determineApprovalStatus(tour.status),
        moderationNotes,
        documentStatus,
        bookingStats,
        lastActivity: tour.updatedAt,
        isActive: tour.status === "ACTIVE",
        isFeatured: false, // Would be determined from database
        viewCount: 0, // Would be tracked
        reportCount: 0, // Would be tracked
      };

      return adminTour;
    } catch (error) {
      console.error("AdminTourService.enhanceTourWithAdminData error:", error);
      throw error;
    }
  }

  /**
   * Get guide information
   */
  private async getGuideInfo(guideId: number) {
    try {
      // This would use the user service to get guide details
      return {
        id: guideId,
        name: "Guide Name", // Would be fetched from user service
        email: "guide@example.com",
        phone: "+90 555 123 4567",
        joinDate: "2024-01-01",
        isVerified: true,
        isCertified: true,
        totalTours: 0,
        rating: 4.5,
        responseRate: 95,
      };
    } catch (error) {
      console.error("AdminTourService.getGuideInfo error:", error);
      return {
        id: guideId,
        name: "Unknown Guide",
        email: "",
        phone: "",
        joinDate: "",
        isVerified: false,
        isCertified: false,
        totalTours: 0,
        rating: 0,
        responseRate: 0,
      };
    }
  }

  /**
   * Get document status for a tour
   */
  private async getDocumentStatus(tourId: number) {
    try {
      const documents = await tourService.getTourDocuments(tourId);
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      return {
        total: documents.length,
        verified: documents.filter((d) => d.isVerified).length,
        pending: documents.filter((d) => !d.isVerified).length,
        expired: documents.filter(
          (d) => d.expiryDate && new Date(d.expiryDate) < now
        ).length,
        expiringSoon: documents.filter(
          (d) =>
            d.expiryDate &&
            new Date(d.expiryDate) >= now &&
            new Date(d.expiryDate) <= thirtyDaysFromNow
        ).length,
      };
    } catch (error) {
      console.error("AdminTourService.getDocumentStatus error:", error);
      return {
        total: 0,
        verified: 0,
        pending: 0,
        expired: 0,
        expiringSoon: 0,
      };
    }
  }

  /**
   * Get booking statistics for a tour
   */
  private async getBookingStats(tourId: number) {
    try {
      // This would use booking service to get stats
      return {
        totalBookings: 0,
        thisMonthBookings: 0,
        revenue: 0,
        averageRating: 0,
        completionRate: 0,
      };
    } catch (error) {
      console.error("AdminTourService.getBookingStats error:", error);
      return {
        totalBookings: 0,
        thisMonthBookings: 0,
        revenue: 0,
        averageRating: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Determine approval status from tour status
   */
  private determineApprovalStatus(
    status: string
  ): "pending" | "approved" | "rejected" | "suspended" {
    switch (status) {
      case "ACTIVE":
        return "approved";
      case "INACTIVE":
        return "rejected";
      case "DRAFT":
        return "pending";
      default:
        return "pending";
    }
  }

  /**
   * Apply filters to tours
   */
  private applyFilters(
    tours: AdminTourView[],
    filters: AdminTourFilters
  ): AdminTourView[] {
    return tours.filter((tour) => {
      if (
        filters.status &&
        !filters.status.includes(tour.status as TourStatus)
      ) {
        return false;
      }

      if (
        filters.approvalStatus &&
        !filters.approvalStatus.includes(tour.approvalStatus)
      ) {
        return false;
      }

      if (
        filters.tourType &&
        tour.tourType &&
        !filters.tourType.includes(tour.tourType)
      ) {
        return false;
      }

      if (filters.guideId && tour.guideId !== filters.guideId) {
        return false;
      }

      if (
        filters.location &&
        !tour.location.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }

      if (filters.priceRange) {
        if (
          tour.price < filters.priceRange.min ||
          tour.price > filters.priceRange.max
        ) {
          return false;
        }
      }

      if (
        filters.hasDocumentIssues &&
        tour.documentStatus.expired === 0 &&
        tour.documentStatus.pending === 0
      ) {
        return false;
      }

      if (filters.isReported && tour.reportCount === 0) {
        return false;
      }

      if (
        filters.isFeatured !== undefined &&
        tour.isFeatured !== filters.isFeatured
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Apply search to tours
   */
  private applySearch(tours: AdminTourView[], query: string): AdminTourView[] {
    const searchTerm = query.toLowerCase();
    return tours.filter(
      (tour) =>
        tour.name.toLowerCase().includes(searchTerm) ||
        tour.description.toLowerCase().includes(searchTerm) ||
        tour.location.toLowerCase().includes(searchTerm) ||
        tour.guideInfo.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Apply sorting to tours
   */
  private applySorting(
    tours: AdminTourView[],
    sortBy: string,
    sortOrder: "asc" | "desc"
  ): AdminTourView[] {
    return tours.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "bookings":
          aValue = a.bookingStats.totalBookings;
          bValue = b.bookingStats.totalBookings;
          break;
        case "revenue":
          aValue = a.bookingStats.revenue;
          bValue = b.bookingStats.revenue;
          break;
        case "lastActivity":
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Calculate new tours this month
   */
  private getNewThisMonth(tours: TourDTO[]): number {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return tours.filter((tour) => new Date(tour.createdAt) >= thisMonth).length;
  }

  /**
   * Calculate average rating
   */
  private calculateAverageRating(tours: TourDTO[]): number {
    const toursWithRating = tours.filter(
      (tour) => tour.rating && tour.rating > 0
    );
    if (toursWithRating.length === 0) return 0;

    const totalRating = toursWithRating.reduce(
      (sum, tour) => sum + (tour.rating || 0),
      0
    );
    return Math.round((totalRating / toursWithRating.length) * 10) / 10;
  }

  /**
   * Calculate document statistics across all tours
   */
  private async calculateDocumentStats(tours: TourDTO[]): Promise<{
    total: number;
    verified: number;
    pending: number;
    expired: number;
    expiringSoon: number;
  }> {
    try {
      let total = 0;
      let verified = 0;
      let pending = 0;
      let expired = 0;
      let expiringSoon = 0;

      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      for (const tour of tours) {
        try {
          const documents = await tourService.getTourDocuments(tour.id);
          total += documents.length;

          for (const doc of documents) {
            if (doc.isVerified) {
              verified++;
            } else {
              pending++;
            }

            if (doc.expiryDate) {
              const expiryDate = new Date(doc.expiryDate);
              if (expiryDate < now) {
                expired++;
              } else if (expiryDate <= thirtyDaysFromNow) {
                expiringSoon++;
              }
            }
          }
        } catch (error) {
          console.warn(`Failed to get documents for tour ${tour.id}:`, error);
        }
      }

      return { total, verified, pending, expired, expiringSoon };
    } catch (error) {
      console.error("AdminTourService.calculateDocumentStats error:", error);
      return { total: 0, verified: 0, pending: 0, expired: 0, expiringSoon: 0 };
    }
  }

  /**
   * Calculate booking statistics (placeholder implementation)
   */
  private async calculateBookingStats(tours: TourDTO[]): Promise<{
    totalBookings: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    completionRate: number;
  }> {
    try {
      // This would be implemented with actual booking service integration
      // For now, return placeholder data
      return {
        totalBookings: tours.length * 5, // Simulate 5 bookings per tour on average
        totalRevenue: tours.length * 2500, // Simulate 2500 TL revenue per tour on average
        thisMonthRevenue: tours.length * 500, // Simulate this month's revenue
        completionRate: 85, // 85% completion rate
      };
    } catch (error) {
      console.error("AdminTourService.calculateBookingStats error:", error);
      return {
        totalBookings: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        completionRate: 0,
      };
    }
  }

  /**
   * Generate period keys for statistics
   */
  private generatePeriods(
    period: "daily" | "weekly" | "monthly" | "yearly",
    startDate?: string,
    endDate?: string
  ): string[] {
    const periods = [];
    const now = new Date();

    // Generate last 12 periods by default
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);

      switch (period) {
        case "daily":
          date.setDate(date.getDate() - i);
          periods.push(date.toISOString().split("T")[0]);
          break;
        case "weekly":
          date.setDate(date.getDate() - i * 7);
          periods.push(
            `Week ${date.getFullYear()}-${Math.ceil(date.getDate() / 7)}`
          );
          break;
        case "monthly":
          date.setMonth(date.getMonth() - i);
          periods.push(
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
          );
          break;
        case "yearly":
          date.setFullYear(date.getFullYear() - i);
          periods.push(date.getFullYear().toString());
          break;
      }
    }

    return periods;
  }

  // ======= Additional Analytics and Reporting =======

  /**
   * Get tour statistics by guide
   */
  public async getTourStatsByGuide(): Promise<
    Array<{
      guideId: number;
      guideName: string;
      totalTours: number;
      activeTours: number;
      averageRating: number;
      totalRevenue: number;
      totalBookings: number;
    }>
  > {
    try {
      const tours = await tourService.getTours();
      const guideStats = new Map();

      for (const tour of tours) {
        const enhancedTour = await this.enhanceTourWithAdminData(tour);

        if (!guideStats.has(tour.guideId)) {
          guideStats.set(tour.guideId, {
            guideId: tour.guideId,
            guideName: enhancedTour.guideInfo.name,
            totalTours: 0,
            activeTours: 0,
            totalRating: 0,
            ratedTours: 0,
            totalRevenue: 0,
            totalBookings: 0,
          });
        }

        const stats = guideStats.get(tour.guideId);
        stats.totalTours++;

        if (tour.status === "ACTIVE") {
          stats.activeTours++;
        }

        if (tour.rating && tour.rating > 0) {
          stats.totalRating += tour.rating;
          stats.ratedTours++;
        }

        stats.totalRevenue += enhancedTour.bookingStats.revenue;
        stats.totalBookings += enhancedTour.bookingStats.totalBookings;
      }

      return Array.from(guideStats.values()).map((stats) => ({
        guideId: stats.guideId,
        guideName: stats.guideName,
        totalTours: stats.totalTours,
        activeTours: stats.activeTours,
        averageRating:
          stats.ratedTours > 0 ? stats.totalRating / stats.ratedTours : 0,
        totalRevenue: stats.totalRevenue,
        totalBookings: stats.totalBookings,
      }));
    } catch (error) {
      console.error("AdminTourService.getTourStatsByGuide error:", error);
      throw error;
    }
  }

  /**
   * Get tour statistics by location
   */
  public async getTourStatsByLocation(): Promise<
    Array<{
      location: string;
      totalTours: number;
      activeTours: number;
      averageRating: number;
      totalRevenue: number;
      totalBookings: number;
    }>
  > {
    try {
      const tours = await tourService.getTours();
      const locationStats = new Map();

      for (const tour of tours) {
        const enhancedTour = await this.enhanceTourWithAdminData(tour);

        if (!locationStats.has(tour.location)) {
          locationStats.set(tour.location, {
            location: tour.location,
            totalTours: 0,
            activeTours: 0,
            totalRating: 0,
            ratedTours: 0,
            totalRevenue: 0,
            totalBookings: 0,
          });
        }

        const stats = locationStats.get(tour.location);
        stats.totalTours++;

        if (tour.status === "ACTIVE") {
          stats.activeTours++;
        }

        if (tour.rating && tour.rating > 0) {
          stats.totalRating += tour.rating;
          stats.ratedTours++;
        }

        stats.totalRevenue += enhancedTour.bookingStats.revenue;
        stats.totalBookings += enhancedTour.bookingStats.totalBookings;
      }

      return Array.from(locationStats.values()).map((stats) => ({
        location: stats.location,
        totalTours: stats.totalTours,
        activeTours: stats.activeTours,
        averageRating:
          stats.ratedTours > 0 ? stats.totalRating / stats.ratedTours : 0,
        totalRevenue: stats.totalRevenue,
        totalBookings: stats.totalBookings,
      }));
    } catch (error) {
      console.error("AdminTourService.getTourStatsByLocation error:", error);
      throw error;
    }
  }


  /**
   * Get current admin information (placeholder implementation)
   */
  private getCurrentAdminInfo(): { id: number; name: string } {
    // This would be implemented with proper auth context
    // For now, return placeholder data
    return {
      id: 1,
      name: "Admin User",
    };
  }
}

export const adminTourService = new AdminTourService();
