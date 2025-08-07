import React, { useMemo, useState } from "react";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { accountService } from "@/services/accountService";
import { emailVerificationService } from "@/services/emailVerificationService";
import { passwordResetService } from "@/services/passwordResetService";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  // Change password local state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Email verification state
  const [verificationCode, setVerificationCode] = useState("");
  const userEmail = user?.email || "";

  const isEmailVerified = useMemo(() => {
    // Kurumsal yapıda bu bilgi backend'den gelmelidir; hazır değilse UI akışı ile yönetiyoruz
    // Burada sadece örnek amaçlı false varsayıyoruz. Gerçek değer accountService/getCurrentAccount ile alınabilir.
    return false;
  }, []);

  const handleChangePassword = async () => {
    if (!user?.id) {
      toast({ title: "Hata", description: "Oturum bulunamadı.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      await accountService.updatePassword(user.id, {
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast({ title: "Başarılı", description: "Şifreniz güncellendi." });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "Şifre güncellenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationCode = async () => {
    try {
      setLoading(true);
      const res = await emailVerificationService.sendCode({ email: userEmail });
      toast({ title: res.success ? "Kod gönderildi" : "Hata", description: res.message, variant: res.success ? "default" : "destructive" });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "Kod gönderilemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setLoading(true);
      const res = await emailVerificationService.verify({ email: userEmail, verificationCode });
      toast({ title: res.success ? "E-posta doğrulandı" : "Hata", description: res.message, variant: res.success ? "default" : "destructive" });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "E-posta doğrulanamadı.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setLoading(true);
      const res = await passwordResetService.forgotPassword({ email: userEmail });
      toast({ title: res.success ? "Mail gönderildi" : "Hata", description: res.message, variant: res.success ? "default" : "destructive" });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "İşlem gerçekleştirilemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordWithToken = async () => {
    if (!verificationCode || !newPassword || !confirmNewPassword) {
      toast({ title: "Hata", description: "Kod ve şifre alanlarını doldurun.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor.", variant: "destructive" });
      return;
    }
    try {
      setLoading(true);
      const res = await passwordResetService.resetPassword({
        email: userEmail,
        resetToken: verificationCode,
        newPassword,
        confirmPassword: confirmNewPassword,
      });
      toast({ title: res.success ? "Şifre güncellendi" : "Hata", description: res.message, variant: res.success ? "default" : "destructive" });
    } catch (error: any) {
      toast({ title: "Hata", description: error?.message || "Şifre güncellenemedi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Güvenlik</h1>
            <p className="text-muted-foreground">Şifre ve e-posta güvenliğinizi yönetin.</p>
          </div>
          <Dialog open={resetOpen} onOpenChange={setResetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Şifremi Unuttum</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Şifre Sıfırlama</DialogTitle>
                <DialogDescription>
                  Hesap e-postanıza sıfırlama kodu gönderin ve gelen kod ile yeni şifre belirleyin.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">E-posta: <span className="font-medium">{userEmail}</span></p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" disabled={loading} onClick={handleForgotPassword}>Sıfırlama Maili Gönder</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="resetCode">Sıfırlama Kodu</Label>
                    <Input id="resetCode" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} placeholder="6 haneli kod" />
                  </div>
                  <div>
                    <Label htmlFor="newPwd">Yeni Şifre</Label>
                    <Input id="newPwd" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="newPwd2">Yeni Şifre (Tekrar)</Label>
                    <Input id="newPwd2" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setResetOpen(false)}>Vazgeç</Button>
                  <Button disabled={loading} onClick={handleResetPasswordWithToken}>Kodu Kullanarak Sıfırla</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Şifreyi Değiştir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmNewPassword">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button disabled={loading} onClick={handleChangePassword} className="bg-[#2ecc71] hover:bg-[#27ae60]">
                {loading ? "İşleniyor..." : "Şifreyi Güncelle"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>E-Posta Doğrulama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hesap e-postanız: <span className="font-medium">{userEmail}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={loading} onClick={handleSendVerificationCode}>Doğrulama Kodu Gönder</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="verificationCode">Doğrulama Kodu</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="6 haneli kod"
                />
              </div>
              <div className="flex items-end">
                <Button disabled={loading} onClick={handleVerifyEmail}>E-postayı Doğrula</Button>
              </div>
            </div>
            {!isEmailVerified && (
              <p className="text-xs text-amber-600">E-posta doğrulanmamış görünüyor. Doğrulama tamamlanana kadar bazı işlemler kısıtlanabilir.</p>
            )}
          </CardContent>
        </Card>

        {/* Alt bölümdeki token ile sıfırlama kartı kaldırıldı; süreç yukarıdaki popup'ta yönetilir */}
      </div>
    </CaptainLayout>
  );
};

export default SecurityPage;


