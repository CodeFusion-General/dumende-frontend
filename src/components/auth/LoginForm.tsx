import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';
import { LoginRequest } from '@/types/auth.types';

const createLoginSchema = (t: any) => z.object({
  emailOrUsername: z.string().min(1, t.auth.login.errors.emailOrUsernameRequired),
  password: z.string().min(6, t.auth.login.errors.passwordMinLength),
  rememberMe: z.boolean().optional(),
});

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToRegister 
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
      emailOrUsername: '',
      password: '',
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
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t.auth.login.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t.auth.login.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="emailOrUsername">E-posta veya Kullanıcı Adı</Label>
          <Input
            id="emailOrUsername"
            type="text"
            placeholder="E-posta adresiniz veya kullanıcı adınız"
            disabled={isSubmitting || isLoading}
            {...register('emailOrUsername')}
          />
          {errors.emailOrUsername && (
            <p className="text-sm text-destructive">
              {errors.emailOrUsername.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifreniz"
              disabled={isSubmitting || isLoading}
              {...register('password')}
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

        <div className="flex items-center space-x-2">
          <input
            id="rememberMe"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300"
            {...register('rememberMe')}
          />
          <Label htmlFor="rememberMe" className="text-sm">
            Beni hatırla
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Giriş yapılıyor...
            </>
          ) : (
            'Giriş Yap'
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          Henüz hesabınız yok mu?{' '}
        </span>
        <Button
          variant="link"
          className="p-0 h-auto font-normal"
          onClick={onSwitchToRegister}
        >
          Hesap Oluştur
        </Button>
      </div>
    </div>
  );
}; 