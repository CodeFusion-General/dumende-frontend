import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { translations } from "@/locales/translations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Home, ArrowLeft } from "lucide-react";

/**
 * Unauthorized - Yetkisiz erişim sayfası
 *
 * Admin paneline erişim yetkisi olmayan kullanıcılar için gösterilen sayfa
 */
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const t = translations[language];

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    navigate("/?auth=true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t.errors.unauthorized}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isAuthenticated && user ? (
              // Giriş yapmış ama yetkisi olmayan kullanıcı
              <>
                Bu sayfaya erişim yetkiniz bulunmamaktadır.
                {user.role === "CUSTOMER" && (
                  <span className="block mt-2 text-sm">
                    Admin paneline sadece yöneticiler erişebilir.
                  </span>
                )}
                {user.role === "BOAT_OWNER" && (
                  <span className="block mt-2 text-sm">
                    Admin paneline sadece yöneticiler erişebilir. Kaptan paneli
                    için{" "}
                    <button
                      onClick={() => navigate("/captain")}
                      className="text-blue-600 hover:underline"
                    >
                      buraya tıklayın
                    </button>
                    .
                  </span>
                )}
              </>
            ) : (
              // Giriş yapmamış kullanıcı
              "Bu sayfaya erişmek için giriş yapmanız ve gerekli yetkilere sahip olmanız gerekmektedir."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isAuthenticated ? (
            // Giriş yapmamış kullanıcı için login butonu
            <Button onClick={handleLogin} className="w-full" variant="default">
              <Shield className="w-4 h-4 mr-2" />
              Giriş Yap
            </Button>
          ) : (
            // Giriş yapmış ama yetkisi olmayan kullanıcı için ana sayfa butonu
            <Button onClick={handleGoHome} className="w-full" variant="default">
              <Home className="w-4 h-4 mr-2" />
              {t.nav.home}
            </Button>
          )}

          <Button onClick={handleGoBack} variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unauthorized;
