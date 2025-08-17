import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProfileCompletionForm } from "@/components/profile/ProfileCompletionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { UserDTO } from "@/types/contact.types";
import { userService } from "@/services/userService";
import { ProfileFormData } from "@/types/profile.types";
import { User, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ProfileCompletionPage: React.FC = () => {
  const navigate = useNavigate();
  const { accountId } = useParams<{ accountId: string }>();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, updateUserFromProfile } = useAuth();
  const { language } = useLanguage();

  const [isInitializing, setIsInitializing] = useState(true);
  const [initialFormData, setInitialFormData] = useState<Partial<ProfileFormData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Translations
  const translations = {
    tr: {
      title: "Profil Tamamlama",
      subtitle:
        "Hesabınızı tamamlamak için lütfen aşağıdaki bilgileri doldurun",
      description:
        "Bu bilgiler profilinizin tam olarak oluşturulması için gereklidir. Tüm alanları doldurduktan sonra sistemi kullanmaya başlayabilirsiniz.",
      backButton: "Geri Dön",
      successTitle: "Profil Başarıyla Tamamlandı!",
      successMessage:
        "Profiliniz başarıyla oluşturuldu. Ana sayfaya yönlendiriliyorsunuz...",
      errors: {
        notAuthenticated: "Bu sayfaya erişmek için giriş yapmalısınız.",
        invalidAccountId: "Geçersiz hesap kimliği.",
        accessDenied: "Bu hesaba erişim yetkiniz bulunmamaktadır.",
        generalError: "Bir hata oluştu. Lütfen tekrar deneyin.",
      },
    },
    en: {
      title: "Complete Your Profile",
      subtitle: "Please fill in the information below to complete your account",
      description:
        "This information is required to fully create your profile. After filling in all fields, you can start using the system.",
      backButton: "Go Back",
      successTitle: "Profile Successfully Completed!",
      successMessage:
        "Your profile has been successfully created. You are being redirected to the homepage...",
      errors: {
        notAuthenticated: "You must be logged in to access this page.",
        invalidAccountId: "Invalid account ID.",
        accessDenied: "You do not have permission to access this account.",
        generalError: "An error occurred. Please try again.",
      },
    },
  };

  const t = translations[language];

  // Initialize and validate access
  useEffect(() => {
    const initializePage = async () => {
      try {
        // Wait for auth to load
        if (authLoading) {
          return;
        }

        // Check authentication
        if (!isAuthenticated || !user) {
          setError(t.errors.notAuthenticated);
          setIsInitializing(false);
          return;
        }

        // Validate accountId parameter
        const accountIdFromParams = accountId || searchParams.get("accountId");
        if (!accountIdFromParams || isNaN(Number(accountIdFromParams))) {
          setError(t.errors.invalidAccountId);
          setIsInitializing(false);
          return;
        }

        // Check if user has access to this account
        // For now, we'll assume the user can only complete their own profile
        // This logic might need to be adjusted based on business requirements
        const numericAccountId = Number(accountIdFromParams);
        const targetId = user.accountId ?? user.id;
        const isOwner = targetId === numericAccountId;
        if (!isOwner) {
          setError(t.errors.accessDenied);
          setIsInitializing(false);
          return;
        }

        // All checks passed, now load existing user data for prefill
        setError(null);

        try {
          const userDto = await userService.getUserById(user.id);

          const fullName = userDto.fullName || "";
          const [fn, ...lnParts] = fullName.split(" ");
          const ln = lnParts.join(" ");

          // dateOfBirth may come as ISO or with time; normalize to YYYY-MM-DD
          const rawDob: any = (userDto as any).dateOfBirth;
          const dob = rawDob
            ? String(rawDob).slice(0, 10)
            : "";

          const addressSrc: any = (userDto as any).address || (userDto as any).addressDto || {};

          const prefill: Partial<ProfileFormData> = {
            firstName: (userDto as any).firstName || fn || "",
            lastName: (userDto as any).lastName || ln || "",
            phoneNumber: userDto.phoneNumber || "",
            dateOfBirth: dob,
            address: {
              street: addressSrc.street || "",
              city: addressSrc.city || "",
              district: addressSrc.district || "",
              postalCode: addressSrc.postalCode || "",
              country: addressSrc.country || "Türkiye",
            },
          };

          setInitialFormData(prefill);
        } catch (e) {
        } finally {
          setIsInitializing(false);
        }
      } catch (err) {
        console.error("Profile completion page initialization error:", err);
        setError(t.errors.generalError);
        setIsInitializing(false);
      }
    };

    initializePage();
  }, [accountId, searchParams, isAuthenticated, user, authLoading, t.errors]);

  // Handle successful profile completion with enhanced feedback
  const handleSuccess = (userData: UserDTO) => {
    // Auth state'i güncelle (profil tamamlandı)
    updateUserFromProfile(userData);
    // Show success toast with user's name if available
    const userName = userData.fullName;
    const successMessage = userName
      ? `Hoş geldin ${userName}! Profilin başarıyla oluşturuldu.`
      : t.successMessage;

    toast({
      title: t.successTitle,
      description: successMessage,
      duration: 4000,
    });

    // Store success state for potential recovery
    sessionStorage.setItem("profileCompletionSuccess", "true");
    sessionStorage.setItem("completedUserData", JSON.stringify(userData));

    // Redirect to main application after a short delay
    setTimeout(() => {
      navigate("/", { replace: true });
    }, 2000);
  };

  // Handle going back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Show loading state
  if (authLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-red-600">
              Erişim Hatası
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backButton}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accountIdNumber = Number(accountId || searchParams.get("accountId"));

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error("ProfileCompletionPage Error:", error, errorInfo);
        toast({
          title: "Hata",
          description: t.errors.generalError,
          variant: "destructive",
        });
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t.title}
                  </h1>
                  <p className="text-sm text-gray-600 mt-1">{t.subtitle}</p>
                </div>
              </div>
              <Button
                onClick={handleGoBack}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.backButton}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Description Card */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">{t.description}</p>
            </CardContent>
          </Card>

          {/* Profile Completion Form */}
          <ProfileCompletionForm
            accountId={accountIdNumber}
            onSuccess={handleSuccess}
            initialData={initialFormData ?? {
              firstName: user?.fullName?.split(" ")[0] || "",
              lastName: user?.fullName?.split(" ").slice(1).join(" ") || "",
              phoneNumber: user?.phoneNumber || "",
            }}
            className="mb-8"
          />

          {/* Mobile Back Button */}
          <div className="sm:hidden">
            <Button onClick={handleGoBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.backButton}
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProfileCompletionPage;
