import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleText =
    user.role === "ADMIN"
      ? "Yönetici"
      : user.role === "BOAT_OWNER"
      ? "Tekne Sahibi"
      : "Müşteri";

  const targetId = user.accountId ?? user.id;

  const initials = (user.fullName || user.username || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.fullName || user.username} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl">
                {user.fullName || user.username}
              </CardTitle>
              <div className="text-sm text-muted-foreground">{roleText}</div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-6 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Kullanıcı Adı</div>
                <div className="font-medium break-all">{user.username}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">E-posta</div>
                <div className="font-medium break-all">{user.email}</div>
              </div>
              {user.phoneNumber && (
                <div>
                  <div className="text-xs text-muted-foreground">Telefon</div>
                  <div className="font-medium">{user.phoneNumber}</div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                className="sm:w-auto"
                onClick={() => navigate(`/profile-completion/${targetId}`)}
              >
                Profili Düzenle
              </Button>
              <Button
                variant="outline"
                className="sm:w-auto"
                onClick={() => navigate("/my-bookings")}
              >
                Rezervasyonlarım
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProfile;


