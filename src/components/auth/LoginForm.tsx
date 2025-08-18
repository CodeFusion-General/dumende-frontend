import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { LoginRequest } from "@/types/auth.types";

const createLoginSchema = (t: any) =>
  z.object({
    emailOrUsername: z
      .string()
      .min(1, t.auth.login.errors.emailOrUsernameRequired),
    password: z.string().min(6, t.auth.login.errors.passwordMinLength),
    rememberMe: z.boolean().optional(),
  });

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const loginSchema = createLoginSchema(t);
  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);

      const loginData: LoginRequest = {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      };

      await login(loginData);
      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t.auth.login.errors.loginFailed
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-3 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Hesabınıza giriş yapın
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="emailOrUsername"
            className="text-sm font-medium text-gray-700"
          >
            E-posta veya Kullanıcı Adı
          </Label>
          <Input
            id="emailOrUsername"
            type="text"
            placeholder="E-posta adresiniz veya kullanıcı adınız"
            disabled={isSubmitting || isLoading}
            className="h-12 px-4 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
            {...register("emailOrUsername")}
          />
          {errors.emailOrUsername && (
            <p className="text-sm text-red-500 mt-1">
              {errors.emailOrUsername.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            Şifre
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Şifreniz"
              disabled={isSubmitting || isLoading}
              className="h-12 px-4 pr-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
              {...register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="rememberMe"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              {...register("rememberMe")}
            />
            <Label htmlFor="rememberMe" className="text-sm text-gray-600">
              Beni hatırla
            </Label>
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-sm text-primary hover:text-primary/80"
          >
            Şifremi unuttum
          </Button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Giriş yapılıyor...
            </>
          ) : (
            "Giriş Yap"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-gray-600">Henüz hesabınız yok mu? </span>
        <Button
          variant="link"
          className="p-0 h-auto font-semibold text-primary hover:text-primary/80"
          onClick={onSwitchToRegister}
        >
          Hesap Oluştur
        </Button>
      </div>
    </div>
  );
};
