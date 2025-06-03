import { BaseService } from "./base/BaseService";
import {
  AvailabilityDTO,
  CreateAvailabilityDTO,
  UpdateAvailabilityDTO,
  CreateAvailabilityPeriodCommand,
  UpdateAvailabilityPeriodCommand,
  AvailabilityStats,
  CalendarAvailability,
} from "@/types/availability.types";

class AvailabilityService extends BaseService {
  constructor() {
    super("");
  }

  // ======= Query Operations (GET) =======

  // Belirli bir availability getirme
  public async getAvailabilityById(id: number): Promise<AvailabilityDTO> {
    return this.get<AvailabilityDTO>(`/availabilities/${id}`);
  }

  // Boat'a ait tüm availability'leri getirme
  public async getAvailabilitiesByBoatId(
    boatId: number
  ): Promise<AvailabilityDTO[]> {
    return this.get<AvailabilityDTO[]>(`/availabilities/boat/${boatId}`);
  }

  // Tarih aralığında availability'leri getirme
  public async getAvailabilitiesByBoatIdAndDateRange(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityDTO[]> {
    return this.get<AvailabilityDTO[]>(
      `/availabilities/boat/${boatId}/range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Belirli tarihte availability getirme
  public async getAvailabilityByBoatIdAndDate(
    boatId: number,
    date: string
  ): Promise<AvailabilityDTO> {
    return this.get<AvailabilityDTO>(
      `/availabilities/boat/${boatId}/date?date=${date}`
    );
  }

  // Belirli tarihte boat müsait mi kontrolü
  public async isBoatAvailableOnDate(
    boatId: number,
    date: string
  ): Promise<boolean> {
    return this.get<boolean>(
      `/availabilities/boat/${boatId}/available?date=${date}`
    );
  }

  // Tarih aralığında boat müsait mi kontrolü
  public async isBoatAvailableBetweenDates(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    return this.get<boolean>(
      `/availabilities/boat/${boatId}/available-range?startDate=${startDate}&endDate=${endDate}`
    );
  }

  // Availability var mı kontrolü
  public async existsAvailabilityById(id: number): Promise<boolean> {
    return this.get<boolean>(`/availabilities/exists/${id}`);
  }

  // ======= Command Operations (POST/PUT/DELETE) =======

  // Yeni availability oluşturma
  public async createAvailability(
    command: CreateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return this.post<AvailabilityDTO>("/availabilities", command);
  }

  // Toplu availability oluşturma
  public async createAvailabilities(
    commands: CreateAvailabilityDTO[]
  ): Promise<AvailabilityDTO[]> {
    return this.post<AvailabilityDTO[]>("/availabilities/batch", commands);
  }

  // Availability güncelleme
  public async updateAvailability(
    command: UpdateAvailabilityDTO
  ): Promise<AvailabilityDTO> {
    return this.put<AvailabilityDTO>("/availabilities", command);
  }

  // Availability silme (soft delete)
  public async deleteAvailability(id: number): Promise<void> {
    return this.delete<void>(`/availabilities/${id}`);
  }

  // Boat'a ait tüm availability'leri silme
  public async deleteAvailabilitiesByBoatId(boatId: number): Promise<void> {
    return this.delete<void>(`/availabilities/boat/${boatId}`);
  }

  // Availability durumunu değiştirme
  public async setAvailabilityStatus(
    id: number,
    isAvailable: boolean
  ): Promise<void> {
    return this.patch<void>(
      `/availabilities/${id}/status?isAvailable=${isAvailable}`,
      null // PATCH isteği için body yok, queryParam kullanıyoruz
    );
  }

  // Fiyat override set etme
  public async setAvailabilityPriceOverride(
    id: number,
    priceOverride: number
  ): Promise<void> {
    return this.patch<void>(
      `/availabilities/${id}/price-override?priceOverride=${priceOverride}`,
      null // PATCH isteği için body yok, queryParam kullanıyoruz
    );
  }

  // Dönem için availability oluşturma
  public async createAvailabilityPeriod(
    command: CreateAvailabilityPeriodCommand
  ): Promise<void> {
    const params = new URLSearchParams({
      boatId: command.boatId.toString(),
      startDate: command.startDate,
      endDate: command.endDate,
      isAvailable: command.isAvailable.toString(),
    });

    if (command.priceOverride !== undefined) {
      params.append("priceOverride", command.priceOverride.toString());
    }

    return this.post<void>(`/availabilities/period?${params.toString()}`, null);
  }

  // Dönem availability güncelleme
  public async updateAvailabilityPeriod(
    command: UpdateAvailabilityPeriodCommand
  ): Promise<void> {
    const params = new URLSearchParams({
      boatId: command.boatId.toString(),
      startDate: command.startDate,
      endDate: command.endDate,
    });

    if (command.isAvailable !== undefined) {
      params.append("isAvailable", command.isAvailable.toString());
    }

    if (command.priceOverride !== undefined) {
      params.append("priceOverride", command.priceOverride.toString());
    }

    return this.put<void>(`/availabilities/period?${params.toString()}`, null);
  }

  // ======= Helper Methods =======

  // Calendar için availability verilerini formatlama
  public async getCalendarAvailability(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<CalendarAvailability[]> {
    try {
      const availabilities = await this.getAvailabilitiesByBoatIdAndDateRange(
        boatId,
        startDate,
        endDate
      );

      return availabilities.map((availability) => ({
        date: availability.date,
        isAvailable: availability.isAvailable,
        price: availability.priceOverride,
        isOverride: !!availability.priceOverride,
        availabilityId: availability.id,
      }));
    } catch (error) {
      console.error("Error fetching calendar availability:", error);
      return [];
    }
  }

  // Availability istatistikleri
  public async getAvailabilityStats(
    boatId: number,
    startDate: string,
    endDate: string
  ): Promise<AvailabilityStats> {
    try {
      const availabilities = await this.getAvailabilitiesByBoatIdAndDateRange(
        boatId,
        startDate,
        endDate
      );

      const totalDays = availabilities.length;
      const availableDays = availabilities.filter((a) => a.isAvailable).length;
      const unavailableDays = totalDays - availableDays;

      const pricesWithOverride = availabilities
        .filter((a) => a.priceOverride)
        .map((a) => a.priceOverride!);

      const averagePrice =
        pricesWithOverride.length > 0
          ? pricesWithOverride.reduce((sum, price) => sum + price, 0) /
            pricesWithOverride.length
          : undefined;

      return {
        totalDays,
        availableDays,
        unavailableDays,
        averagePrice,
        boatId,
        dateRange: {
          startDate,
          endDate,
        },
      };
    } catch (error) {
      console.error("Error fetching availability stats:", error);
      throw error;
    }
  }

  // Günlük availability toggle
  public async toggleDayAvailability(
    boatId: number,
    date: string
  ): Promise<AvailabilityDTO> {
    try {
      // Önce o tarihte availability var mı kontrol et
      const existingAvailability = await this.getAvailabilityByBoatIdAndDate(
        boatId,
        date
      );

      if (existingAvailability) {
        // Var ise durumunu toggle et
        const updateCommand: UpdateAvailabilityDTO = {
          id: existingAvailability.id,
          isAvailable: !existingAvailability.isAvailable,
        };
        return this.updateAvailability(updateCommand);
      } else {
        // Yok ise yeni availability oluştur (default: available)
        const createCommand: CreateAvailabilityDTO = {
          boatId,
          date,
          isAvailable: true,
        };
        return this.createAvailability(createCommand);
      }
    } catch (error) {
      console.error("Error toggling day availability:", error);
      throw error;
    }
  }

  // Tarih range'ini kontrol et ve eksik günler için availability oluştur
  public async ensureAvailabilityForPeriod(
    boatId: number,
    startDate: string,
    endDate: string,
    defaultAvailable: boolean = true,
    defaultPrice?: number
  ): Promise<AvailabilityDTO[]> {
    try {
      const command: CreateAvailabilityPeriodCommand = {
        boatId,
        startDate,
        endDate,
        isAvailable: defaultAvailable,
        priceOverride: defaultPrice,
      };

      await this.createAvailabilityPeriod(command);

      // Oluşturulan availability'leri geri döndür
      return this.getAvailabilitiesByBoatIdAndDateRange(
        boatId,
        startDate,
        endDate
      );
    } catch (error) {
      console.error("Error ensuring availability for period:", error);
      throw error;
    }
  }
}

export const availabilityService = new AvailabilityService();
