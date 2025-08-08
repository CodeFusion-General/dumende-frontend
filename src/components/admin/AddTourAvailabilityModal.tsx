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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar as CalendarIcon, 
  Loader2,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Info,
  ChevronRight,
  Clock,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, differenceInDays } from "date-fns";
import { tr } from "date-fns/locale";

interface AddTourAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTourAvailabilityPeriodData) => Promise<void>;
  selectedTourName?: string;
  selectedDate?: Date;
}

interface CreateTourAvailabilityPeriodData {
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

const AddTourAvailabilityModal: React.FC<AddTourAvailabilityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedTourName,
  selectedDate,
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(selectedDate);
  const [endDate, setEndDate] = useState<Date | undefined>(selectedDate);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [priceOverride, setPriceOverride] = useState<string>("");
  const [isInstantConfirmation, setIsInstantConfirmation] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCalendar, setActiveCalendar] = useState<"start" | "end" | null>(null);

  // Quick date range presets
  const quickRanges = [
    { label: "Bugün", days: 0 },
    { label: "Bu Hafta", days: 7 },
    { label: "Bu Ay", days: 30 },
    { label: "3 Ay", days: 90 },
  ];

  useEffect(() => {
    if (isOpen) {
      if (selectedDate) {
        setStartDate(selectedDate);
        setEndDate(selectedDate);
      } else {
        setStartDate(undefined);
        setEndDate(undefined);
      }
      setIsAvailable(true);
      setPriceOverride("");
      setIsInstantConfirmation(false);
      setErrors({});
      setActiveCalendar(null);
    }
  }, [isOpen, selectedDate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!startDate) {
      newErrors.startDate = "Başlangıç tarihi seçilmelidir";
    }

    if (!endDate) {
      newErrors.endDate = "Bitiş tarihi seçilmelidir";
    }

    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
    }

    if (priceOverride && (isNaN(Number(priceOverride)) || Number(priceOverride) < 0)) {
      newErrors.priceOverride = "Geçerli bir fiyat giriniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const data: CreateTourAvailabilityPeriodData = {
        startDate: startDate!.toISOString().split("T")[0],
        endDate: endDate!.toISOString().split("T")[0],
        isAvailable,
        priceOverride: priceOverride ? parseFloat(priceOverride) : undefined,
        isInstantConfirmation,
      };
      
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || "Bir hata oluştu. Lütfen tekrar deneyin." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickRange = (days: number) => {
    const today = new Date();
    setStartDate(today);
    setEndDate(days === 0 ? today : addDays(today, days));
    setActiveCalendar(null);
  };

  const dayCount = startDate && endDate 
    ? differenceInDays(endDate, startDate) + 1 
    : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-[#15847c] rounded-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            Yeni Müsaitlik Ekle
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tour Info */}
          {selectedTourName && (
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Seçili Tur:</span>
                <span className="text-sm text-blue-700">{selectedTourName}</span>
              </div>
            </Card>
          )}

          {/* Error Display */}
          {errors.general && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            </Card>
          )}

          {/* Quick Range Selection */}
          <div>
            <Label className="text-sm font-semibold mb-3 block">Hızlı Seçim</Label>
            <div className="grid grid-cols-4 gap-2">
              {quickRanges.map((range) => (
                <Button
                  key={range.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickRange(range.days)}
                  className="hover:bg-[#15847c] hover:text-white hover:border-[#15847c] transition-all"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#15847c]" />
                Başlangıç Tarihi
              </Label>
              
              <Card 
                className={cn(
                  "p-3 cursor-pointer transition-all hover:border-[#15847c]",
                  errors.startDate && "border-red-500",
                  activeCalendar === "start" && "border-[#15847c] shadow-lg"
                )}
                onClick={() => setActiveCalendar(activeCalendar === "start" ? null : "start")}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                    !startDate && "text-gray-400"
                  )}>
                    {startDate 
                      ? format(startDate, "dd MMMM yyyy", { locale: tr })
                      : "Tarih seçin"
                    }
                  </span>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </Card>
              
              {activeCalendar === "start" && (
                <Card className="p-2 absolute z-50 bg-white shadow-xl">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && endDate && endDate < date) {
                        setEndDate(date);
                      }
                      setActiveCalendar(null);
                    }}
                    disabled={(date) => date < today}
                    locale={tr}
                    className="rounded-md"
                  />
                </Card>
              )}
              
              {errors.startDate && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#15847c]" />
                Bitiş Tarihi
              </Label>
              
              <Card 
                className={cn(
                  "p-3 cursor-pointer transition-all hover:border-[#15847c]",
                  errors.endDate && "border-red-500",
                  activeCalendar === "end" && "border-[#15847c] shadow-lg"
                )}
                onClick={() => setActiveCalendar(activeCalendar === "end" ? null : "end")}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm",
                    !endDate && "text-gray-400"
                  )}>
                    {endDate 
                      ? format(endDate, "dd MMMM yyyy", { locale: tr })
                      : "Tarih seçin"
                    }
                  </span>
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                </div>
              </Card>
              
              {activeCalendar === "end" && (
                <Card className="p-2 absolute z-50 bg-white shadow-xl">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setActiveCalendar(null);
                    }}
                    disabled={(date) => {
                      const minDate = startDate || today;
                      return date < minDate;
                    }}
                    locale={tr}
                    className="rounded-md"
                  />
                </Card>
              )}
              
              {errors.endDate && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Date Summary */}
          {startDate && endDate && (
            <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Seçilen Dönem</p>
                    <p className="text-xs text-green-700 mt-1">
                      {format(startDate, "dd MMM", { locale: tr })} 
                      <ChevronRight className="h-3 w-3 inline mx-1" />
                      {format(endDate, "dd MMM yyyy", { locale: tr })}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {dayCount} Gün
                </Badge>
              </div>
            </Card>
          )}

          {/* Availability Settings */}
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#15847c]" />
              Müsaitlik Ayarları
            </h3>
            
            {/* Availability Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isAvailable" className="text-sm font-medium">
                  Müsaitlik Durumu
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  {isAvailable ? "Bu tarihler rezervasyona açık" : "Bu tarihler rezervasyona kapalı"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch 
                  id="isAvailable" 
                  checked={isAvailable} 
                  onCheckedChange={setIsAvailable}
                  className="data-[state=checked]:bg-[#15847c]"
                />
                <Badge 
                  variant="outline" 
                  className={isAvailable 
                    ? "bg-green-50 text-green-700 border-green-300" 
                    : "bg-red-50 text-red-700 border-red-300"
                  }
                >
                  {isAvailable ? "Müsait" : "Müsait Değil"}
                </Badge>
              </div>
            </div>

            {/* Price Override */}
            <div className="space-y-2">
              <Label htmlFor="priceOverride" className="text-sm font-medium">
                Özel Fiyat (İsteğe Bağlı)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₺</span>
                <Input
                  id="priceOverride"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Varsayılan fiyat kullanılacak"
                  value={priceOverride}
                  onChange={(e) => setPriceOverride(e.target.value)}
                  className={cn(
                    "pl-10",
                    errors.priceOverride && "border-red-500"
                  )}
                />
              </div>
              {errors.priceOverride && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.priceOverride}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Bu dönem için farklı bir fiyat belirleyebilirsiniz
              </p>
            </div>

            {/* Instant Confirmation */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="isInstantConfirmation" className="text-sm font-medium">
                  Rezervasyon Onayı
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  {isInstantConfirmation 
                    ? "Rezervasyonlar otomatik onaylanacak" 
                    : "Rezervasyonları manuel onaylayacaksınız"
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch 
                  id="isInstantConfirmation" 
                  checked={isInstantConfirmation} 
                  onCheckedChange={setIsInstantConfirmation}
                  className="data-[state=checked]:bg-purple-600"
                />
                <Badge 
                  variant="outline" 
                  className={isInstantConfirmation 
                    ? "bg-purple-50 text-purple-700 border-purple-300" 
                    : "bg-gray-50 text-gray-700 border-gray-300"
                  }
                >
                  {isInstantConfirmation ? "Anında Onay" : "Manuel Onay"}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Help Text */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-800">
                <p className="font-semibold mb-1">İpucu:</p>
                <p>Seçtiğiniz tarih aralığındaki tüm günler için müsaitlik oluşturulacaktır. 
                   Daha sonra her bir günü ayrı ayrı düzenleyebilirsiniz.</p>
              </div>
            </div>
          </Card>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-[#15847c] to-[#0e5c56] hover:from-[#0e5c56] hover:to-[#15847c] text-white" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Müsaitlik Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTourAvailabilityModal;