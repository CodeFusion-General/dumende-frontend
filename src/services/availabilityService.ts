import { BaseService } from "./base/BaseService";
import {
  CalendarAvailability,
  AvailabilityData,
} from "@/types/availability.types";
import { tokenUtils } from "@/lib/utils";

// Date format conversion utilities for API compatibility
export const dateUtils = {
  // Convert ISO date (yyyy-MM-dd) to API format (yyyy-MM-dd - backend expects ISO format)
  formatDateForAPI: (isoDate: string): string => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  },

  // Convert API date format (yyyy-MM-dd) to ISO format (yyyy-MM-dd) - already ISO format
  formatDateFromAPI: (apiDate: string): string => {
    // Backend now returns ISO format, so no conversion needed
    return apiDate;
  },

  // Check if date string is in API format (yyyy-MM-dd)
  isAPIFormat: (dateStr: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
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

  // ======= TOUR VARIANT ENDPOINTS =======
  // List by tourId
  public async getAvailabilitiesByTourId(tourId: number): Promise<AvailabilityData[]> {
    return this.get<AvailabilityData[]>(`/tour/${tourId}`);
  }
  public async getTourCalendarAvailability(
    tourId: number,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    const apiStartDate = dateUtils.isISOFormat(startDate)
      ? dateUtils.formatDateForAPI(startDate)
      : startDate;
    const apiEndDate = dateUtils.isISOFormat(endDate)
      ? dateUtils.formatDateForAPI(endDate)
      : endDate;

    return this.get<CalendarAvailability[]>(`/tour/${tourId}/calendar-availability`, {
      startDate: apiStartDate,
      endDate: apiEndDate,
    });
  }

  // Create availability period for Tour
  public async createTourAvailabilityPeriod(command: {
    tourId: number;
    startDate: string;
    endDate: string;
    isAvailable: boolean;
    priceOverride?: number;
    isInstantConfirmation?: boolean;
  }): Promise<void> {
    // Backend'de tur için /tour/period endpoint'i yok. Bunun yerine
    // POST /api/availabilities/batch ile gün bazlı liste gönderilmeli.

    // Tarihleri gün gün üret
    const start = new Date(command.startDate + "T00:00:00");
    const end = new Date(command.endDate + "T00:00:00");
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Geçersiz tarih aralığı");
    }
    if (end < start) {
      throw new Error("Bitiş tarihi başlangıç tarihinden önce olamaz");
    }

    const payload: Array<{
      tourId: number;
      date: string;
      isAvailable: boolean;
      priceOverride?: number;
      isInstantConfirmation?: boolean;
    }> = [];

    const current = new Date(start);
    while (current.getTime() <= end.getTime()) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      const isoDate = `${yyyy}-${mm}-${dd}`;
      payload.push({
        tourId: command.tourId,
        date: isoDate,
        isAvailable: command.isAvailable,
        priceOverride: command.priceOverride,
        isInstantConfirmation: command.isInstantConfirmation,
      });
      current.setDate(current.getDate() + 1);
    }

    // Backend /api/availabilities/batch uç noktası 100 öğe ile sınırlı
    if (payload.length > 100) {
      throw new Error("Azami dönem uzunluğu 100 gün ile sınırlıdır. Lütfen daha kısa bir aralık seçiniz.");
    }

    // Tur için backend batch akışı boatId'ye göre kurgulandığından,
    // tur özelinde güvenli yol: tekil oluşturma endpoint'ini ardışık çağırmak
    for (const item of payload) {
      await this.createAvailability({
        tourId: item.tourId,
        date: item.date,
        isAvailable: item.isAvailable,
        priceOverride: item.priceOverride,
        isInstantConfirmation: item.isInstantConfirmation,
      });
    }
  }

  // Update availability period for Tour
  public async updateTourAvailabilityPeriod(command: {
    tourId: number;
    startDate: string;
    endDate: string;
    isAvailable?: boolean;
    priceOverride?: number;
  }): Promise<void> {
    const apiStartDate = dateUtils.isISOFormat(command.startDate)
      ? command.startDate
      : dateUtils.formatDateFromAPI(command.startDate);
    const apiEndDate = dateUtils.isISOFormat(command.endDate)
      ? command.endDate
      : dateUtils.formatDateFromAPI(command.endDate);

    const params: { [key: string]: any } = {
      tourId: command.tourId,
      startDate: apiStartDate,
      endDate: apiEndDate,
    };
    if (command.isAvailable !== undefined) params.isAvailable = command.isAvailable;
    if (command.priceOverride !== undefined) params.priceOverride = command.priceOverride;

    const token = tokenUtils.getAuthToken();
    await this.api.put(`${this.baseUrl}/tour/period`, null, {
      params,
      headers: { Authorization: `Bearer ${token || ''}`, 'Content-Type': 'application/json' },
    });
  }

  public async isTourAvailableOnDateWithBookings(
    tourId: number,
    date: string
  ): Promise<boolean> {
    const apiDate = dateUtils.isISOFormat(date)
      ? dateUtils.formatDateForAPI(date)
      : date;
    return this.get<boolean>(`/tour/${tourId}/available-with-bookings`, { date: apiDate });
  }

  public async isTourAvailableOnDate(tourId: number, date: string): Promise<boolean> {
    const apiDate = dateUtils.isISOFormat(date)
      ? dateUtils.formatDateForAPI(date)
      : date;
    return this.get<boolean>(`/tour/${tourId}/available`, { date: apiDate });
  }

  public async getAvailabilityByTourIdAndDate(
    tourId: number,
    date: string
  ): Promise<AvailabilityData> {
    const apiDate = dateUtils.isISOFormat(date)
      ? dateUtils.formatDateForAPI(date)
      : date;
    return this.get<AvailabilityData>(`/tour/${tourId}/date`, { date: apiDate });
  }

  public async getAvailabilitiesByTourIdAndDateRange(
    tourId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityData[]> {
    const apiStartDate = dateUtils.isISOFormat(startDate)
      ? dateUtils.formatDateForAPI(startDate)
      : startDate;
    const apiEndDate = dateUtils.isISOFormat(endDate)
      ? dateUtils.formatDateForAPI(endDate)
      : endDate;
    return this.get<AvailabilityData[]>(`/tour/${tourId}/range`, {
      startDate: apiStartDate,
      endDate: apiEndDate,
    });
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
        // Make sure instant confirmation flag is forwarded when provided
        isInstantConfirmation: data.isInstantConfirmation,
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
        isInstantConfirmation: data.isInstantConfirmation,
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

  // Set availability status - Use URL parameters as expected by backend
  public async setAvailabilityStatus(
    id: number,
    isAvailable: boolean
  ): Promise<void> {
    try {
      // Use PATCH request with URL parameters as expected by backend @RequestParam
      const token = tokenUtils.getAuthToken();
      const response = await this.api.patch(`${this.baseUrl}/${id}/status`, null, {
        params: { isAvailable },
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to set availability status:", error);
      throw error;
    }
  }

  // Set availability price override - Use URL parameters as expected by backend
  public async setAvailabilityPriceOverride(
    id: number,
    priceOverride: number
  ): Promise<void> {
    try {
      const token = tokenUtils.getAuthToken();
      const response = await this.api.patch(`${this.baseUrl}/${id}/price-override`, null, {
        params: { priceOverride },
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to set availability price override:", error);
      throw error;
    }
  }

  // Set instant confirmation status - Use URL parameters as expected by backend
  public async setInstantConfirmationStatus(
    id: number,
    isInstantConfirmation: boolean
  ): Promise<void> {
    try {
      const token = tokenUtils.getAuthToken();
      const response = await this.api.patch(`${this.baseUrl}/${id}/instant-confirmation`, null, {
        params: { isInstantConfirmation },
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to set instant confirmation status:", error);
      throw error;
    }
  }

  // Create availability period - Use URL parameters as expected by backend
  public async createAvailabilityPeriod(command: any): Promise<void> {
    try {
      // Convert dates to API format if they are in ISO format
      const apiStartDate = dateUtils.isISOFormat(command.startDate)
        ? dateUtils.formatDateForAPI(command.startDate)
        : command.startDate;
      const apiEndDate = dateUtils.isISOFormat(command.endDate)
        ? dateUtils.formatDateForAPI(command.endDate)
        : command.endDate;

      // Prepare URL parameters as expected by backend @RequestParam
      const params: { [key: string]: any } = {
        boatId: command.boatId,
        startDate: apiStartDate,
        endDate: apiEndDate,
        isAvailable: command.isAvailable,
      };

      // Add priceOverride if provided
      if (command.priceOverride !== undefined && command.priceOverride !== null) {
        params.priceOverride = command.priceOverride;
      }

      // Add isInstantConfirmation if provided
      if (command.isInstantConfirmation !== undefined && command.isInstantConfirmation !== null) {
        params.isInstantConfirmation = command.isInstantConfirmation;
      }

      // Use POST request with URL parameters using the inherited post method with params
      const token = tokenUtils.getAuthToken();
      const response = await this.api.post(`${this.baseUrl}/period`, null, {
        params: params,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to create availability period:", error);
      throw error;
    }
  }

  // Update availability period - Use URL parameters as expected by backend
  public async updateAvailabilityPeriod(command: any): Promise<void> {
    try {
      // Convert dates to ISO format (yyyy-MM-dd) as backend expects @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
      const apiStartDate = dateUtils.isISOFormat(command.startDate)
        ? command.startDate  // Already ISO format
        : dateUtils.formatDateFromAPI(command.startDate);  // Convert dd-MM-yyyy to yyyy-MM-dd
      const apiEndDate = dateUtils.isISOFormat(command.endDate)
        ? command.endDate  // Already ISO format
        : dateUtils.formatDateFromAPI(command.endDate);  // Convert dd-MM-yyyy to yyyy-MM-dd

      // Prepare URL parameters as expected by backend @RequestParam
      const params: { [key: string]: any } = {
        boatId: command.boatId,
        startDate: apiStartDate,
        endDate: apiEndDate,
      };

      // Add optional parameters if provided
      if (command.isAvailable !== undefined && command.isAvailable !== null) {
        params.isAvailable = command.isAvailable;
      }
      if (command.priceOverride !== undefined && command.priceOverride !== null) {
        params.priceOverride = command.priceOverride;
      }

      // Use PUT request with URL parameters
      const token = tokenUtils.getAuthToken();
      const response = await this.api.put(`${this.baseUrl}/period`, null, {
        params: params,
        headers: {
          'Authorization': `Bearer ${token || ''}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Failed to update availability period:", error);
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
