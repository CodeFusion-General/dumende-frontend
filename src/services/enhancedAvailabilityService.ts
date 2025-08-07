import { availabilityService, dateUtils } from "./availabilityService";
import {
  parseApiError,
  retryOperation,
  AppError,
  ErrorType,
  createAppError,
  showErrorToast,
} from "@/utils/errorHandling";
import {
  CalendarAvailability,
  AvailabilityData,
} from "@/types/availability.types";

// Enhanced service wrapper with comprehensive error handling
class EnhancedAvailabilityService {
  // Get calendar availability with error handling and retry
  async getCalendarAvailability(
    boatId: number,
    startDate: string,
    endDate: string,
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<CalendarAvailability[]> {
    const { showToast = false, maxRetries = 3 } = options;

    try {
      return await retryOperation(
        () =>
          availabilityService.getCalendarAvailability(
            boatId,
            startDate,
            endDate
          ),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying getCalendarAvailability (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Takvim Verileri Yüklenemedi");
      }

      throw appError;
    }
  }

  // Get availabilities by boat ID with error handling
  async getAvailabilitiesByBoatId(
    boatId: number,
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<AvailabilityData[]> {
    const { showToast = false, maxRetries = 3 } = options;

    try {
      return await retryOperation(
        () => availabilityService.getAvailabilitiesByBoatId(boatId),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying getAvailabilitiesByBoatId (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Müsaitlik Verileri Yüklenemedi");
      }

      throw appError;
    }
  }

  // Create availability period with validation and error handling
  async createAvailabilityPeriod(
    command: {
      boatId: number;
      startDate: string;
      endDate: string;
      isAvailable: boolean;
    },
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<void> {
    const { showToast = true, maxRetries = 2 } = options;

    // Validate input
    this.validateCreatePeriodCommand(command);

    try {
      await retryOperation(
        () => availabilityService.createAvailabilityPeriod(command),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying createAvailabilityPeriod (attempt ${attempt}):`,
            error
          );
        }
      );

      if (showToast) {
        // Success toast is handled by the calling component
      }
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Müsaitlik Dönemi Oluşturulamadı");
      }

      throw appError;
    }
  }

  // Update availability with validation and error handling
  async updateAvailability(
    data: {
      id: number;
      boatId?: number;
      date?: string;
      isAvailable?: boolean;
      priceOverride?: number;
    },
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<any> {
    const { showToast = true, maxRetries = 2 } = options;

    // Validate input
    this.validateUpdateCommand(data);

    try {
      return await retryOperation(
        () => availabilityService.updateAvailability(data),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying updateAvailability (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Müsaitlik Güncellenemedi");
      }

      throw appError;
    }
  }

  // Delete availability with error handling
  async deleteAvailability(
    id: number,
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<void> {
    const { showToast = true, maxRetries = 2 } = options;

    if (!id || id <= 0) {
      throw createAppError("Geçersiz müsaitlik ID'si", ErrorType.VALIDATION);
    }

    try {
      await retryOperation(
        () => availabilityService.deleteAvailability(id),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying deleteAvailability (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Müsaitlik Silinemedi");
      }

      throw appError;
    }
  }

  // Set availability status with error handling
  async setAvailabilityStatus(
    id: number,
    isAvailable: boolean,
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<void> {
    const { showToast = true, maxRetries = 2 } = options;

    if (!id || id <= 0) {
      throw createAppError("Geçersiz müsaitlik ID'si", ErrorType.VALIDATION);
    }

    try {
      await retryOperation(
        () => availabilityService.setAvailabilityStatus(id, isAvailable),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying setAvailabilityStatus (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Müsaitlik Durumu Güncellenemedi");
      }

      throw appError;
    }
  }

  // Check boat availability with error handling
  async isBoatAvailableOnDate(
    boatId: number,
    date: string,
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<boolean> {
    const { showToast = false, maxRetries = 3 } = options;

    if (!boatId || boatId <= 0) {
      throw createAppError("Geçersiz gemi ID'si", ErrorType.VALIDATION);
    }

    if (!date) {
      throw createAppError("Tarih belirtilmelidir", ErrorType.VALIDATION);
    }

    try {
      return await retryOperation(
        () => availabilityService.isBoatAvailableOnDate(boatId, date),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying isBoatAvailableOnDate (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Müsaitlik Kontrolü Yapılamadı");
      }

      throw appError;
    }
  }

  // Get availability by date range with error handling
  async getAvailabilitiesByDateRange(
    boatId: number,
    startDate: string,
    endDate: string,
    options: { showToast?: boolean; maxRetries?: number } = {}
  ): Promise<AvailabilityData[]> {
    const { showToast = false, maxRetries = 3 } = options;

    // Validate input
    this.validateDateRange(startDate, endDate);

    try {
      return await retryOperation(
        () =>
          availabilityService.getAvailabilitiesByBoatIdAndDateRange(
            boatId,
            startDate,
            endDate
          ),
        maxRetries,
        1000,
        (attempt, error) => {
          console.log(
            `Retrying getAvailabilitiesByDateRange (attempt ${attempt}):`,
            error
          );
        }
      );
    } catch (error) {
      const appError = parseApiError(error);

      if (showToast) {
        showErrorToast(appError, "Tarih Aralığı Verileri Yüklenemedi");
      }

      throw appError;
    }
  }

  // Validation helpers
  private validateCreatePeriodCommand(command: {
    boatId: number;
    startDate: string;
    endDate: string;
    isAvailable: boolean;
  }): void {
    if (!command.boatId || command.boatId <= 0) {
      throw createAppError("Geçersiz gemi ID'si", ErrorType.VALIDATION);
    }

    if (!command.startDate) {
      throw createAppError(
        "Başlangıç tarihi belirtilmelidir",
        ErrorType.VALIDATION
      );
    }

    if (!command.endDate) {
      throw createAppError(
        "Bitiş tarihi belirtilmelidir",
        ErrorType.VALIDATION
      );
    }

    this.validateDateRange(command.startDate, command.endDate);
  }

  private validateUpdateCommand(data: {
    id: number;
    boatId?: number;
    date?: string;
    isAvailable?: boolean;
    priceOverride?: number;
  }): void {
    if (!data.id || data.id <= 0) {
      throw createAppError("Geçersiz müsaitlik ID'si", ErrorType.VALIDATION);
    }

    if (data.priceOverride !== undefined && data.priceOverride < 0) {
      throw createAppError("Fiyat negatif olamaz", ErrorType.VALIDATION);
    }

    if (data.date) {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        throw createAppError("Geçersiz tarih formatı", ErrorType.VALIDATION);
      }

      // Check if date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw createAppError(
          "Tarih bugünden önce olamaz",
          ErrorType.VALIDATION
        );
      }
    }
  }

  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      throw createAppError(
        "Geçersiz başlangıç tarihi formatı",
        ErrorType.VALIDATION
      );
    }

    if (isNaN(end.getTime())) {
      throw createAppError(
        "Geçersiz bitiş tarihi formatı",
        ErrorType.VALIDATION
      );
    }

    if (start >= end) {
      throw createAppError(
        "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
        ErrorType.VALIDATION
      );
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      throw createAppError(
        "Başlangıç tarihi bugünden önce olamaz",
        ErrorType.VALIDATION
      );
    }
  }

  // Batch operations with error handling
  async batchUpdateAvailabilities(
    updates: Array<{
      id: number;
      isAvailable?: boolean;
      priceOverride?: number;
    }>,
    options: { showToast?: boolean; continueOnError?: boolean } = {}
  ): Promise<{
    successful: number;
    failed: Array<{ id: number; error: AppError }>;
  }> {
    const { showToast = true, continueOnError = true } = options;

    const results = {
      successful: 0,
      failed: [] as Array<{ id: number; error: AppError }>,
    };

    for (const update of updates) {
      try {
        await this.updateAvailability(update, { showToast: false });
        results.successful++;
      } catch (error) {
        const appError =
          error instanceof Error && "type" in error
            ? (error as AppError)
            : parseApiError(error);

        results.failed.push({ id: update.id, error: appError });

        if (!continueOnError) {
          break;
        }
      }
    }

    if (showToast) {
      if (results.failed.length === 0) {
        // All successful - success toast handled by calling component
      } else if (results.successful === 0) {
        showErrorToast(
          createAppError("Hiçbir güncelleme başarılı olmadı", ErrorType.CLIENT),
          "Toplu Güncelleme Başarısız"
        );
      } else {
        showErrorToast(
          createAppError(
            `${results.successful} başarılı, ${results.failed.length} başarısız güncelleme`,
            ErrorType.CLIENT
          ),
          "Kısmi Başarı"
        );
      }
    }

    return results;
  }
}

export const enhancedAvailabilityService = new EnhancedAvailabilityService();
