import React, { useState, useEffect } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { AdminUserView, AdminNote } from "@/types/adminUser";
import { adminUserService } from "@/services/adminPanel/adminUserService";
import {
  Users,
  Phone,
  Mail,
  Calendar,
  Shield,
  TrendingUp,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Ban,
  UserCheck,
  UserX,
} from "lucide-react";

interface UserDetailModalProps {
  user: AdminUserView;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: (updatedUser: AdminUserView) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "notes">(
    "overview"
  );
  const [notes, setNotes] = useState<AdminNote[]>(user.notes || []);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState<
    "info" | "warning" | "important"
  >("info");
  const [loading, setLoading] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);

  // Load additional data when modal opens
  useEffect(() => {
    if (isOpen && user.id) {
      loadUserNotes();
      loadUserActivity();
    }
  }, [isOpen, user.id]);

  const loadUserNotes = async () => {
    try {
      const userNotes = await adminUserService.getUserNotes(user.id);
      setNotes(userNotes);
    } catch (error) {
      console.error("Error loading user notes:", error);
    }
  };

  const loadUserActivity = async () => {
    try {
      const activity = await adminUserService.getUserActivityLog(
        user.id,
        0,
        10
      );
      setActivityLog(activity.activities || []);
    } catch (error) {
      console.error("Error loading user activity:", error);
      // Mock data for development
      setActivityLog([
        {
          id: 1,
          action: "login",
          description: "Kullanıcı sisteme giriş yaptı",
          timestamp: new Date().toISOString(),
          ipAddress: "192.168.1.1",
        },
        {
          id: 2,
          action: "booking_created",
          description: "Yeni rezervasyon oluşturdu",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const note = await adminUserService.addUserNote(
        user.id,
        newNote,
        newNoteType
      );
      setNotes([...notes, note]);
      setNewNote("");
      setNewNoteType("info");
    } catch (error) {
      console.error("Error adding note:", error);
      // Mock note for development
      const mockNote: AdminNote = {
        id: Date.now(),
        adminId: 1,
        adminName: "Admin User",
        note: newNote,
        type: newNoteType,
        createdAt: new Date().toISOString(),
      };
      setNotes([...notes, mockNote]);
      setNewNote("");
      setNewNoteType("info");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const confirmed = window.confirm(
      "Bu notu silmek istediğinizden emin misiniz?"
    );
    if (!confirmed) return;

    try {
      await adminUserService.deleteUserNote(user.id, noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Error deleting note:", error);
      // Remove from local state anyway for development
      setNotes(notes.filter((note) => note.id !== noteId));
    }
  };

  const handleStatusChange = async (action: "suspend" | "activate" | "ban") => {
    const actionText = {
      suspend: "askıya almak",
      activate: "aktifleştirmek",
      ban: "yasaklamak",
    }[action];

    const confirmed = window.confirm(
      `${user.fullName} kullanıcısını ${actionText} istediğinizden emin misiniz?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      let updatedUser: AdminUserView;

      switch (action) {
        case "suspend":
          updatedUser = await adminUserService.suspendUser(
            user.id,
            "Admin tarafından askıya alındı"
          );
          break;
        case "activate":
          updatedUser = await adminUserService.activateUser(
            user.id,
            "Admin tarafından aktifleştirildi"
          );
          break;
        case "ban":
          updatedUser = await adminUserService.banUser(
            user.id,
            "Admin tarafından yasaklandı"
          );
          break;
        default:
          return;
      }

      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Kullanıcı ${actionText} işlemi başarısız oldu.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "suspended":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "banned":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: "overview", label: "Genel Bakış", icon: Users },
    { id: "activity", label: "Aktivite", icon: TrendingUp },
    { id: "notes", label: "Notlar", icon: MessageSquare },
  ];

  return (
    <AdminModal
      title={`${user.fullName} - Kullanıcı Detayları`}
      size="xl"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        {/* User Header */}
        <div className="flex items-center space-x-4 p-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.fullName}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-600" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {user.fullName}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="text-sm text-gray-500">@{user.username}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                {getStatusIcon(user.status)}
                <span className="text-sm font-medium capitalize">
                  {user.status}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {getVerificationIcon(user.verificationStatus)}
                <span className="text-sm font-medium">
                  {user.verificationStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {user.status === "active" ? (
              <button
                onClick={() => handleStatusChange("suspend")}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50"
              >
                <Ban className="h-4 w-4 mr-1" />
                Askıya Al
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("activate")}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Aktifleştir
              </button>
            )}
            {user.status !== "banned" && (
              <button
                onClick={() => handleStatusChange("ban")}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
              >
                <UserX className="h-4 w-4 mr-1" />
                Yasakla
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
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

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Temel Bilgiler
                  </h4>
                  <dl className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">Telefon</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {user.phoneNumber}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">E-posta</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {user.email}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">Rol</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {user.role}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">Kayıt Tarihi</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {new Date(user.registrationDate).toLocaleDateString(
                            "tr-TR"
                          )}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">Son Giriş</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {user.lastLoginDate
                            ? new Date(user.lastLoginDate).toLocaleDateString(
                                "tr-TR"
                              )
                            : "Hiç giriş yapmamış"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    İstatistikler
                  </h4>
                  <dl className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">
                          Toplam Rezervasyon
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {user.totalBookings}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">
                          Toplam Harcama
                        </dt>
                        <dd className="text-sm font-medium text-gray-900">
                          ₺{user.totalSpent.toLocaleString()}
                        </dd>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-gray-400" />
                      <div>
                        <dt className="text-sm text-gray-500">Risk Skoru</dt>
                        <dd
                          className={`text-sm font-medium ${
                            user.riskScore >= 7
                              ? "text-red-600"
                              : user.riskScore >= 4
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {user.riskScore}/10
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Hesap Durumu
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getStatusIcon(user.status)}
                    </div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {user.status}
                    </p>
                    <p className="text-xs text-gray-500">Hesap Durumu</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getVerificationIcon(user.verificationStatus)}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.verificationStatus}
                    </p>
                    <p className="text-xs text-gray-500">Doğrulama Durumu</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle
                        className={`h-5 w-5 ${
                          user.isEnabled ? "text-green-500" : "text-red-500"
                        }`}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.isEnabled ? "Etkin" : "Devre Dışı"}
                    </p>
                    <p className="text-xs text-gray-500">Hesap Durumu</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">
                Son Aktiviteler
              </h4>
              {activityLog.length > 0 ? (
                <div className="space-y-3">
                  {activityLog.map((activity) => (
                    <div
                      key={activity.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                            <span>
                              {new Date(activity.timestamp).toLocaleString(
                                "tr-TR"
                              )}
                            </span>
                            {activity.ipAddress && (
                              <span>IP: {activity.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Henüz aktivite kaydı bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">
                  Admin Notları
                </h4>
              </div>

              {/* Add New Note */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Not Ekle
                    </label>
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Not içeriğini yazın..."
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <select
                      value={newNoteType}
                      onChange={(e) => setNewNoteType(e.target.value as any)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="info">Bilgi</option>
                      <option value="warning">Uyarı</option>
                      <option value="important">Önemli</option>
                    </select>
                    <button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Not Ekle
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes List */}
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                note.type === "important"
                                  ? "bg-red-100 text-red-800"
                                  : note.type === "warning"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {note.type === "important"
                                ? "Önemli"
                                : note.type === "warning"
                                ? "Uyarı"
                                : "Bilgi"}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {note.adminName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(note.createdAt).toLocaleString("tr-TR")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{note.note}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="ml-4 text-red-600 hover:text-red-800"
                          title="Notu Sil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz not bulunmuyor.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
};
