import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BoatDTO } from "@/types/boat.types";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorDisplay } from "@/components/common/ErrorDisplay";
import { useRetry } from "@/hooks/useRetry";
import {
  validators,
  formatValidationErrors,
  ValidationError,
  AppError,
} from "@/utils/errorHandling";

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAvailabilityPeriodData) => Promise<void>;
  selectedBoat: BoatDTO | null;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

interface CreateAvailabilityPeriodData {
  startDate: string;
  endDate: string;
  isAvailable: boolean;
  priceOverride?: number;
  isInstantConfirmation?: boolean;
}

interface FormErrors {
  startDate?: string;
  endDate?: string;
  priceOverride?: string;
  general?: string;
}

const AddAvailabilityModalContent: React.FC<AddAvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedBoat,
  initialStartDate,
  initialEndDate,
}) => {
  // Format date for HTML input (yyyy-MM-dd)
  const formatDateForInput = (date?: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date for display (Turkish format)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get today's date in yyyy-MM-dd format for min attribute
  const getTodayString = (): string => {
    const today = new Date();
    return formatDateForInput(today);
  };

  const [startDate, setStartDate] = useState<string>(
    formatDateForInput(initialStartDate)
  );
  const [endDate, setEndDate] = useState<string>(
    formatDateForInput(initialEndDate)
  );
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [priceOverride, setPriceOverride] = useState<string>("");
  const [isInstantConfirmation, setIsInstantConfirmation] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<AppError | null>(null);

  const {
    execute: executeSubmit,
    isRetrying,
    retryCount,
  } = useRetry({
    maxRetries: 3,
    onRetry: (attempt) => {
      console.log(`Retrying form submission (attempt ${attempt})`);
    },
    onError: (error) => {
      setApiError(error);
    },
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStartDate(formatDateForInput(initialStartDate));
      setEndDate(formatDateForInput(initialEndDate));
      setIsAvailable(true);
      setPriceOverride("");
      setIsInstantConfirmation(false);
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  const validateForm = (): boolean => {
    const validationErrors: ValidationError[] = [];

    // Validate start date
    if (!startDate) {
      validationErrors.push({
        field: "startDate",
        message: "Başlangıç tarihi seçilmelidir",
      });
    } else {
      const startDateObj = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startDateObj.setHours(0, 0, 0, 0);
      
      if (startDateObj < today) {
        validationErrors.push({
          field: "startDate",
          message: "Başlangıç tarihi bugünden önce olamaz",
        });
      }
    }

    // Validate end date
    if (!endDate) {
      validationErrors.push({
        field: "endDate",
        message: "Bitiş tarihi seçilmelidir",
      });
    }

    // Validate date range
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      if (endDateObj <= startDateObj) {
        validationErrors.push({
          field: "endDate",
          message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
        });
      }
    }

    // Validate price override
    if (priceOverride.trim() !== "") {
      const price = parseFloat(priceOverride);
      if (isNaN(price) || price < 0) {
        validationErrors.push({
          field: "priceOverride",
          message: "Geçerli bir fiyat giriniz",
        });
      }
    }

    const formattedErrors = formatValidationErrors(validationErrors);
    setErrors(formattedErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedBoat) {
      setErrors({ general: "Lütfen önce bir gemi seçin" });
      return;
    }

    setErrors({});
    setApiError(null);

    try {
      await executeSubmit(async () => {
        const data: CreateAvailabilityPeriodData = {
          startDate: startDate, // Already in yyyy-MM-dd format
          endDate: endDate, // Already in yyyy-MM-dd format
          isAvailable,
          priceOverride:
            priceOverride.trim() !== "" ? parseFloat(priceOverride) : undefined,
          isInstantConfirmation,
        };

        await onSubmit(data);
      });

      onClose();
    } catch (error) {
      // Error is handled by the retry hook
      console.error("Failed to create availability period:", error);
    }
  };

  const handleClose = () => {
    if (!isRetrying) {
      onClose();
    }
  };

  const handleRetry = () => {
    setApiError(null);
    handleSubmit(new Event("submit") as any);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);
    
    // If end date is before or equal to new start date, clear it
    if (endDate && endDate <= newStartDate) {
      setEndDate("");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Müsaitlik Dönemi Ekle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Boat Info */}
          {selectedBoat && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-blue-900">Seçili Gemi:</span>{" "}
                <span className="text-blue-700">{selectedBoat.name}</span>
              </div>
            </div>
          )}

          {/* API Error Display */}
          {apiError && (
            <ErrorDisplay
              error={apiError}
              onRetry={apiError.isRetryable ? handleRetry : undefined}
              onDismiss={() => setApiError(null)}
              variant="inline"
              showSuggestions={true}
            />
          )}

          {/* General Form Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          {/* Retry Status */}
          {isRetrying && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                Yeniden deneniyor... (Deneme {retryCount}/3)
              </p>
            </div>
          )}

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Başlangıç Tarihi</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                min={getTodayString()}
                className={cn(
                  "pl-10 w-full",
                  errors.startDate && "border-red-500 focus:border-red-500"
                )}
                required
              />
            </div>
            {startDate && (
              <p className="text-sm text-gray-600">
                Seçilen: {formatDateForDisplay(startDate)}
              </p>
            )}
            {errors.startDate && (
              <p className="text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Bitiş Tarihi</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || getTodayString()}
                className={cn(
                  "pl-10 w-full",
                  errors.endDate && "border-red-500 focus:border-red-500"
                )}
                required
              />
            </div>
            {endDate && (
              <p className="text-sm text-gray-600">
                Seçilen: {formatDateForDisplay(endDate)}
              </p>
            )}
            {errors.endDate && (
              <p className="text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>

          {/* Availability Status */}
          <div className="space-y-2">
            <Label htmlFor="isAvailable">Müsaitlik Durumu</Label>
            <div className="flex items-center space-x-3">
              <Switch
                id="isAvailable"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
              <span className="text-sm text-gray-700">
                {isAvailable ? "Müsait" : "Müsait Değil"}
              </span>
            </div>
          </div>

          {/* Price Override */}
          <div className="space-y-2">
            <Label htmlFor="priceOverride">Özel Fiyat (İsteğe Bağlı)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₺
              </span>
              <Input
                id="priceOverride"
                type="number"
                min="0"
                step="0.01"
                placeholder="Özel fiyat giriniz"
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                className={cn("pl-8", errors.priceOverride && "border-red-500")}
              />
            </div>
            {errors.priceOverride && (
              <p className="text-sm text-red-600">{errors.priceOverride}</p>
            )}
            <p className="text-xs text-gray-500">
              Boş bırakırsanız geminin varsayılan fiyatı kullanılacaktır
            </p>
          </div>

          {/* Instant Confirmation */}
          <div className="space-y-2">
            <Label htmlFor="isInstantConfirmation">Anında Rezervasyon</Label>
            <div className="flex items-center space-x-3">
              <Switch
                id="isInstantConfirmation"
                checked={isInstantConfirmation}
                onCheckedChange={setIsInstantConfirmation}
              />
              <span className="text-sm text-gray-700">
                {isInstantConfirmation ? "Anında Onay" : "Manuel Onay"}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Açık olduğunda rezervasyonlar anında onaylanır, kapalı olduğunda manuel onay gerekir
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isRetrying}
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="bg-[#15847c] hover:bg-[#0e5c56]"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {retryCount > 0
                    ? `Yeniden Deneniyor... (${retryCount}/3)`
                    : "Oluşturuluyor..."}
                </>
              ) : (
                "Müsaitlik Oluştur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Wrap with error boundary
export const AddAvailabilityModal: React.FC<AddAvailabilityModalProps> = (
  props
) => (
  <ErrorBoundary
    fallback={
      <Dialog open={props.isOpen} onOpenChange={props.onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hata Oluştu</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <ErrorDisplay
              error="Modal yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin."
              onRetry={() => window.location.reload()}
              variant="default"
            />
          </div>
        </DialogContent>
      </Dialog>
    }
  >
    <AddAvailabilityModalContent {...props} />
  </ErrorBoundary>
);