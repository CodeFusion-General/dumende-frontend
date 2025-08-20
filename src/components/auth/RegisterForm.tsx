import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterRequest, UserType } from "@/types/auth.types";
import {
  CONTRACT_VERSION,
  CONTRACT_APPROVAL_TEXT,
} from "@/utils/contractTexts";
import { ContractModal } from "@/components/ui/contract-modal";

const registerSchema = z
  .object({
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    username: z
      .string()
      .min(3, "Kullanıcı adı en az 3 karakter olmalıdır")
      .max(50, "Kullanıcı adı en fazla 50 karakter olabilir"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
    confirmPassword: z
      .string()
      .min(6, "Şifre tekrarı en az 6 karakter olmalıdır"),
    fullName: z
      .string()
      .min(3, "Ad soyad en az 3 karakter olmalıdır")
      .max(100, "Ad soyad en fazla 100 karakter olabilir"),
    phoneNumber: z.string().min(10, "Geçerli bir telefon numarası giriniz"),
    contractApproved: z.boolean().refine((value) => value === true, {
      message: "Hizmet sözleşmesini kabul etmelisiniz",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onProfileCompletionRedirect?: (accountId: number) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  onProfileCompletionRedirect,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
      contractApproved: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setError(null);

      // Otomatik olarak CUSTOMER olarak kayıt ol
      const registerData: RegisterRequest = {
        email: data.email,
        username: data.username,
        password: data.password,
        userType: UserType.CUSTOMER, // Otomatik olarak CUSTOMER
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        contractApproved: data.contractApproved,
        contractVersion: CONTRACT_VERSION,
      };

      const response = await registerUser(registerData);

      // Check if accountId is available for profile completion redirect
      if (response.accountId) {
        if (onProfileCompletionRedirect) {
          onProfileCompletionRedirect(response.accountId);
        } else {
          // Fallback to direct navigation if no callback provided
          navigate(`/profile-completion/${response.accountId}`);
        }
      } else {
        // Fallback to original success handler if no accountId
        onSuccess?.();
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle specific validation errors
      if (err.response?.status === 400) {
        const errorData = err.response?.data;

        // Check for specific field errors
        if (errorData?.message) {
          if (
            errorData.message.includes("email") ||
            errorData.message.includes("e-posta")
          ) {
            setError(
              "Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta deneyin."
            );
          } else if (
            errorData.message.includes("username") ||
            errorData.message.includes("kullanıcı")
          ) {
            setError(
              "Bu kullanıcı adı zaten alınmış. Lütfen farklı bir kullanıcı adı deneyin."
            );
          } else if (
            errorData.message.includes("phone") ||
            errorData.message.includes("telefon")
          ) {
            setError(
              "Bu telefon numarası zaten kayıtlı. Lütfen farklı bir numara deneyin."
            );
          } else {
            setError(errorData.message);
          }
        } else if (errorData?.errors) {
          // Handle field-specific errors if backend returns them
          const fieldErrors = Object.values(errorData.errors).join(", ");
          setError(fieldErrors);
        } else {
          setError(
            "Girdiğiniz bilgiler geçersiz. Lütfen kontrol edip tekrar deneyin."
          );
        }
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin."
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Hesap Oluştur</h1>
        <p className="text-sm text-muted-foreground">
          Yeni hesabınızı oluşturun
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Ad Soyad */}
        <div className="space-y-2">
          <Label htmlFor="fullName">Ad Soyad</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Adınız ve soyadınız"
            disabled={isSubmitting || isLoading}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-destructive">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* E-posta */}
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            placeholder="E-posta adresiniz"
            disabled={isSubmitting || isLoading}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Kullanıcı Adı */}
        <div className="space-y-2">
          <Label htmlFor="username">Kullanıcı Adı</Label>
          <Input
            id="username"
            type="text"
            placeholder="Kullanıcı adınız"
            disabled={isSubmitting || isLoading}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Telefon Numarası */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefon Numarası</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="Telefon numaranız"
            disabled={isSubmitting || isLoading}
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-sm text-destructive">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Şifre */}
        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Şifreniz"
              disabled={isSubmitting || isLoading}
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Şifre Tekrarı */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Şifre Tekrarı</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Şifrenizi tekrar giriniz"
              disabled={isSubmitting || isLoading}
              {...register("confirmPassword")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Hizmet Sözleşmesi */}
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <input
              id="contractApproved"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 mt-1 accent-blue-600"
              {...register("contractApproved")}
            />
            <div className="flex-1">
              <Label
                htmlFor="contractApproved"
                className="text-sm leading-relaxed cursor-pointer"
              >
                {CONTRACT_APPROVAL_TEXT}
              </Label>
              <div className="mt-2">
                <ContractModal>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                  >
                    📄 Sözleşmeyi Görüntüle
                  </Button>
                </ContractModal>
              </div>
            </div>
          </div>
          {errors.contractApproved && (
            <p className="text-sm text-destructive">
              {errors.contractApproved.message}
            </p>
          )}
        </div>

        {/* Bilgilendirme */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Bilgi:</strong> Hesabınız müşteri olarak oluşturulacaktır.
            Kayıt işlemi tamamlandıktan sonra profil bilgilerinizi tamamlamanız
            için yönlendirileceksiniz. Tekne sahibi olmak için başvurunuzu
            tamamladıktan sonra destek ekibimizle iletişime geçebilirsiniz.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Hesap oluşturuluyor...
            </>
          ) : (
            "Hesap Oluştur"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Zaten hesabınız var mı? </span>
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={onSwitchToLogin}
        >
          Giriş Yap
        </Button>
      </div>
    </div>
  );
};
