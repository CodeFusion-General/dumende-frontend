
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn, UserPlus } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDialog = ({ isOpen, onClose }: AuthDialogProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const translations = {
    tr: {
      login: "Giriş Yap",
      register: "Kayıt Ol",
      email: "E-posta",
      password: "Şifre",
      noAccount: "Hesabınız yok mu? Kayıt olun",
    },
    en: {
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      noAccount: "Don't have an account? Register",
    }
  };

  const t = translations[language];

  const handleRegisterClick = () => {
    onClose();
    navigate('/register');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.login}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Input
            type="email"
            placeholder={t.email}
            className="w-full"
          />
          <Input
            type="password"
            placeholder={t.password}
            className="w-full"
          />
          <Button className="w-full" size="lg">
            <LogIn className="mr-2" size={18} />
            {t.login}
          </Button>
          <Button
            variant="link"
            className="mt-2"
            onClick={handleRegisterClick}
          >
            {t.noAccount}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
