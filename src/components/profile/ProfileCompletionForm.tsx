import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  RefreshCw,
  Wifi,
  WifiOff,
  Save,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { PersonalInfoSection } from "./PersonalInfoSection";
import { AddressSection } from "./AddressSection";
import { ProfileImageUpload } from "./ProfileImageUpload";

import { ProfileFormData } from "@/types/profile.types";
import { UserDTO } from "@/types/contact.types";
import { profileCompletionSchema } from "@/lib/validation/profile.schemas";
import { profileCompletionService } from "@/services/profileCompletionService";
import {
  parseApiError,
  showErrorToast,
  showSuccessToast,
  retryOperation,
  ErrorType,
  AppError,
  isOnline,
  createOfflineHandler,
} from "@/utils/errorHandling";
import {
  useLocalStorageAutoSave,
  loadFromLocalStorage,
  clearLocalStorage,
} from "@/hooks/useAutoSave";

interface ProfileCompletionFormProps {
  accountId: number;
  initialData?: Partial<ProfileFormData>;
  onSuccess?: (user: UserDTO) => void;
  onSkip?: () => void; // Optional for future enhancement
  className?: string;
}

export const ProfileCompletionForm: React.FC<ProfileCompletionFormProps> = ({
  accountId,
  initialData,
  onSuccess,
  onSkip,
  className,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<AppError | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnlineStatus, setIsOnlineStatus] = useState(isOnline());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Auto-save key for localStorage
  const autoSaveKey = `profile-completion-${accountId}`;

  // Load saved data from localStorage
  const savedData = loadFromLocalStorage<Partial<ProfileFormData>>(
    autoSaveKey,
    {} as Partial<ProfileFormData>
  );

  // Initialize form with react-hook-form
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      firstName: savedData?.firstName || initialData?.firstName || "",
      lastName: savedData?.lastName || initialData?.lastName || "",
      phoneNumber: savedData?.phoneNumber || initialData?.phoneNumber || "",
      dateOfBirth: savedData?.dateOfBirth || initialData?.dateOfBirth || "",
      address: savedData?.address || initialData?.address ? {
        street:
          savedData?.address?.street || initialData?.address?.street || "",
        city: savedData?.address?.city || initialData?.address?.city || "",
        district:
          savedData?.address?.district || initialData?.address?.district || "",
        postalCode:
          savedData?.address?.postalCode ||
          initialData?.address?.postalCode ||
          "",
        country:
          savedData?.address?.country ||
          initialData?.address?.country ||
          "Türkiye",
      } : undefined,
      profileImage: initialData?.profileImage || undefined, // Don't restore files from localStorage
    },
    mode: "onChange",
  });

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnlineStatus(true);
    const handleOffline = () => setIsOnlineStatus(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Auto-retry when coming back online
  useEffect(() => {
    if (isOnlineStatus && submitError?.type === ErrorType.NETWORK) {
      const cleanup = createOfflineHandler(() => {
        if (submitError?.isRetryable) {
          handleRetrySubmission();
        }
      });
      return cleanup;
    }
  }, [isOnlineStatus, submitError]);

  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    setError,
    clearErrors,
  } = form;

  const watchedProfileImage = watch("profileImage");
  const watchedFormData = watch();

  // Auto-save functionality
  useLocalStorageAutoSave(autoSaveKey, watchedFormData, {
    enabled: autoSaveEnabled && !isSubmitting,
    delay: 2000,
    onError: (error) => {
      console.warn("Auto-save failed:", error);
    },
  });

  // Update last auto-save timestamp
  useEffect(() => {
    if (autoSaveEnabled && !isSubmitting) {
      const timer = setTimeout(() => {
        setLastAutoSave(new Date());
      }, 2500); // Slightly after auto-save delay

      return () => clearTimeout(timer);
    }
  }, [watchedFormData, autoSaveEnabled, isSubmitting]);

  // Handle profile image change with validation
  const handleProfileImageChange = useCallback(
    (file: File | null) => {
      if (file) {
        const validationError =
          profileCompletionService.getProfileImageValidationError(file);
        if (validationError) {
          setError("profileImage", { message: validationError });
          setFieldErrors((prev) => ({
            ...prev,
            profileImage: validationError,
          }));
          return;
        }
        clearErrors("profileImage");
        setFieldErrors((prev) => {
          const { profileImage, ...rest } = prev;
          return rest;
        });
      }
      setValue("profileImage", file || undefined);
    },
    [setValue, setError, clearErrors]
  );

  // Clear field-specific errors when user starts typing
  const clearFieldError = useCallback(
    (fieldName: string) => {
      setFieldErrors((prev) => {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      });
      clearErrors(fieldName as keyof ProfileFormData);
    },
    [clearErrors]
  );

  // Handle API validation errors
  const handleApiValidationErrors = useCallback(
    (apiErrors: Record<string, string>) => {
      const newFieldErrors: Record<string, string> = {};

      Object.entries(apiErrors).forEach(([field, message]) => {
        if (
          field === "firstName" ||
          field === "lastName" ||
          field === "phoneNumber" ||
          field === "dateOfBirth"
        ) {
          setError(field as keyof ProfileFormData, { message });
          newFieldErrors[field] = message;
        } else if (field.startsWith("address.")) {
          const addressField = field.replace("address.", "");
          const addressFieldPath = `address.${addressField}` as any;
          setError(addressFieldPath, { message });
          newFieldErrors[field] = message;
        } else if (field === "profileImage" || field === "profileImageFile") {
          setError("profileImage", { message });
          newFieldErrors["profileImage"] = message;
        }
      });

      setFieldErrors((prev) => ({ ...prev, ...newFieldErrors }));
    },
    [setError]
  );

  // Handle form submission with comprehensive error handling
  const onSubmit = async (data: ProfileFormData) => {
    // Check online status before submitting
    if (!isOnlineStatus) {
      const networkError = new Error(
        "İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin."
      ) as AppError;
      networkError.type = ErrorType.NETWORK;
      networkError.isRetryable = true;
      setSubmitError(networkError);
      showErrorToast(networkError, {
        title: "Bağlantı Hatası",
        showRetry: true,
        onRetry: () => handleRetrySubmission(),
        retryLabel: "Tekrar Dene",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      // Use retry operation for network resilience
      const user = await retryOperation(
        () => profileCompletionService.createUserProfile(data, accountId),
        3, // max retries
        1000, // base delay
        (attempt, error) => {
          console.log(`Profile creation attempt ${attempt} failed:`, error);
          setRetryCount(attempt);

          // Show retry notification
          toast({
            title: "Yeniden Deneniyor...",
            description: `Deneme ${attempt}/3 - Lütfen bekleyin...`,
            duration: 2000,
          });
        }
      );

      setSubmitSuccess(true);
      setRetryCount(0);

      // Show success toast with enhanced messaging
      showSuccessToast(
        "Profiliniz başarıyla oluşturuldu. Ana sayfaya yönlendiriliyorsunuz...",
        "Profil Tamamlandı!"
      );

      // Clear auto-saved data on successful submission
      clearLocalStorage(autoSaveKey);

      // Call success callback after a brief delay to show success state
      setTimeout(() => {
        onSuccess?.(user);
      }, 1500);
    } catch (error: any) {
      console.error("Profile completion error:", error);

      // Parse error using centralized error handling
      const appError = parseApiError(error);
      setSubmitError(appError);
      setRetryCount(0);

      // Handle validation errors from API
      if (error?.response?.data?.errors) {
        handleApiValidationErrors(error.response.data.errors);
      }

      // Show appropriate error toast based on error type
      const showRetryOption =
        appError.isRetryable && appError.type !== ErrorType.VALIDATION;

      showErrorToast(appError, {
        title: getErrorTitle(appError.type),
        showRetry: showRetryOption,
        onRetry: showRetryOption ? () => handleRetrySubmission() : undefined,
        retryLabel: "Tekrar Dene",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get appropriate error title based on error type
  const getErrorTitle = (errorType: ErrorType): string => {
    switch (errorType) {
      case ErrorType.NETWORK:
        return "Bağlantı Hatası";
      case ErrorType.VALIDATION:
        return "Doğrulama Hatası";
      case ErrorType.AUTHENTICATION:
        return "Kimlik Doğrulama Hatası";
      case ErrorType.AUTHORIZATION:
        return "Yetki Hatası";
      case ErrorType.SERVER:
        return "Sunucu Hatası";
      default:
        return "Hata";
    }
  };

  // Handle retry submission
  const handleRetrySubmission = useCallback(() => {
    setSubmitError(null);
    setFieldErrors({});
    setRetryCount(0);
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  // Handle manual retry button click
  const handleManualRetry = useCallback(() => {
    if (!isOnlineStatus) {
      toast({
        title: "Bağlantı Hatası",
        description: "İnternet bağlantınızı kontrol edin ve tekrar deneyin.",
        variant: "destructive",
      });
      return;
    }
    handleRetrySubmission();
  }, [isOnlineStatus, handleRetrySubmission]);

  if (submitSuccess) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-600">
                Profil Başarıyla Tamamlandı!
              </h2>
              <p className="text-muted-foreground">
                Profiliniz oluşturuldu ve ana sayfaya yönlendiriliyorsunuz...
              </p>
            </div>
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress (only required fields)
  const totalRequiredFields = 3; // firstName, lastName, phoneNumber
  const completedRequiredFields = [
    watchedFormData.firstName,
    watchedFormData.lastName,
    watchedFormData.phoneNumber,
  ].filter((field) => field && field.toString().trim() !== "").length;

  const overallProgress = Math.round((completedRequiredFields / totalRequiredFields) * 100);

  return (
    <div
      className={cn("w-full max-w-4xl mx-auto space-y-6", className)}
      role="main"
      aria-labelledby="form-title"
    >
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle
                id="form-title"
                className="flex items-center gap-2 text-2xl"
              >
                <User className="w-6 h-6 text-primary" aria-hidden="true" />
                Profil Tamamlama
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Hesabınızı tamamlamak için aşağıdaki bilgileri doldurun. Bu
                bilgiler profilinizde görüntülenecek ve güvenli bir şekilde
                saklanacaktır.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-sm text-muted-foreground">
                Genel İlerleme: %{overallProgress}
              </div>
              <div
                className="w-32 bg-muted rounded-full h-2"
                role="progressbar"
                aria-valuenow={overallProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Form %${overallProgress} tamamlandı`}
              >
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Auto-save status */}
          {autoSaveEnabled && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4 p-2 bg-muted/50 rounded">
              <Save className="w-3 h-3" aria-hidden="true" />
              <span>
                Otomatik kaydetme aktif
                {lastAutoSave && (
                  <span className="ml-2">
                    • Son kayıt:{" "}
                    {lastAutoSave.toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto h-auto p-1 text-xs"
                onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                aria-label={
                  autoSaveEnabled
                    ? "Otomatik kaydetmeyi kapat"
                    : "Otomatik kaydetmeyi aç"
                }
              >
                {autoSaveEnabled ? "Kapat" : "Aç"}
              </Button>
            </div>
          )}
        </CardHeader>
      </Card>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
        role="form"
        aria-labelledby="form-title"
      >
        {/* Personal Information Section */}
        <PersonalInfoSection
          form={form}
          disabled={isSubmitting}
          stepNumber={1}
          totalSteps={3}
        />

        {/* Address Section */}
        <AddressSection
          form={form}
          disabled={isSubmitting}
          stepNumber={2}
          totalSteps={3}
        />

        {/* Profile Image Upload */}
        <Card role="region" aria-labelledby="image-section-title">
          <CardContent className="p-6">
            <ProfileImageUpload
              value={watchedProfileImage || null}
              onChange={handleProfileImageChange}
              error={errors.profileImage?.message}
              disabled={isSubmitting}
              stepNumber={3}
              totalSteps={3}
            />
          </CardContent>
        </Card>

        {/* Comprehensive Error Display */}
        {submitError && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <Alert variant="destructive">
                <div className="flex items-start gap-3">
                  {submitError.type === ErrorType.NETWORK ? (
                    <WifiOff className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-destructive">
                        {getErrorTitle(submitError.type)}
                      </h4>
                      <p className="text-sm text-destructive/90 mt-1">
                        {submitError.userMessage || submitError.message}
                      </p>
                    </div>

                    {/* Network Status Indicator */}
                    {submitError.type === ErrorType.NETWORK && (
                      <div className="flex items-center gap-2 text-sm">
                        {isOnlineStatus ? (
                          <>
                            <Wifi className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">
                              Bağlantı Yeniden Kuruldu
                            </span>
                          </>
                        ) : (
                          <>
                            <WifiOff className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">
                              Bağlantı Yok
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Field-specific errors summary */}
                    {Object.keys(fieldErrors).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">
                          Aşağıdaki alanları kontrol edin:
                        </p>
                        <ul className="text-sm text-destructive/90 list-disc list-inside space-y-1">
                          {Object.entries(fieldErrors).map(
                            ([field, message]) => (
                              <li key={field}>
                                <span className="font-medium">
                                  {getFieldDisplayName(field)}:
                                </span>{" "}
                                {message}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Retry Controls */}
                    {submitError.isRetryable && (
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleManualRetry}
                          disabled={isSubmitting || !isOnlineStatus}
                          className="flex-1 sm:flex-none"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          {isSubmitting ? "Deneniyor..." : "Tekrar Dene"}
                        </Button>

                        {retryCount > 0 && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            Deneme: {retryCount}/3
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recovery suggestions for non-retryable errors */}
                    {!submitError.isRetryable &&
                      submitError.type === ErrorType.VALIDATION && (
                        <div className="text-sm text-muted-foreground">
                          💡 Form alanlarını kontrol edin ve eksik bilgileri
                          tamamlayın.
                        </div>
                      )}
                  </div>
                </div>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {/* Skip Button (Optional) */}
              {onSkip && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onSkip}
                  disabled={isSubmitting}
                  className="order-2 sm:order-1"
                  aria-describedby="skip-help"
                >
                  Daha Sonra Tamamla
                </Button>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 order-1 sm:order-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1 sm:flex-none min-w-[200px]"
                  aria-describedby={
                    !isValid ? "form-validation-status" : undefined
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2
                        className="w-4 h-4 mr-2 animate-spin"
                        aria-hidden="true"
                      />
                      Profil Oluşturuluyor...
                    </>
                  ) : (
                    "Profili Tamamla"
                  )}
                </Button>
              </div>
            </div>

            {onSkip && (
              <div
                id="skip-help"
                className="text-xs text-muted-foreground mt-2"
              >
                Profil tamamlamayı atlarsanız, daha sonra hesap ayarlarından
                tamamlayabilirsiniz.
              </div>
            )}

            {/* Enhanced Form Status */}
            <div className="mt-4 space-y-2">
              {/* Online/Offline Status */}
              <div
                className="flex items-center gap-2 text-sm"
                role="status"
                aria-live="polite"
              >
                {isOnlineStatus ? (
                  <>
                    <Wifi
                      className="h-4 w-4 text-green-600"
                      aria-hidden="true"
                    />
                    <span className="text-green-600">Çevrimiçi</span>
                  </>
                ) : (
                  <>
                    <WifiOff
                      className="h-4 w-4 text-destructive"
                      aria-hidden="true"
                    />
                    <span className="text-destructive">
                      Çevrimdışı - İnternet bağlantınızı kontrol edin
                    </span>
                  </>
                )}
              </div>

              {/* Form Validation Status */}
              <div
                id="form-validation-status"
                className="text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {!isValid && Object.keys(errors).length > 0 && (
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    <span>
                      Lütfen tüm zorunlu alanları doğru şekilde doldurun. (
                      {Object.keys(errors).length} alan eksik/hatalı)
                    </span>
                  </div>
                )}
                {isValid && !isSubmitting && isOnlineStatus && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    <span>
                      Form hazır! Profili tamamlamak için butona tıklayın.
                    </span>
                  </div>
                )}
                {isSubmitting && retryCount > 0 && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    <span>Yeniden deneniyor... ({retryCount}/3)</span>
                  </div>
                )}
              </div>

              {/* Auto-save indicator */}
              {autoSaveEnabled && lastAutoSave && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  role="status"
                >
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  <span>
                    Verileriniz otomatik olarak kaydedildi (
                    {lastAutoSave.toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    )
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

// Helper function to get user-friendly field names
const getFieldDisplayName = (fieldName: string): string => {
  const fieldNames: Record<string, string> = {
    firstName: "Ad",
    lastName: "Soyad",
    phoneNumber: "Telefon Numarası",
    dateOfBirth: "Doğum Tarihi",
    "address.street": "Sokak Adresi",
    "address.city": "Şehir",
    "address.district": "İlçe",
    "address.postalCode": "Posta Kodu",
    "address.country": "Ülke",
    profileImage: "Profil Fotoğrafı",
    profileImageFile: "Profil Fotoğrafı",
  };

  return fieldNames[fieldName] || fieldName;
};
