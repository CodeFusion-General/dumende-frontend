import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressSectionProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  className?: string;
  stepNumber?: number;
  totalSteps?: number;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  form,
  disabled = false,
  className,
  stepNumber = 2,
  totalSteps = 3,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;

  const addressErrors = errors.address as any;
  const watchedCountry = watch("address.country");

  // Set default country to "Türkiye" if not already set
  React.useEffect(() => {
    if (!watchedCountry) {
      setValue("address.country", "Türkiye");
    }
  }, [watchedCountry, setValue]);

  // Calculate completion percentage for this section
  const watchedValues = watch();
  const requiredFields = [
    "address.street",
    "address.city",
    "address.district",
    "address.postalCode",
    "address.country",
  ];
  const completedFields = requiredFields.filter((field) => {
    const fieldPath = field.split(".");
    let value = watchedValues;
    for (const path of fieldPath) {
      value = value?.[path];
    }
    return value && value.toString().trim() !== "";
  });
  const completionPercentage = Math.round(
    (completedFields.length / requiredFields.length) * 100
  );

  return (
    <Card
      className={cn("w-full", className)}
      role="region"
      aria-labelledby="address-title"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle id="address-title" className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
            Adres Bilgileri
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
          aria-label={`Adres bilgileri bölümü %${completionPercentage} tamamlandı`}
        >
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Street Address */}
        <div className="space-y-2">
          <Label htmlFor="address.street" className="text-sm font-medium">
            Sokak Adresi *
          </Label>
          <Input
            id="address.street"
            name="address.street"
            placeholder="Sokak adresinizi girin"
            disabled={disabled}
            autoComplete="street-address"
            aria-required="true"
            aria-invalid={addressErrors?.street ? "true" : "false"}
            aria-describedby={
              addressErrors?.street ? "street-error" : "street-help"
            }
            className={cn(
              "transition-all duration-200",
              addressErrors?.street &&
                "border-destructive focus:border-destructive"
            )}
            {...register("address.street")}
          />
          {addressErrors?.street && (
            <div
              id="street-error"
              className="flex items-center gap-1 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
              <span>{addressErrors.street.message}</span>
            </div>
          )}
          <div id="street-help" className="text-xs text-muted-foreground">
            En az 5 karakter. Örnek: Atatürk Caddesi No:123
          </div>
        </div>

        {/* City and District Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="address.city" className="text-sm font-medium">
              Şehir *
            </Label>
            <Input
              id="address.city"
              name="address.city"
              placeholder="Şehir adını girin"
              disabled={disabled}
              autoComplete="address-level1"
              aria-required="true"
              aria-invalid={addressErrors?.city ? "true" : "false"}
              aria-describedby={
                addressErrors?.city ? "city-error" : "city-help"
              }
              className={cn(
                "transition-all duration-200",
                addressErrors?.city &&
                  "border-destructive focus:border-destructive"
              )}
              {...register("address.city")}
            />
            {addressErrors?.city && (
              <div
                id="city-error"
                className="flex items-center gap-1 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{addressErrors.city.message}</span>
              </div>
            )}
            <div id="city-help" className="text-xs text-muted-foreground">
              En az 2 karakter. Örnek: İstanbul
            </div>
          </div>

          {/* District */}
          <div className="space-y-2">
            <Label htmlFor="address.district" className="text-sm font-medium">
              İlçe *
            </Label>
            <Input
              id="address.district"
              name="address.district"
              placeholder="İlçe adını girin"
              disabled={disabled}
              autoComplete="address-level2"
              aria-required="true"
              aria-invalid={addressErrors?.district ? "true" : "false"}
              aria-describedby={
                addressErrors?.district ? "district-error" : "district-help"
              }
              className={cn(
                "transition-all duration-200",
                addressErrors?.district &&
                  "border-destructive focus:border-destructive"
              )}
              {...register("address.district")}
            />
            {addressErrors?.district && (
              <div
                id="district-error"
                className="flex items-center gap-1 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{addressErrors.district.message}</span>
              </div>
            )}
            <div id="district-help" className="text-xs text-muted-foreground">
              En az 2 karakter. Örnek: Kadıköy
            </div>
          </div>
        </div>

        {/* Postal Code and Country Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="address.postalCode" className="text-sm font-medium">
              Posta Kodu *
            </Label>
            <Input
              id="address.postalCode"
              name="address.postalCode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              placeholder="12345"
              disabled={disabled}
              maxLength={5}
              autoComplete="postal-code"
              aria-required="true"
              aria-invalid={addressErrors?.postalCode ? "true" : "false"}
              aria-describedby={
                addressErrors?.postalCode
                  ? "postalCode-error"
                  : "postalCode-help"
              }
              className={cn(
                "transition-all duration-200",
                addressErrors?.postalCode &&
                  "border-destructive focus:border-destructive"
              )}
              {...register("address.postalCode")}
            />
            {addressErrors?.postalCode && (
              <div
                id="postalCode-error"
                className="flex items-center gap-1 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{addressErrors.postalCode.message}</span>
              </div>
            )}
            <div id="postalCode-help" className="text-xs text-muted-foreground">
              5 haneli sayı. Örnek: 34000
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="address.country" className="text-sm font-medium">
              Ülke *
            </Label>
            <Select
              disabled={disabled}
              value={watchedCountry || "Türkiye"}
              onValueChange={(value) => setValue("address.country", value)}
            >
              <SelectTrigger
                id="address.country"
                aria-required="true"
                aria-invalid={addressErrors?.country ? "true" : "false"}
                aria-describedby={
                  addressErrors?.country ? "country-error" : "country-help"
                }
                className={cn(
                  "transition-all duration-200",
                  addressErrors?.country &&
                    "border-destructive focus:border-destructive"
                )}
              >
                <SelectValue placeholder="Ülke seçin" />
              </SelectTrigger>
              <SelectContent role="listbox" aria-label="Ülke seçenekleri">
                <SelectItem value="Türkiye">Türkiye</SelectItem>
                <SelectItem value="Almanya">Almanya</SelectItem>
                <SelectItem value="Fransa">Fransa</SelectItem>
                <SelectItem value="İngiltere">İngiltere</SelectItem>
                <SelectItem value="İtalya">İtalya</SelectItem>
                <SelectItem value="İspanya">İspanya</SelectItem>
                <SelectItem value="Hollanda">Hollanda</SelectItem>
                <SelectItem value="Belçika">Belçika</SelectItem>
                <SelectItem value="Avusturya">Avusturya</SelectItem>
                <SelectItem value="İsviçre">İsviçre</SelectItem>
                <SelectItem value="Amerika Birleşik Devletleri">
                  Amerika Birleşik Devletleri
                </SelectItem>
                <SelectItem value="Kanada">Kanada</SelectItem>
                <SelectItem value="Avustralya">Avustralya</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
            {addressErrors?.country && (
              <div
                id="country-error"
                className="flex items-center gap-1 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>{addressErrors.country.message}</span>
              </div>
            )}
            <div id="country-help" className="text-xs text-muted-foreground">
              Yaşadığınız ülkeyi seçin
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p>
            Adres bilgileriniz profil tamamlama sürecinde kullanılacak ve
            güvenli bir şekilde saklanacaktır.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
