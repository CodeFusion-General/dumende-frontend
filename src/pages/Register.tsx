import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const Register = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        passwordMatch: "Şifreler eşleşmiyor"
      }
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
        passwordMatch: "Passwords do not match"
      }
    }
  };

  const t = translations[language];

  const formSchema = z.object({
    firstName: z.string().min(1, { message: t.validation.required }),
    lastName: z.string().min(1, { message: t.validation.required }),
    username: z.string().min(1, { message: t.validation.required }),
    email: z.string().email({ message: t.validation.email }),
    password: z.string().min(6, { message: t.validation.password }),
    confirmPassword: z.string()
  }).refine((data) => data.password === data.confirmPassword, {
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
      confirmPassword: ""
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    /* Backend hazır olduğunda kullanılacak kod:
    try {
      const registerData = {
        email: values.email,
        password: values.password,
        name: `${values.firstName} ${values.lastName}`,
        username: values.username
      };
      const response = await authService.register(registerData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Hata mesajını kullanıcıya göster
    }
    */
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
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-4">
                <Button type="submit" size="lg">
                  {t.register}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate(-1)}
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
