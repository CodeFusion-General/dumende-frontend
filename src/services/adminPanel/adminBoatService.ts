import { BaseService } from "../base/BaseService";
import { boatService } from "../boatService";
import { userService } from "../userService";
import { documentService } from "../documentService";
import {
  AdminBoatView,
  AdminBoatFilters,
  AdminBoatAction,
  BulkBoatAction,
  BoatApprovalCommand,
  BoatStatistics,
  AdminBoatSearchResult,
  BoatDocumentManagement,
  AdminBoatNote,
  BoatApprovalHistory,
  BoatOwnerInfo,
  BoatPerformanceMetrics,
  AdminBoatUpdateCommand,
} from "@/types/adminBoat";
import { BoatDTO } from "@/types/boat.types";
import { BoatDocumentDTO } from "@/types/document.types";

class AdminBoatService extends BaseService {
  constructor() {
    super("/admin/boats"); // axios baseURL zaten /api
  }

  // Get boats with admin-specific information
  public async getAdminBoats(
    filters?: AdminBoatFilters,
    page = 0,
    size = 20,
    sort = "createdAt,desc"
  ): Promise<AdminBoatSearchResult> {
    try {
      // Get boats from existing service
      const boats = await boatService.getBoats();

      // Transform to admin view with additional information
      const adminBoats = await Promise.all(
        boats.map(async (boat) => this.transformToAdminView(boat))
      );

      // Apply filters
      let filteredBoats = this.applyFilters(adminBoats, filters);

      // Apply sorting
      filteredBoats = this.applySorting(filteredBoats, sort);

      // Apply pagination
      const totalCount = filteredBoats.length;
      const totalPages = Math.ceil(totalCount / size);
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedBoats = filteredBoats.slice(startIndex, endIndex);

      return {
        boats: paginatedBoats,
        totalCount,
        page,
        size,
        totalPages,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Get single boat with admin view
  public async getAdminBoatById(id: number): Promise<AdminBoatView> {
    try {
      const boat = await boatService.getBoatById(id);
      return await this.transformToAdminView(boat);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Approve or reject boat
  public async approveRejectBoat(
    command: BoatApprovalCommand
  ): Promise<AdminBoatView> {
    try {
      // Update boat status
      const status = command.approved ? "approved" : "rejected";
      await boatService.updateBoatStatus(command.boatId, status);

      // If rejected, save rejection reason
      if (!command.approved && command.reason) {
        await this.saveBoatNote(command.boatId, {
          note: `Reddedilme sebebi: ${command.reason}`,
          type: "rejection",
        });
      }

      // Process document verifications if provided
      if (command.documentVerifications) {
        await Promise.all(
          command.documentVerifications.map(async (verification) => {
            await documentService.updateDocumentVerificationStatus(
              verification.documentId,
              verification.verified,
              verification.notes
            );
          })
        );
      }

      // Save approval history
      await this.saveApprovalHistory({
        boatId: command.boatId,
        action: command.approved ? "approved" : "rejected",
        reason: command.reason,
        adminId: 1, // TODO: Get from auth context
        adminName: "Admin", // TODO: Get from auth context
        timestamp: new Date().toISOString(),
      });

      // Return updated boat
      return await this.getAdminBoatById(command.boatId);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Bulk approve/reject boats
  public async bulkApproveRejectBoats(action: BulkBoatAction): Promise<void> {
    try {
      await Promise.all(
        action.boatIds.map(async (boatId) => {
          const command: BoatApprovalCommand = {
            boatId,
            approved: action.action === "approve",
            reason: action.reason,
            adminNote: action.adminNote,
          };
          await this.approveRejectBoat(command);
        })
      );
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Get boat statistics
  public async getBoatStatistics(): Promise<BoatStatistics> {
    try {
      const boats = await boatService.getBoats();
      const documents = await documentService.getAllDocuments();

      // Calculate statistics
      const totalBoats = boats.length;
      const activeBoats = boats.filter((b) => b.status === "active").length;
      const pendingBoats = boats.filter((b) => b.status === "pending").length;
      const rejectedBoats = boats.filter((b) => b.status === "rejected").length;
      const suspendedBoats = boats.filter(
        (b) => b.status === "suspended"
      ).length;

      // New boats this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newBoatsThisMonth = boats.filter(
        (b) => new Date(b.createdAt) >= thisMonth
      ).length;

      // Boats by type
      const boatsByType: { [type: string]: number } = {};
      boats.forEach((boat) => {
        boatsByType[boat.type] = (boatsByType[boat.type] || 0) + 1;
      });

      // Boats by location
      const boatsByLocation: { [location: string]: number } = {};
      boats.forEach((boat) => {
        boatsByLocation[boat.location] =
          (boatsByLocation[boat.location] || 0) + 1;
      });

      // Document statistics
      const boatDocuments = documents.filter((d) => d.entityType === "boat");
      const totalDocuments = boatDocuments.length;
      const verifiedDocuments = boatDocuments.filter(
        (d) => d.verificationStatus === "verified"
      ).length;
      const pendingDocuments = boatDocuments.filter(
        (d) => d.verificationStatus === "pending"
      ).length;
      const expiredDocuments = boatDocuments.filter(
        (d) => d.expiryDate && new Date(d.expiryDate) < new Date()
      ).length;

      // Expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoonDocuments = boatDocuments.filter(
        (d) =>
          d.expiryDate &&
          new Date(d.expiryDate) > new Date() &&
          new Date(d.expiryDate) <= thirtyDaysFromNow
      ).length;

      return {
        totalBoats,
        activeBoats,
        pendingBoats,
        rejectedBoats,
        suspendedBoats,
        newBoatsThisMonth,
        boatsByType,
        boatsByLocation,
        documentStats: {
          totalDocuments,
          verifiedDocuments,
          pendingDocuments,
          expiredDocuments,
          expiringSoonDocuments,
        },
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Get boat document management info
  public async getBoatDocumentManagement(
    boatId: number
  ): Promise<BoatDocumentManagement> {
    try {
      const documents = await boatService.getBoatDocuments(boatId);

      const verified = documents.filter(
        (d) => d.verificationStatus === "verified"
      );
      const pending = documents.filter(
        (d) => d.verificationStatus === "pending"
      );
      const expired = documents.filter(
        (d) => d.expiryDate && new Date(d.expiryDate) < new Date()
      );

      // Expiring soon (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoon = documents.filter(
        (d) =>
          d.expiryDate &&
          new Date(d.expiryDate) > new Date() &&
          new Date(d.expiryDate) <= thirtyDaysFromNow
      );

      let verificationStatus:
        | "all_verified"
        | "pending"
        | "expired"
        | "missing";
      if (expired.length > 0) {
        verificationStatus = "expired";
      } else if (pending.length > 0) {
        verificationStatus = "pending";
      } else if (verified.length === 0) {
        verificationStatus = "missing";
      } else {
        verificationStatus = "all_verified";
      }

      return {
        boatId,
        documents,
        verificationStatus,
        expiringSoon,
        expired,
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Get boat owner information
  public async getBoatOwnerInfo(ownerId: number): Promise<BoatOwnerInfo> {
    try {
      const user = await userService.getUserById(ownerId);
      const ownerBoats = await boatService.getBoatsByOwner(ownerId);

      const totalBoats = ownerBoats.length;
      const activeBoats = ownerBoats.filter(
        (b) => b.status === "active"
      ).length;

      // TODO: Get actual booking and revenue data from booking service
      const totalRevenue = 0;
      const averageRating =
        ownerBoats.reduce((sum, boat) => sum + (boat.rating || 0), 0) /
          totalBoats || 0;

      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        joinDate: user.createdAt,
        totalBoats,
        activeBoats,
        totalRevenue,
        averageRating,
        verificationStatus: "verified", // TODO: Get from user verification status
        riskScore: 0, // TODO: Calculate risk score
      };
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Update boat (admin-specific)
  public async updateBoat(
    command: AdminBoatUpdateCommand
  ): Promise<AdminBoatView> {
    try {
      const updateData = {
        id: command.id,
        name: command.name,
        description: command.description,
        capacity: command.capacity,
        dailyPrice: command.dailyPrice,
        hourlyPrice: command.hourlyPrice,
        location: command.location,
        type: command.type,
        status: command.status,
      };

      await boatService.updateBoat(updateData);

      // Save admin note if provided
      if (command.adminNote) {
        await this.saveBoatNote(command.id, {
          note: command.adminNote,
          type: "info",
        });
      }

      return await this.getAdminBoatById(command.id);
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Private helper methods
  private async transformToAdminView(boat: BoatDTO): Promise<AdminBoatView> {
    try {
      // Get owner information
      const owner = await userService.getUserById(boat.ownerId);

      // Get document status
      const documents = boat.documents || [];
      const documentStatus = {
        total: documents.length,
        verified: documents.filter((d) => d.verificationStatus === "verified")
          .length,
        pending: documents.filter((d) => d.verificationStatus === "pending")
          .length,
        expired: documents.filter(
          (d) => d.expiryDate && new Date(d.expiryDate) < new Date()
        ).length,
      };

      // TODO: Get actual booking stats from booking service
      const bookingStats = {
        totalBookings: 0,
        thisMonthBookings: 0,
        revenue: 0,
        averageRating: boat.rating || 0,
      };

      return {
        ...boat,
        ownerInfo: {
          id: owner.id,
          name: owner.fullName,
          email: owner.email || "",
          phone: owner.phoneNumber || "",
          joinDate: owner.createdAt,
        },
        approvalStatus: this.mapStatusToApprovalStatus(boat.status),
        approvalDate: boat.updatedAt,
        approvedBy: undefined, // TODO: Get from approval history
        rejectionReason: undefined, // TODO: Get from notes
        documentStatus,
        bookingStats,
        lastActivity: boat.updatedAt,
      };
    } catch (error) {
      console.error("Error transforming boat to admin view:", error);
      // Return basic admin view if transformation fails
      return {
        ...boat,
        ownerInfo: {
          id: boat.ownerId,
          name: "Unknown",
          email: "",
          phone: "",
          joinDate: "",
        },
        approvalStatus: this.mapStatusToApprovalStatus(boat.status),
        documentStatus: { total: 0, verified: 0, pending: 0, expired: 0 },
        bookingStats: {
          totalBookings: 0,
          thisMonthBookings: 0,
          revenue: 0,
          averageRating: 0,
        },
        lastActivity: boat.updatedAt,
      };
    }
  }

  private mapStatusToApprovalStatus(
    status: string
  ): "pending" | "approved" | "rejected" {
    switch (status) {
      case "active":
        return "approved";
      case "rejected":
        return "rejected";
      default:
        return "pending";
    }
  }

  private applyFilters(
    boats: AdminBoatView[],
    filters?: AdminBoatFilters
  ): AdminBoatView[] {
    if (!filters) return boats;

    return boats.filter((boat) => {
      // Approval status filter
      if (
        filters.approvalStatus &&
        boat.approvalStatus !== filters.approvalStatus
      ) {
        return false;
      }

      // Owner filter
      if (filters.ownerId && boat.ownerId !== filters.ownerId) {
        return false;
      }

      if (
        filters.ownerName &&
        !boat.ownerInfo.name
          .toLowerCase()
          .includes(filters.ownerName.toLowerCase())
      ) {
        return false;
      }

      // Location filter
      if (
        filters.locations &&
        filters.locations.length > 0 &&
        !filters.locations.includes(boat.location)
      ) {
        return false;
      }

      // Type filter
      if (
        filters.types &&
        filters.types.length > 0 &&
        !filters.types.includes(boat.type)
      ) {
        return false;
      }

      // Capacity filter
      if (filters.capacity && boat.capacity < filters.capacity) {
        return false;
      }

      // Price filters
      if (filters.minPrice && boat.dailyPrice < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice && boat.dailyPrice > filters.maxPrice) {
        return false;
      }

      // Document status filter
      if (filters.documentStatus) {
        const hasVerified = boat.documentStatus.verified > 0;
        const hasPending = boat.documentStatus.pending > 0;
        const hasExpired = boat.documentStatus.expired > 0;

        switch (filters.documentStatus) {
          case "verified":
            if (!hasVerified || hasPending || hasExpired) return false;
            break;
          case "pending":
            if (!hasPending) return false;
            break;
          case "expired":
            if (!hasExpired) return false;
            break;
        }
      }

      // Expired documents filter
      if (filters.hasExpiredDocuments !== undefined) {
        const hasExpired = boat.documentStatus.expired > 0;
        if (filters.hasExpiredDocuments !== hasExpired) {
          return false;
        }
      }

      // Revenue filters
      if (
        filters.revenueMin &&
        boat.bookingStats.revenue < filters.revenueMin
      ) {
        return false;
      }

      if (
        filters.revenueMax &&
        boat.bookingStats.revenue > filters.revenueMax
      ) {
        return false;
      }

      // Booking filters
      if (
        filters.bookingsMin &&
        boat.bookingStats.totalBookings < filters.bookingsMin
      ) {
        return false;
      }

      if (
        filters.bookingsMax &&
        boat.bookingStats.totalBookings > filters.bookingsMax
      ) {
        return false;
      }

      // Rating filters
      if (
        filters.ratingMin &&
        boat.bookingStats.averageRating < filters.ratingMin
      ) {
        return false;
      }

      if (
        filters.ratingMax &&
        boat.bookingStats.averageRating > filters.ratingMax
      ) {
        return false;
      }

      return true;
    });
  }

  private applySorting(boats: AdminBoatView[], sort: string): AdminBoatView[] {
    const [field, direction] = sort.split(",");
    const isAsc = direction === "asc";

    return boats.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (field) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "ownerName":
          aValue = a.ownerInfo.name;
          bValue = b.ownerInfo.name;
          break;
        case "location":
          aValue = a.location;
          bValue = b.location;
          break;
        case "type":
          aValue = a.type;
          bValue = b.type;
          break;
        case "capacity":
          aValue = a.capacity;
          bValue = b.capacity;
          break;
        case "dailyPrice":
          aValue = a.dailyPrice;
          bValue = b.dailyPrice;
          break;
        case "rating":
          aValue = a.bookingStats.averageRating;
          bValue = b.bookingStats.averageRating;
          break;
        case "totalBookings":
          aValue = a.bookingStats.totalBookings;
          bValue = b.bookingStats.totalBookings;
          break;
        case "revenue":
          aValue = a.bookingStats.revenue;
          bValue = b.bookingStats.revenue;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case "lastActivity":
          aValue = new Date(a.lastActivity);
          bValue = new Date(b.lastActivity);
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }

      if (aValue < bValue) return isAsc ? -1 : 1;
      if (aValue > bValue) return isAsc ? 1 : -1;
      return 0;
    });
  }

  private async saveBoatNote(
    boatId: number,
    note: { note: string; type: string }
  ): Promise<void> {
    // TODO: Implement boat notes storage
    console.log(`Saving boat note for boat ${boatId}:`, note);
  }

  private async saveApprovalHistory(
    history: Omit<BoatApprovalHistory, "id">
  ): Promise<void> {
    // TODO: Implement approval history storage
    console.log("Saving approval history:", history);
  }
}

export const adminBoatService = new AdminBoatService();
