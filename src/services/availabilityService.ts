import { BaseService } from "./base/BaseService";
import { CalendarAvailability, AvailabilityData } from '@/types/availability.types';

class AvailabilityService extends BaseService {
  constructor() {
    super("/availabilities");
  }

  // Get calendar availability data including booking conflicts
  public async getCalendarAvailability(boatId: number, startDate: string, endDate: string): Promise<CalendarAvailability[]> {
    try {
      const response = await this.get<CalendarAvailability[]>(`/boat/${boatId}/calendar-availability`, {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch calendar availability:', error);
      throw error;
    }
  }

  // Check if boat is available on a specific date (including booking conflicts)
  public async isBoatAvailableOnDateWithBookings(boatId: number, date: string): Promise<boolean> {
    try {
      const response = await this.get<boolean>(`/boat/${boatId}/available-with-bookings`, {
        date
      });
      return response;
    } catch (error) {
      console.error('Failed to check availability with bookings:', error);
      throw error;
    }
  }

  // Legacy method - check availability without booking conflicts
  public async isBoatAvailableOnDate(boatId: number, date: string): Promise<boolean> {
    try {
      const response = await this.get<boolean>(`/boat/${boatId}/available`, {
        date
      });
      return response;
    } catch (error) {
      console.error('Failed to check availability:', error);
      throw error;
    }
  }

  // Get availability data for a specific date
  public async getAvailabilityByBoatIdAndDate(boatId: number, date: string): Promise<AvailabilityData> {
    try {
      const response = await this.get<AvailabilityData>(`/boat/${boatId}/date`, {
        date
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch availability for date:', error);
      throw error;
    }
  }

  // Get availability data for a date range
  public async getAvailabilitiesByBoatIdAndDateRange(boatId: number, startDate: string, endDate: string): Promise<AvailabilityData[]> {
    try {
      const response = await this.get<AvailabilityData[]>(`/boat/${boatId}/range`, {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch availability range:', error);
      throw error;
    }
  }

  // Check if boat is available between dates
  public async isBoatAvailableBetweenDates(boatId: number, startDate: string, endDate: string): Promise<boolean> {
    try {
      const response = await this.get<boolean>(`/boat/${boatId}/available-range`, {
        startDate,
        endDate
      });
      return response;
    } catch (error) {
      console.error('Failed to check availability range:', error);
      throw error;
    }
  }

  // Get availability by ID
  public async getAvailabilityById(id: number): Promise<AvailabilityData> {
    return this.get<AvailabilityData>(`/${id}`);
  }

  // Get all availabilities for a boat
  public async getAvailabilitiesByBoatId(boatId: number): Promise<AvailabilityData[]> {
    return this.get<AvailabilityData[]>(`/boat/${boatId}`);
  }

  // Check if availability exists
  public async existsAvailabilityById(id: number): Promise<boolean> {
    return this.get<boolean>(`/exists/${id}`);
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
  findAvailabilitiesByBoatId: async (boatId: number): Promise<AvailabilityData[]> => {
    return availabilityService.getAvailabilitiesByBoatId(boatId);
  },

  // Get availabilities by boat ID and date range
  findAvailabilitiesByBoatIdAndDateRange: async (
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityData[]> => {
    return availabilityService.getAvailabilitiesByBoatIdAndDateRange(boatId, startDate, endDate);
  },

  // Get availability by boat ID and date
  findAvailabilityByBoatIdAndDate: async (
    boatId: number,
    date: string
  ): Promise<AvailabilityData> => {
    return availabilityService.getAvailabilityByBoatIdAndDate(boatId, date);
  },

  // Check if boat is available on date
  isBoatAvailableOnDate: async (boatId: number, date: string): Promise<boolean> => {
    return availabilityService.isBoatAvailableOnDate(boatId, date);
  },

  // Check if boat is available between dates
  isBoatAvailableBetweenDates: async (
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> => {
    return availabilityService.isBoatAvailableBetweenDates(boatId, startDate, endDate);
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
    return availabilityService.getCalendarAvailability(boatId, startDate, endDate);
  },
};

export default {
  query: availabilityQueryService,
};
