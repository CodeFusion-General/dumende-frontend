import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserType } from "@/types/auth.types";
import { toast } from "@/components/ui/use-toast";
import { USER_SERVICE_CONTRACT, CONTRACT_APPROVAL_TEXT, CONTRACT_VERSION } from "@/utils/contractTexts";

const Register = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const {
    register: registerUser,
    getProfileCompletionRedirectPath,
    updateUserData,
  } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    tr: {
      title: "Kayıt Ol",
      firstName: "Ad",
      lastName: "Soyad",
      username: "Kullanıcı Adı",
      email: "E-posta",
      password: "Şifre",
      confirmPassword: "Şifre (Tekrar)",
      register: "Kayıt Ol",
      backToLogin: "Giriş sayfasına dön",
      validation: {
        required: "Bu alan zorunludur",
        email: "Geçerli bir e-posta adresi giriniz",
        password: "Şifre en az 6 karakter olmalıdır",
        passwordMatch: "Şifreler eşleşmiyor",
      },
    },
    en: {
      title: "Register",
      firstName: "First Name",
      lastName: "Last Name",
      username: "Username",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      register: "Register",
      backToLogin: "Back to login",
      validation: {
        required: "This field is required",
        email: "Please enter a valid email",
        password: "Password must be at least 6 characters",
        passwordMatch: "Passwords do not match",
      },
    },
  };

  const t = translations[language];

  const formSchema = z
    .object({
      firstName: z.string().min(1, { message: t.validation.required }),
      lastName: z.string().min(1, { message: t.validation.required }),
      username: z.string().min(1, { message: t.validation.required }),
      email: z.string().email({ message: t.validation.email }),
      password: z.string().min(6, { message: t.validation.password }),
      confirmPassword: z.string(),
      contractApproved: z.boolean().refine((val) => val === true, {
        message: language === "tr" ? "Hizmet sözleşmesini kabul etmelisiniz" : "You must accept the service contract"
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validation.passwordMatch,
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      contractApproved: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      const registerData = {
        email: values.email,
        password: values.password,
        fullName: `${values.firstName} ${values.lastName}`,
        username: values.username,
        userType: UserType.CUSTOMER,
        phoneNumber: "", // Will be collected in profile completion
        contractApproved: values.contractApproved,
        contractVersion: CONTRACT_VERSION,
      };

      const response = await registerUser(registerData);

      // Show success message
      toast({
        title: language === "tr" ? "Kayıt Başarılı" : "Registration Successful",
        description:
          language === "tr"
            ? "Hesabınız oluşturuldu. Şimdi profilinizi tamamlayın."
            : "Your account has been created. Please complete your profile.",
      });

      // Account oluşturulduktan sonra profile completion'a yönlendir
      const targetId = response?.accountId ?? response?.userId;
      if (targetId) {
        // Auth state'e hesapId bilgisini işle (fallback olarak userId de olabilir)
        updateUserData({ accountId: targetId });
        navigate(`/profile-completion/${targetId}`);
      } else {
        // Yedek: Auth state üzerinden yönlendirme yolu hesapla
        const redirectPath = getProfileCompletionRedirectPath();
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          toast({
            title: language === "tr" ? "Yönlendirme Hatası" : "Redirect Error",
            description:
              language === "tr"
                ? "Hesap bilgileri alınamadı. Lütfen tekrar giriş yapın."
                : "Account info not available. Please log in again.",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Registration failed:", error);

      let errorMessage =
        language === "tr"
          ? "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin."
          : "An error occurred during registration. Please try again.";

      // Handle specific validation errors
      if (error.response?.status === 400) {
        const errorData = error.response?.data;

        if (errorData?.message) {
          if (
            errorData.message.includes("email") ||
            errorData.message.includes("e-posta")
          ) {
            errorMessage =
              language === "tr"
                ? "Bu e-posta adresi zaten kullanılıyor. Lütfen farklı bir e-posta deneyin."
                : "This email address is already in use. Please try a different email.";
          } else if (
            errorData.message.includes("username") ||
            errorData.message.includes("kullanıcı")
          ) {
            errorMessage =
              language === "tr"
                ? "Bu kullanıcı adı zaten alınmış. Lütfen farklı bir kullanıcı adı deneyin."
                : "This username is already taken. Please try a different username.";
          } else if (
            errorData.message.includes("phone") ||
            errorData.message.includes("telefon")
          ) {
            errorMessage =
              language === "tr"
                ? "Bu telefon numarası zaten kayıtlı. Lütfen farklı bir numara deneyin."
                : "This phone number is already registered. Please try a different number.";
          } else {
            errorMessage = errorData.message;
          }
        }
      }

      toast({
        title: language === "tr" ? "Kayıt Hatası" : "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t.title}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.firstName}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.lastName}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.username}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.email}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.password}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5"
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.confirmPassword}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-2.5"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kullanıcı Hizmet Sözleşmesi */}
              <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold">
                  {language === "tr" ? "Kullanıcı Hizmet Sözleşmesi" : "User Service Agreement"}
                </h3>
                
                <div className="max-h-48 overflow-y-auto border rounded p-3 bg-white text-sm">
                  <pre className="whitespace-pre-wrap font-sans">{USER_SERVICE_CONTRACT}</pre>
                </div>
                
                <FormField
                  control={form.control}
                  name="contractApproved"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-start gap-3">
                        <input
                          id="contractApproved"
                          type="checkbox"
                          className="mt-1"
                          disabled={isLoading}
                          checked={field.value}
                          onChange={field.onChange}
                        />
                        <FormLabel htmlFor="contractApproved" className="text-sm leading-relaxed cursor-pointer">
                          {CONTRACT_APPROVAL_TEXT}
                        </FormLabel>
                      </div>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        {language === "tr" ? "Sözleşme Versiyonu" : "Contract Version"}: {CONTRACT_VERSION} | 
                        {language === "tr" ? "Onay Tarihi" : "Approval Date"}: {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-4">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading
                    ? language === "tr"
                      ? "Kayıt Oluşturuluyor..."
                      : "Creating Account..."
                    : t.register}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                >
                  {t.backToLogin}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
