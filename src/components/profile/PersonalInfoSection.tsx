import React from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfileFormData } from "@/types/profile.types";

interface PersonalInfoSectionProps {
  form: UseFormReturn<ProfileFormData>;
  disabled?: boolean;
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  form,
  disabled = false,
  className,
  stepNumber = 1,
  totalSteps = 3,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = form;

  const watchedDateOfBirth = watch("dateOfBirth");
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Handle different input formats
    let formattedDigits = digits;

    // Remove country code if present
    if (digits.startsWith("90") && digits.length > 10) {
      formattedDigits = digits.substring(2);
    } else if (digits.startsWith("0") && digits.length === 11) {
      formattedDigits = digits.substring(1);
    }

    // Format as XXX XXX XX XX
    if (formattedDigits.length >= 10) {
      return (
        formattedDigits.substring(0, 3) +
        " " +
        formattedDigits.substring(3, 6) +
        " " +
        formattedDigits.substring(6, 8) +
        " " +
        formattedDigits.substring(8, 10)
      );
    }

    return formattedDigits;
  };

  // Handle phone number input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue("phoneNumber", formatted.replace(/\s/g, ""));
    trigger("phoneNumber");
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const isoDate = format(date, "yyyy-MM-dd");
      setValue("dateOfBirth", isoDate);
      trigger("dateOfBirth");
      setIsCalendarOpen(false);
    }
  };

  // Parse date for display
  const selectedDate = watchedDateOfBirth
    ? new Date(watchedDateOfBirth)
    : undefined;

  // Calculate completion percentage for this section
  const watchedValues = watch();
  const requiredFields = [
    "firstName",
    "lastName",
    "phoneNumber",
    "dateOfBirth",
  ];
  const completedFields = requiredFields.filter((field) => {
    const value = watchedValues[field as keyof ProfileFormData];
    return value && value.toString().trim() !== "";
  });
  const completionPercentage = Math.round(
    (completedFields.length / requiredFields.length) * 100
  );

  return (
    <Card
      className={cn("w-full", className)}
      role="region"
      aria-labelledby="personal-info-title"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle
            id="personal-info-title"
            className="flex items-center gap-2"
          >
            <User className="w-5 h-5 text-primary" aria-hidden="true" />
            Kişisel Bilgiler
            {stepNumber && totalSteps && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Adım {stepNumber}/{totalSteps})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              %{completionPercentage} tamamlandı
            </div>
            {completionPercentage === 100 && (
              <CheckCircle2
                className="w-5 h-5 text-green-600"
                aria-label="Bölüm tamamlandı"
              />
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div
          className="w-full bg-muted rounded-full h-2 mt-2"
          role="progressbar"
          aria-valuenow={completionPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Kişisel bilgiler bölümü %${completionPercentage} tamamlandı`}
        >
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* First Name and Last Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              Ad *
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Adınızı girin"
              disabled={disabled}
              autoComplete="given-name"
              aria-required="true"
              aria-invalid={errors.firstName ? "true" : "false"}
              aria-describedby={
                errors.firstName ? "firstName-error" : "firstName-help"
              }
              className={cn(
                "transition-all duration-200",
                errors.firstName &&
                  "border-destructive focus:border-destructive"
              )}
              {...register("firstName")}
            />
            {errors.firstName && (
              <div
                id="firstName-error"
                className="flex items-center gap-1 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{errors.firstName.message}</span>
              </div>
            )}
            <div id="firstName-help" className="text-xs text-muted-foreground">
              En az 2, en fazla 50 karakter
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Soyad *
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Soyadınızı girin"
              disabled={disabled}
              autoComplete="family-name"
              aria-required="true"
              aria-invalid={errors.lastName ? "true" : "false"}
              aria-describedby={
                errors.lastName ? "lastName-error" : "lastName-help"
              }
              className={cn(
                "transition-all duration-200",
                errors.lastName && "border-destructive focus:border-destructive"
              )}
              {...register("lastName")}
            />
            {errors.lastName && (
              <div
                id="lastName-error"
                className="flex items-center gap-1 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{errors.lastName.message}</span>
              </div>
            )}
            <div id="lastName-help" className="text-xs text-muted-foreground">
              En az 2, en fazla 50 karakter
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            Telefon Numarası *
          </Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="5XX XXX XX XX"
            disabled={disabled}
            autoComplete="tel"
            aria-required="true"
            aria-invalid={errors.phoneNumber ? "true" : "false"}
            aria-describedby={
              errors.phoneNumber ? "phoneNumber-error" : "phoneNumber-help"
            }
            value={formatPhoneNumber(watch("phoneNumber") || "")}
            onChange={handlePhoneChange}
            className={cn(
              "transition-all duration-200",
              errors.phoneNumber &&
                "border-destructive focus:border-destructive"
            )}
          />
          {errors.phoneNumber && (
            <div
              id="phoneNumber-error"
              className="flex items-center gap-1 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{errors.phoneNumber.message}</span>
            </div>
          )}
          <div id="phoneNumber-help" className="text-xs text-muted-foreground">
            Örnek: 555 123 45 67 (10 haneli Türkiye telefon numarası)
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="text-sm font-medium">
            Doğum Tarihi *
          </Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="dateOfBirth"
                variant="outline"
                disabled={disabled}
                aria-required="true"
                aria-invalid={errors.dateOfBirth ? "true" : "false"}
                aria-describedby={
                  errors.dateOfBirth ? "dateOfBirth-error" : "dateOfBirth-help"
                }
                aria-expanded={isCalendarOpen}
                aria-haspopup="dialog"
                role="combobox"
                className={cn(
                  "w-full justify-start text-left font-normal transition-all duration-200",
                  !selectedDate && "text-muted-foreground",
                  errors.dateOfBirth &&
                    "border-destructive focus:border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                {selectedDate ? (
                  format(selectedDate, "dd MMMM yyyy", { locale: tr })
                ) : (
                  <span>Doğum tarihinizi seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0"
              align="start"
              role="dialog"
              aria-label="Doğum tarihi seçici"
            >
              {/* Year/Month hızlı seçimli takvim */}
              <div className="p-3 flex items-center gap-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={selectedDate ? selectedDate.getFullYear() : 1990}
                  onChange={(e) => {
                    const year = Number(e.target.value);
                    const base = selectedDate || new Date();
                    const newDate = new Date(base);
                    newDate.setFullYear(year);
                    handleDateSelect(newDate);
                  }}
                >
                  {Array.from({ length: 100 }).map((_, idx) => {
                    const year = new Date().getFullYear() - idx - 18; // 18-118 arası
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={selectedDate ? selectedDate.getMonth() : 0}
                  onChange={(e) => {
                    const month = Number(e.target.value);
                    const base = selectedDate || new Date(1990, 0, 1);
                    const newDate = new Date(base);
                    newDate.setMonth(month);
                    handleDateSelect(newDate);
                  }}
                >
                  {Array.from({ length: 12 }).map((_, m) => (
                    <option key={m} value={m}>
                      {format(new Date(2000, m, 1), "LLLL", { locale: tr })}
                    </option>
                  ))}
                </select>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => {
                  const today = new Date();
                  const eighteenYearsAgo = new Date();
                  eighteenYearsAgo.setFullYear(today.getFullYear() - 18);

                  const hundredYearsAgo = new Date();
                  hundredYearsAgo.setFullYear(today.getFullYear() - 100);

                  return date > eighteenYearsAgo || date < hundredYearsAgo;
                }}
                initialFocus
                locale={tr}
                defaultMonth={selectedDate || new Date(1990, 0)}
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && (
            <div
              id="dateOfBirth-error"
              className="flex items-center gap-1 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{errors.dateOfBirth.message}</span>
            </div>
          )}
          <div id="dateOfBirth-help" className="text-xs text-muted-foreground">
            18-100 yaş aralığında olmalıdır. Takvimi açmak için Enter veya Space
            tuşuna basın.
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p>
            Kişisel bilgileriniz profil tamamlama sürecinde kullanılacak ve
            güvenli bir şekilde saklanacaktır.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
