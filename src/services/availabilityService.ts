import { BaseService } from "./base/BaseService";
import {
  CalendarAvailability,
  AvailabilityData,
} from "@/types/availability.types";

// Date format conversion utilities for API compatibility
export const dateUtils = {
  // Convert ISO date (yyyy-MM-dd) to API format (dd-MM-yyyy)
  formatDateForAPI: (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  },

  // Convert API date format (dd-MM-yyyy) to ISO format (yyyy-MM-dd)
  formatDateFromAPI: (apiDate: string): string => {
    const [day, month, year] = apiDate.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  },

  // Check if date string is in API format (dd-MM-yyyy)
  isAPIFormat: (dateStr: string): boolean => {
    return /^\d{2}-\d{2}-\d{4}$/.test(dateStr);
  },

  // Check if date string is in ISO format (yyyy-MM-dd)
  isISOFormat: (dateStr: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
  },
};

class AvailabilityService extends BaseService {
  constructor() {
    super("/availabilities");
  }

  // Get calendar availability data including booking conflicts
  public async getCalendarAvailability(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    try {
      // Convert dates to API format if they are in ISO format
      const apiStartDate = dateUtils.isISOFormat(startDate)
        ? dateUtils.formatDateForAPI(startDate)
        : startDate;
      const apiEndDate = dateUtils.isISOFormat(endDate)
        ? dateUtils.formatDateForAPI(endDate)
        : endDate;

      const response = await this.get<CalendarAvailability[]>(
        `/boat/${boatId}/calendar-availability`,
        {
          startDate: apiStartDate,
          endDate: apiEndDate,
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch calendar availability:", error);
      throw error;
    }
  }

  // Check if boat is available on a specific date (including booking conflicts)
  public async isBoatAvailableOnDateWithBookings(
    boatId: number,
    date: string
  ): Promise<boolean> {
    try {
      // Convert date to API format if it's in ISO format
      const apiDate = dateUtils.isISOFormat(date)
        ? dateUtils.formatDateForAPI(date)
        : date;

      const response = await this.get<boolean>(
        `/boat/${boatId}/available-with-bookings`,
        {
          date: apiDate,
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to check availability with bookings:", error);
      throw error;
    }
  }

  // Legacy method - check availability without booking conflicts
  public async isBoatAvailableOnDate(
    boatId: number,
    date: string
  ): Promise<boolean> {
    try {
      // Convert date to API format if it's in ISO format
      const apiDate = dateUtils.isISOFormat(date)
        ? dateUtils.formatDateForAPI(date)
        : date;

      const response = await this.get<boolean>(`/boat/${boatId}/available`, {
        date: apiDate,
      });
      return response;
    } catch (error) {
      console.error("Failed to check availability:", error);
      throw error;
    }
  }

  // Get availability data for a specific date
  public async getAvailabilityByBoatIdAndDate(
    boatId: number,
    date: string
  ): Promise<AvailabilityData> {
    try {
      // Convert date to API format if it's in ISO format
      const apiDate = dateUtils.isISOFormat(date)
        ? dateUtils.formatDateForAPI(date)
        : date;

      const response = await this.get<AvailabilityData>(
        `/boat/${boatId}/date`,
        {
          date: apiDate,
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch availability for date:", error);
      throw error;
    }
  }

  // Get availability data for a date range
  public async getAvailabilitiesByBoatIdAndDateRange(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityData[]> {
    try {
      // Convert dates to API format if they are in ISO format
      const apiStartDate = dateUtils.isISOFormat(startDate)
        ? dateUtils.formatDateForAPI(startDate)
        : startDate;
      const apiEndDate = dateUtils.isISOFormat(endDate)
        ? dateUtils.formatDateForAPI(endDate)
        : endDate;

      const response = await this.get<AvailabilityData[]>(
        `/boat/${boatId}/range`,
        {
          startDate: apiStartDate,
          endDate: apiEndDate,
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to fetch availability range:", error);
      throw error;
    }
  }

  // Check if boat is available between dates
  public async isBoatAvailableBetweenDates(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      // Convert dates to API format if they are in ISO format
      const apiStartDate = dateUtils.isISOFormat(startDate)
        ? dateUtils.formatDateForAPI(startDate)
        : startDate;
      const apiEndDate = dateUtils.isISOFormat(endDate)
        ? dateUtils.formatDateForAPI(endDate)
        : endDate;

      const response = await this.get<boolean>(
        `/boat/${boatId}/available-range`,
        {
          startDate: apiStartDate,
          endDate: apiEndDate,
        }
      );
      return response;
    } catch (error) {
      console.error("Failed to check availability range:", error);
      throw error;
    }
  }

  // Get availability by ID
  public async getAvailabilityById(id: number): Promise<AvailabilityData> {
    return this.get<AvailabilityData>(`/${id}`);
  }

  // Get all availabilities for a boat
  public async getAvailabilitiesByBoatId(
    boatId: number
  ): Promise<AvailabilityData[]> {
    return this.get<AvailabilityData[]>(`/boat/${boatId}`);
  }

  // Check if availability exists
  public async existsAvailabilityById(id: number): Promise<boolean> {
    return this.get<boolean>(`/exists/${id}`);
  }

  // Create availability - Enhanced with date format handling
  public async createAvailability(data: any): Promise<any> {
    try {
      // Convert date to API format if it's in ISO format
      const createData = {
        ...data,
        date: dateUtils.isISOFormat(data.date)
          ? dateUtils.formatDateForAPI(data.date)
          : data.date,
      };

      return await this.post<any>("", createData);
    } catch (error) {
      console.error("Failed to create availability:", error);
      throw error;
    }
  }

  // Update availability - Fixed to use PUT with proper data structure
  public async updateAvailability(data: any): Promise<any> {
    try {
      // Ensure the data has the correct structure for PUT request
      const updateData = {
        id: data.id,
        boatId: data.boatId,
        date: data.date,
        isAvailable: data.isAvailable,
        priceOverride: data.priceOverride,
      };

      return await this.put<any>("", updateData);
    } catch (error) {
      console.error("Failed to update availability:", error);
      throw error;
    }
  }

  // Delete availability - Fixed to use correct endpoint (not boat-specific)
  public async deleteAvailability(id: number): Promise<void> {
    try {
      return await this.delete<void>(`/${id}`);
    } catch (error) {
      console.error("Failed to delete availability:", error);
      throw error;
    }
  }

  // Set availability status - Fixed to use correct PATCH endpoint and request body format
  public async setAvailabilityStatus(
    id: number,
    isAvailable: boolean
  ): Promise<void> {
    try {
      return await this.patch<void>(`/${id}/status`, { isAvailable });
    } catch (error) {
      console.error("Failed to set availability status:", error);
      throw error;
    }
  }

  // Create availability period - Fixed to use correct API format with date conversion
  public async createAvailabilityPeriod(command: any): Promise<void> {
    try {
      // Convert dates to API format if they are in ISO format
      const apiCommand = {
        boatId: command.boatId,
        startDate: dateUtils.isISOFormat(command.startDate)
          ? dateUtils.formatDateForAPI(command.startDate)
          : command.startDate,
        endDate: dateUtils.isISOFormat(command.endDate)
          ? dateUtils.formatDateForAPI(command.endDate)
          : command.endDate,
        isAvailable: command.isAvailable,
      };

      return await this.post<void>("/period", apiCommand);
    } catch (error) {
      console.error("Failed to create availability period:", error);
      throw error;
    }
  }
}

export const availabilityService = new AvailabilityService();

// Availability Query Service - BaseService kullanarak
export const availabilityQueryService = {
  // Get availability by ID
  findAvailabilityById: async (id: number): Promise<AvailabilityData> => {
    return availabilityService.getAvailabilityById(id);
  },

  // Get all availabilities for a boat
  findAvailabilitiesByBoatId: async (
    boatId: number
  ): Promise<AvailabilityData[]> => {
    return availabilityService.getAvailabilitiesByBoatId(boatId);
  },

  // Get availabilities by boat ID and date range
  findAvailabilitiesByBoatIdAndDateRange: async (
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityData[]> => {
    return availabilityService.getAvailabilitiesByBoatIdAndDateRange(
      boatId,
      startDate,
      endDate
    );
  },

  // Get availability by boat ID and date
  findAvailabilityByBoatIdAndDate: async (
    boatId: number,
    date: string
  ): Promise<AvailabilityData> => {
    return availabilityService.getAvailabilityByBoatIdAndDate(boatId, date);
  },

  // Check if boat is available on date
  isBoatAvailableOnDate: async (
    boatId: number,
    date: string
  ): Promise<boolean> => {
    return availabilityService.isBoatAvailableOnDate(boatId, date);
  },

  // Check if boat is available between dates
  isBoatAvailableBetweenDates: async (
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    return availabilityService.isBoatAvailableBetweenDates(
      boatId,
      startDate,
      endDate
    );
  },

  // Check if availability exists
  existsAvailabilityById: async (id: number): Promise<boolean> => {
    return availabilityService.existsAvailabilityById(id);
  },

  // Check availability with booking conflicts
  isBoatAvailableOnDateWithBookings: async (
    boatId: number,
    date: string
  ): Promise<boolean> => {
    return availabilityService.isBoatAvailableOnDateWithBookings(boatId, date);
  },

  // Get calendar availability with booking conflicts
  getCalendarAvailability: async (
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> => {
    return availabilityService.getCalendarAvailability(
      boatId,
      startDate,
      endDate
    );
  },
};

export default {
  query: availabilityQueryService,
};
