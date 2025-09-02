import React, { useState, useEffect } from "react";
import {
  AdminTourView,
  AdminTourNote,
  TourApprovalRequest,
} from "@/types/adminTour";
import {
  TourDateDTO,
  TourImageDTO,
  CreateTourDateDTO,
  UpdateTourDateDTO,
} from "@/types/tour.types";
import { TourDocumentDTO } from "@/types/document.types";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { DynamicForm } from "@/components/admin/ui/DynamicForm";
import { tourService } from "@/services/tourService";
import TourModerationPanel from "./TourModerationPanel";
import {
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Star,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Clock,
  TrendingUp,
} from "lucide-react";

interface TourDetailModalProps {
  tour: AdminTourView;
  onClose: () => void;
  onApprove: (tour: AdminTourView) => Promise<void>;
  onReject: (tour: AdminTourView) => Promise<void>;
  onSuspend: (tour: AdminTourView) => Promise<void>;
  onActivate: (tour: AdminTourView) => Promise<void>;
  onAddNote?: (
    tourId: number,
    note: Omit<
      AdminTourNote,
      "id" | "adminId" | "adminName" | "createdAt" | "isVisible"
    >
  ) => Promise<void>;
  onVerifyDocument?: (
    documentId: number,
    status: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;
  onBulkVerifyDocuments?: (
    documentIds: number[],
    status: "verified" | "rejected",
    reason?: string
  ) => Promise<void>;
}

interface TabType {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}

const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onActivate,
  onAddNote,
  onVerifyDocument,
  onBulkVerifyDocuments,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTour, setEditedTour] = useState(tour);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tour dates management
  const [tourDates, setTourDates] = useState<TourDateDTO[]>(
    tour.tourDates || []
  );
  const [editingDateId, setEditingDateId] = useState<number | null>(null);
  const [showAddDate, setShowAddDate] = useState(false);

  // Tour images management
  const [tourImages, setTourImages] = useState<TourImageDTO[]>(
    tour.tourImages || []
  );
  const [showAddImage, setShowAddImage] = useState(false);

  // Tour documents
  const [tourDocuments, setTourDocuments] = useState<TourDocumentDTO[]>(
    tour.tourDocuments || []
  );

  const tabs: TabType[] = [
    { id: "details", label: "Genel Bilgiler", icon: Eye },
    { id: "guide", label: "Rehber Bilgileri", icon: User },
    { id: "dates", label: "Tarihler", icon: Calendar },
    { id: "images", label: "Resimler", icon: ImageIcon },
    { id: "documents", label: "Belgeler", icon: FileText },
    { id: "moderation", label: "Moderasyon", icon: AlertTriangle },
    { id: "stats", label: "İstatistikler", icon: TrendingUp },
    { id: "notes", label: "Notlar", icon: Edit },
  ];

  useEffect(() => {
    setEditedTour(tour);
    setTourDates(tour.tourDates || []);
    setTourImages(tour.tourImages || []);
    setTourDocuments(tour.tourDocuments || []);
  }, [tour]);

  // Form schema for tour editing
  const tourFormSchema = {
    fields: [
      {
        name: "name",
        label: "Tur Adı",
        type: "text",
        required: true,
        validation: { minLength: 3, maxLength: 100 },
      },
      {
        name: "description",
        label: "Kısa Açıklama",
        type: "textarea",
        required: true,
        validation: { minLength: 10, maxLength: 500 },
      },
      {
        name: "fullDescription",
        label: "Detaylı Açıklama",
        type: "textarea",
        validation: { maxLength: 2000 },
      },
      {
        name: "price",
        label: "Fiyat (₺)",
        type: "number",
        required: true,
        validation: { min: 0 },
      },
      {
        name: "capacity",
        label: "Kapasite",
        type: "number",
        required: true,
        validation: { min: 1, max: 100 },
      },
      {
        name: "location",
        label: "Konum",
        type: "text",
        required: true,
      },
      {
        name: "tourType",
        label: "Tur Türü",
        type: "select",
        options: [
          { value: "HIKING", label: "Yürüyüş" },
          { value: "CULTURAL", label: "Kültürel" },
          { value: "FOOD", label: "Yemek" },
          { value: "CITY", label: "Şehir" },
          { value: "NATURE", label: "Doğa" },
          { value: "BOAT", label: "Tekne" },
          { value: "PHOTOGRAPHY", label: "Fotoğraf" },
          { value: "DIVING", label: "Dalış" },
        ],
      },
      {
        name: "status",
        label: "Durum",
        type: "select",
        options: [
          { value: "ACTIVE", label: "Aktif" },
          { value: "INACTIVE", label: "Pasif" },
          { value: "DRAFT", label: "Taslak" },
          { value: "CANCELLED", label: "İptal" },
        ],
      },
    ],
  };

  // Date form schema
  const dateFormSchema = {
    fields: [
      {
        name: "startDate",
        label: "Başlangıç Tarihi",
        type: "datetime-local",
        required: true,
      },
      {
        name: "endDate",
        label: "Bitiş Tarihi",
        type: "datetime-local",
      },
      {
        name: "durationText",
        label: "Süre Açıklaması",
        type: "text",
        placeholder: "Örn: 4 Saat, 2 Gün",
        required: true,
      },
      {
        name: "maxGuests",
        label: "Maksimum Konuk",
        type: "number",
        required: true,
        validation: { min: 1 },
      },
      {
        name: "availabilityStatus",
        label: "Müsaitlik Durumu",
        type: "select",
        options: [
          { value: "AVAILABLE", label: "Müsait" },
          { value: "FULLY_BOOKED", label: "Dolu" },
          { value: "CANCELLED", label: "İptal" },
        ],
      },
    ],
  };

  const handleSaveTour = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);

      await tourService.updateTour({
        id: tour.id,
        ...formData,
      });

      setIsEditing(false);
      // Refresh tour data would be handled by parent component
    } catch (err) {
      console.error("Error updating tour:", err);
      setError(err instanceof Error ? err.message : "Failed to update tour");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDate = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);

      const newDate: CreateTourDateDTO = {
        tourId: tour.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationText: formData.durationText,
        maxGuests: formData.maxGuests,
        availabilityStatus: formData.availabilityStatus || "AVAILABLE",
      };

      const createdDate = await tourService.createTourDate(newDate);
      setTourDates([...tourDates, createdDate]);
      setShowAddDate(false);
    } catch (err) {
      console.error("Error adding date:", err);
      setError(err instanceof Error ? err.message : "Failed to add date");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDate = async (dateId: number, formData: any) => {
    try {
      setLoading(true);
      setError(null);

      const updateData: UpdateTourDateDTO = {
        id: dateId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        durationText: formData.durationText,
        maxGuests: formData.maxGuests,
        availabilityStatus: formData.availabilityStatus,
      };

      const updatedDate = await tourService.updateTourDate(updateData);
      setTourDates(
        tourDates.map((date) => (date.id === dateId ? updatedDate : date))
      );
      setEditingDateId(null);
    } catch (err) {
      console.error("Error updating date:", err);
      setError(err instanceof Error ? err.message : "Failed to update date");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDate = async (dateId: number) => {
    if (!confirm("Bu tarihi silmek istediğinizden emin misiniz?")) return;

    try {
      setLoading(true);
      await tourService.deleteTourDate(dateId);
      setTourDates(tourDates.filter((date) => date.id !== dateId));
    } catch (err) {
      console.error("Error deleting date:", err);
      setError(err instanceof Error ? err.message : "Failed to delete date");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm("Bu resmi silmek istediğinizden emin misiniz?")) return;

    try {
      setLoading(true);
      await tourService.deleteTourImage(imageId);
      setTourImages(tourImages.filter((image) => image.id !== imageId));
    } catch (err) {
      console.error("Error deleting image:", err);
      setError(err instanceof Error ? err.message : "Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: "Aktif", color: "bg-green-100 text-green-800" },
      INACTIVE: { label: "Pasif", color: "bg-red-100 text-red-800" },
      DRAFT: { label: "Taslak", color: "bg-yellow-100 text-yellow-800" },
      CANCELLED: { label: "İptal", color: "bg-gray-100 text-gray-800" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getApprovalStatusBadge = (status: string) => {
    const approvalConfig = {
      pending: {
        label: "Beklemede",
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertTriangle,
      },
      approved: {
        label: "Onaylandı",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      rejected: {
        label: "Reddedildi",
        color: "bg-red-100 text-red-800",
        icon: XCircle,
      },
      suspended: {
        label: "Askıya Alındı",
        color: "bg-orange-100 text-orange-800",
        icon: Pause,
      },
    };

    const config = approvalConfig[status as keyof typeof approvalConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {isEditing ? (
        <DynamicForm
          schema={tourFormSchema}
          initialValues={{
            name: editedTour.name,
            description: editedTour.description,
            fullDescription: editedTour.fullDescription,
            price: editedTour.price,
            capacity: editedTour.capacity,
            location: editedTour.location,
            tourType: editedTour.tourType,
            status: editedTour.status,
          }}
          onSubmit={handleSaveTour}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tur Adı
              </label>
              <p className="text-gray-900 font-medium">{tour.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <p className="text-gray-900">{tour.description}</p>
            </div>

            {tour.fullDescription && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detaylı Açıklama
                </label>
                <p className="text-gray-900">{tour.fullDescription}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat
                </label>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-gray-900 font-medium">
                    ₺{tour.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-gray-900">{tour.capacity} kişi</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Konum
              </label>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-900">{tour.location}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              {getStatusBadge(tour.status)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Onay Durumu
              </label>
              {getApprovalStatusBadge(tour.approvalStatus)}
            </div>

            {tour.tourType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tur Türü
                </label>
                <span className="text-gray-900">{tour.tourType}</span>
              </div>
            )}

            {tour.rating && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Değerlendirme
                </label>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-gray-900">
                    {tour.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oluşturulma Tarihi
              </label>
              <span className="text-gray-900">
                {new Date(tour.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Son Güncelleme
              </label>
              <span className="text-gray-900">
                {new Date(tour.updatedAt).toLocaleDateString("tr-TR")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderGuideTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900">
              {tour.guideInfo.name}
            </h3>
            <div className="flex items-center mt-1">
              {tour.guideInfo.isVerified && (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              )}
              {tour.guideInfo.isCertified && (
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
              )}
              <span className="text-sm text-gray-500">
                {tour.guideInfo.isVerified ? "Doğrulanmış" : "Doğrulanmamış"}
                {tour.guideInfo.isCertified && " • Sertifikalı"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-posta
            </label>
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{tour.guideInfo.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefon
            </label>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-900">{tour.guideInfo.phone}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Katılım Tarihi
            </label>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-900">
                {new Date(tour.guideInfo.joinDate).toLocaleDateString("tr-TR")}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Toplam Tur
            </label>
            <span className="text-gray-900">{tour.guideInfo.totalTours}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Değerlendirme
            </label>
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-gray-900">
                {tour.guideInfo.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yanıt Oranı
            </label>
            <span className="text-gray-900">
              %{tour.guideInfo.responseRate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Tur Tarihleri</h3>
        <button
          onClick={() => setShowAddDate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tarih Ekle
        </button>
      </div>

      {tourDates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz tarih eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tourDates.map((date) => (
            <div key={date.id} className="bg-gray-50 rounded-lg p-4">
              {editingDateId === date.id ? (
                <DynamicForm
                  schema={dateFormSchema}
                  initialValues={{
                    startDate: date.startDate.slice(0, 16), // Format for datetime-local
                    endDate: date.endDate?.slice(0, 16),
                    durationText: date.durationText,
                    maxGuests: date.maxGuests,
                    availabilityStatus: date.availabilityStatus,
                  }}
                  onSubmit={(formData) => handleUpdateDate(date.id, formData)}
                  loading={loading}
                />
              ) : (
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="font-medium">
                        {new Date(date.startDate).toLocaleString("tr-TR")}
                      </span>
                      {date.endDate && (
                        <span className="text-gray-500 ml-2">
                          - {new Date(date.endDate).toLocaleString("tr-TR")}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span>{date.durationText}</span>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-400 mr-2" />
                      <span>Maksimum {date.maxGuests} kişi</span>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          date.availabilityStatus === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : date.availabilityStatus === "FULLY_BOOKED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {date.availabilityStatus === "AVAILABLE"
                          ? "Müsait"
                          : date.availabilityStatus === "FULLY_BOOKED"
                          ? "Dolu"
                          : "İptal"}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingDateId(date.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDate(date.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddDate && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Yeni Tarih Ekle</h4>
          <DynamicForm
            schema={dateFormSchema}
            initialValues={{
              availabilityStatus: "AVAILABLE",
              maxGuests: tour.capacity,
            }}
            onSubmit={handleAddDate}
            loading={loading}
          />
          <button
            onClick={() => setShowAddDate(false)}
            className="mt-2 text-gray-600 hover:text-gray-700 text-sm"
          >
            İptal
          </button>
        </div>
      )}
    </div>
  );

  const renderImagesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Tur Resimleri</h3>
        <button
          onClick={() => setShowAddImage(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Resim Ekle
        </button>
      </div>

      {tourImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz resim eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tourImages.map((image) => (
            <div key={image.id} className="relative group">
              <img
                src={image.imageUrl}
                alt={`Tour image ${image.displayOrder}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="text-white hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {image.displayOrder}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Tur Belgeleri</h3>

      {tourDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz belge eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tourDocuments.map((document) => (
            <div key={document.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-medium">{document.documentType}</span>
                  </div>

                  {document.fileName && (
                    <div className="text-sm text-gray-600">
                      Dosya: {document.fileName}
                    </div>
                  )}

                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        document.verificationStatus === "VERIFIED"
                          ? "bg-green-100 text-green-800"
                          : document.verificationStatus === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {document.verificationStatus === "VERIFIED"
                        ? "Doğrulandı"
                        : document.verificationStatus === "PENDING"
                        ? "Beklemede"
                        : "Reddedildi"}
                    </span>
                  </div>

                  {document.expiryDate && (
                    <div className="text-sm text-gray-600">
                      Son kullanma:{" "}
                      {new Date(document.expiryDate).toLocaleDateString(
                        "tr-TR"
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(document.documentUrl, "_blank")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">İstatistikler</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">
                Toplam Rezervasyon
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {tour.bookingStats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-green-900">
                ₺{tour.bookingStats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-600">
                Ortalama Puan
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {tour.bookingStats.averageRating.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Bu Ay</p>
              <p className="text-2xl font-bold text-purple-900">
                {tour.bookingStats.thisMonthBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-indigo-600">
                Tamamlanma Oranı
              </p>
              <p className="text-2xl font-bold text-indigo-900">
                %{Math.round(tour.bookingStats.completionRate)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Görüntülenme</p>
              <p className="text-2xl font-bold text-red-900">
                {tour.viewCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Moderasyon Notları</h3>

      {tour.moderationNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Henüz not eklenmemiş</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tour.moderationNotes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {note.adminName}
                  </span>
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      note.type === "info"
                        ? "bg-blue-100 text-blue-800"
                        : note.type === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : note.type === "important"
                        ? "bg-red-100 text-red-800"
                        : note.type === "approval"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {note.type === "info"
                      ? "Bilgi"
                      : note.type === "warning"
                      ? "Uyarı"
                      : note.type === "important"
                      ? "Önemli"
                      : note.type === "approval"
                      ? "Onay"
                      : "Red"}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(note.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
              <p className="text-gray-700">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModerationTab = () => (
    <TourModerationPanel
      tour={tour}
      onApprove={async (request: TourApprovalRequest) => {
        await onApprove(tour);
      }}
      onReject={async (request: TourApprovalRequest) => {
        await onReject(tour);
      }}
      onSuspend={async (tourId: number, reason: string) => {
        await onSuspend(tour);
      }}
      onActivate={async (tourId: number, note?: string) => {
        await onActivate(tour);
      }}
      onAddNote={async (tourId: number, note) => {
        if (onAddNote) {
          await onAddNote(tourId, note);
        }
      }}
      loading={loading}
    />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return renderDetailsTab();
      case "guide":
        return renderGuideTab();
      case "dates":
        return renderDatesTab();
      case "images":
        return renderImagesTab();
      case "documents":
        return renderDocumentsTab();
      case "moderation":
        return renderModerationTab();
      case "stats":
        return renderStatsTab();
      case "notes":
        return renderNotesTab();
      default:
        return renderDetailsTab();
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    if (!isEditing) {
      buttons.push({
        label: "Düzenle",
        variant: "outline" as const,
        icon: Edit,
        onClick: () => setIsEditing(true),
      });
    }

    if (tour.approvalStatus === "pending") {
      buttons.push(
        {
          label: "Onayla",
          variant: "primary" as const,
          icon: CheckCircle,
          onClick: () => onApprove(tour),
          className: "bg-green-600 hover:bg-green-700",
        },
        {
          label: "Reddet",
          variant: "outline" as const,
          icon: XCircle,
          onClick: () => onReject(tour),
          className: "text-red-600 border-red-600 hover:bg-red-50",
        }
      );
    }

    if (tour.isActive) {
      buttons.push({
        label: "Askıya Al",
        variant: "outline" as const,
        icon: Pause,
        onClick: () => onSuspend(tour),
        className: "text-orange-600 border-orange-600 hover:bg-orange-50",
      });
    } else {
      buttons.push({
        label: "Aktifleştir",
        variant: "outline" as const,
        icon: Play,
        onClick: () => onActivate(tour),
        className: "text-green-600 border-green-600 hover:bg-green-50",
      });
    }

    return buttons;
  };

  return (
    <AdminModal
      title={`Tur Detayları: ${tour.name}`}
      size="full"
      onClose={onClose}
      actions={getActionButtons()}
    >
      <div className="flex flex-col h-full">
        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Hata</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-3">
                  <button
                    onClick={() => setError(null)}
                    className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">{renderTabContent()}</div>
      </div>
    </AdminModal>
  );
};

export default TourDetailModal;
