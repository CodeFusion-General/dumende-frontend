import React, { useState, useEffect } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { UpdateAvailabilityDTO } from "@/types/boat.types";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ErrorDisplay } from "@/components/common/ErrorDisplay";
import { useRetry } from "@/hooks/useRetry";
import {
  validators,
  formatValidationErrors,
  ValidationError,
  parseApiError,
  AppError,
} from "@/utils/errorHandling";

interface AvailabilityEntry {
  id: number;
  date: string;
  isAvailable: boolean;
  priceOverride?: number;
  boatId: number;
  displayDate: string;
  status: "available" | "unavailable" | "reserved";
}

interface EditAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateAvailabilityData) => Promise<void>;
  availabilityEntry: AvailabilityEntry | null;
}

interface UpdateAvailabilityData {
  id: number;
  date?: string;
  isAvailable?: boolean;
  priceOverride?: number;
}

interface FormErrors {
  date?: string;
  priceOverride?: string;
  general?: string;
}

const EditAvailabilityModalContent: React.FC<EditAvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availabilityEntry,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [priceOverride, setPriceOverride] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<AppError | null>(null);

  const {
    execute: executeSubmit,
    isRetrying,
    retryCount,
  } = useRetry({
    maxRetries: 3,
    onRetry: (attempt) => {
      console.log(`Retrying edit form submission (attempt ${attempt})`);
    },
    onError: (error) => {
      setApiError(error);
    },
  });

  // Pre-populate form fields with current availability data
  useEffect(() => {
    if (isOpen && availabilityEntry) {
      // Parse the date string and set the date
      const dateObj = new Date(availabilityEntry.date);
      setSelectedDate(dateObj);

      // Set availability status
      setIsAvailable(availabilityEntry.isAvailable);

      // Set price override
      setPriceOverride(availabilityEntry.priceOverride?.toString() || "");

      // Clear errors
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, availabilityEntry]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(undefined);
      setIsAvailable(true);
      setPriceOverride("");
      setErrors({});
      setApiError(null);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const validationErrors: ValidationError[] = [];

    // Validate date
    const dateError = validators.required(selectedDate, "date");
    if (dateError) {
      validationErrors.push({ field: "date", message: "Tarih seçilmelidir" });
    } else if (selectedDate) {
      const pastDateError = validators.pastDate(selectedDate, "date");
      if (pastDateError) {
        validationErrors.push(pastDateError);
      }
    }

    // Validate price override
    if (priceOverride.trim() !== "") {
      const priceError = validators.price(priceOverride, "priceOverride");
      if (priceError) {
        validationErrors.push(priceError);
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

    if (!availabilityEntry) {
      setErrors({ general: "Düzenlenecek müsaitlik kaydı bulunamadı" });
      return;
    }

    setErrors({});
    setApiError(null);

    try {
      await executeSubmit(async () => {
        const data: UpdateAvailabilityData = {
          id: availabilityEntry.id,
          date: selectedDate!.toISOString().split("T")[0], // Convert to yyyy-MM-dd format
          isAvailable,
          priceOverride:
            priceOverride.trim() !== "" ? parseFloat(priceOverride) : undefined,
        };

        await onSubmit(data);
      });

      onClose();
    } catch (error) {
      // Error is handled by the retry hook
      console.error("Failed to update availability:", error);
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Müsaitlik Düzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Entry Info */}
          {availabilityEntry && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-blue-900">
                  Düzenlenen Kayıt:
                </span>{" "}
                <span className="text-blue-700">
                  {availabilityEntry.displayDate}
                </span>
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

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Tarih</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    errors.date && "border-red-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd MMMM yyyy", { locale: tr })
                    : "Tarih seçin"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date}</p>
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
                    : "Güncelleniyor..."}
                </>
              ) : (
                "Güncelle"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Wrap with error boundary
export const EditAvailabilityModal: React.FC<EditAvailabilityModalProps> = (
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
    <EditAvailabilityModalContent {...props} />
  </ErrorBoundary>
);
