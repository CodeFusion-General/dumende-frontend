import React, { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { AdminUserView, AdminUserUpdateCommand } from "@/types/adminUser";
import { UserType } from "@/types/auth.types";
import { adminUserService } from "@/services/adminPanel/adminUserService";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserEditFormProps {
  user: AdminUserView;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: (updatedUser: AdminUserView) => void;
}

interface FormData {
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  role: UserType;
  status: "active" | "suspended" | "banned";
  verificationStatus: "verified" | "pending" | "rejected";
  adminNote: string;
}

interface PasswordResetData {
  newPassword: string;
  confirmPassword: string;
  sendEmail: boolean;
}

export const UserEditForm: React.FC<UserEditFormProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdate,
}) => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [formData, setFormData] = useState<FormData>({
    fullName: user.fullName,
    email: user.email,
    username: user.username,
    phoneNumber: user.phoneNumber,
    role: user.role,
    status: user.status,
    verificationStatus: user.verificationStatus,
    adminNote: "",
  });

  const [passwordData, setPasswordData] = useState<PasswordResetData>({
    newPassword: "",
    confirmPassword: "",
    sendEmail: true,
  });

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status: user.status,
        verificationStatus: user.verificationStatus,
        adminNote: "",
      });
      setPasswordData({
        newPassword: "",
        confirmPassword: "",
        sendEmail: true,
      });
      setErrors({});
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Profile validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Ad soyad gereklidir";
    } else if (formData.fullName.length < 3) {
      newErrors.fullName = "Ad soyad en az 3 karakter olmalıdır";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-posta gereklidir";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi giriniz";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Kullanıcı adı gereklidir";
    } else if (formData.username.length < 3) {
      newErrors.username = "Kullanıcı adı en az 3 karakter olmalıdır";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Telefon numarası gereklidir";
    } else if (
      !/^(\+90|0)?[5][0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, ""))
    ) {
      newErrors.phoneNumber = "Geçerli bir Türkiye telefon numarası giriniz";
    }

    // Password validation (if password tab is active and password is provided)
    if (activeTab === "password" && passwordData.newPassword) {
      if (passwordData.newPassword.length < 8) {
        newErrors.newPassword = "Şifre en az 8 karakter olmalıdır";
      } else if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)
      ) {
        newErrors.newPassword =
          "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir";
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = "Şifreler eşleşmiyor";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePasswordChange = (
    field: keyof PasswordResetData,
    value: string | boolean
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Update user profile
      const updateCommand: AdminUserUpdateCommand = {
        id: user.id,
        fullName: formData.fullName,
        email: formData.email,
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        role: isSuperAdmin ? formData.role : undefined, // Only SUPER_ADMIN can change roles
        status: formData.status,
        verificationStatus: formData.verificationStatus,
        adminNote: formData.adminNote || undefined,
      };

      const updatedUser = await adminUserService.updateUser(updateCommand);

      // Handle password reset if provided
      if (activeTab === "password" && passwordData.newPassword) {
        await adminUserService.resetUserPassword({
          userId: user.id,
          newPassword: passwordData.newPassword,
          sendEmail: passwordData.sendEmail,
          adminNote: `Şifre admin tarafından sıfırlandı: ${formData.adminNote}`,
        });
      }

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      setErrors({ submit: "Kullanıcı güncellenirken bir hata oluştu" });
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordData((prev) => ({
      ...prev,
      newPassword: password,
      confirmPassword: password,
    }));
  };

  const tabs = [
    { id: "profile", label: "Profil Bilgileri", icon: User },
    { id: "password", label: "Şifre Sıfırlama", icon: Key },
  ];

  return (
    <AdminModal
      title={`${user.fullName} - Kullanıcı Düzenle`}
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Ad soyad giriniz"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon Numarası *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleInputChange("phoneNumber", e.target.value)
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phoneNumber
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="0555 123 45 67"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kullanıcı Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.username ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="kullaniciadi"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                </div>
              </div>

              {/* Role and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol{" "}
                    {!isSuperAdmin && (
                      <span className="text-xs text-gray-500">
                        (Sadece görüntüleme)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value as UserType)
                      }
                      disabled={!isSuperAdmin}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isSuperAdmin
                          ? "bg-gray-100 cursor-not-allowed"
                          : "border-gray-300"
                      }`}
                    >
                      <option value={UserType.CUSTOMER}>Müşteri</option>
                      <option value={UserType.BOAT_OWNER}>Tekne Sahibi</option>
                      <option value={UserType.ADMIN}>Admin</option>
                    </select>
                  </div>
                  {!isSuperAdmin && (
                    <p className="mt-1 text-xs text-gray-500">
                      Rol değiştirmek için SUPER_ADMIN yetkisi gereklidir
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hesap Durumu
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value as any)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="suspended">Askıya Alınmış</option>
                    <option value="banned">Yasaklı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğrulama Durumu
                  </label>
                  <select
                    value={formData.verificationStatus}
                    onChange={(e) =>
                      handleInputChange(
                        "verificationStatus",
                        e.target.value as any
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="verified">Doğrulanmış</option>
                    <option value="pending">Beklemede</option>
                    <option value="rejected">Reddedilmiş</option>
                  </select>
                </div>
              </div>

              {/* Admin Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notu
                </label>
                <textarea
                  value={formData.adminNote}
                  onChange={(e) =>
                    handleInputChange("adminNote", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bu değişiklik hakkında not ekleyebilirsiniz..."
                />
              </div>
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Şifre Sıfırlama Uyarısı
                    </h3>
                    <p className="mt-2 text-sm text-yellow-700">
                      Kullanıcının şifresini sıfırladığınızda, mevcut oturumları
                      sonlanacak ve yeni şifre ile giriş yapması gerekecektir.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange("newPassword", e.target.value)
                      }
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.newPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Yeni şifre giriniz"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre Tekrarı
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange("confirmPassword", e.target.value)
                      }
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Şifreyi tekrar giriniz"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Rastgele Şifre Oluştur
                </button>

                <div className="flex items-center">
                  <input
                    id="sendEmail"
                    type="checkbox"
                    checked={passwordData.sendEmail}
                    onChange={(e) =>
                      handlePasswordChange("sendEmail", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="sendEmail"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Kullanıcıya e-posta gönder
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Şifre Gereksinimleri
                    </h3>
                    <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                      <li>En az 8 karakter uzunluğunda</li>
                      <li>En az bir büyük harf (A-Z)</li>
                      <li>En az bir küçük harf (a-z)</li>
                      <li>En az bir rakam (0-9)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </AdminModal>
  );
};
