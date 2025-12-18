import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { DynamicForm } from "@/components/admin/ui/DynamicForm";
import { DataTable } from "@/components/admin/ui/DataTable";
import { DocumentTypeConfig } from "@/types/adminDocument";
import { BoatDocumentType, TourDocumentType } from "@/types/document.types";
import { adminDocumentService } from "@/services/adminPanel/adminDocumentService";
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export const DocumentTypeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DocumentTypeConfig | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  // Query for document type configurations
  const {
    data: documentTypeConfigs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["document-type-configs"],
    queryFn: () => adminDocumentService.getDocumentTypeConfigs(),
  });

  // Mutation for creating document type config
  const createConfigMutation = useMutation({
    mutationFn: (config: Omit<DocumentTypeConfig, "displayOrder">) =>
      adminDocumentService.createDocumentTypeConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-type-configs"] });
      toast.success("Belge türü konfigürasyonu oluşturuldu");
      setShowModal(false);
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Konfigürasyon oluşturulurken hata oluştu"
      );
    },
  });

  // Mutation for updating document type config
  const updateConfigMutation = useMutation({
    mutationFn: (config: DocumentTypeConfig) =>
      adminDocumentService.updateDocumentTypeConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-type-configs"] });
      toast.success("Belge türü konfigürasyonu güncellendi");
      setShowModal(false);
      setEditingConfig(null);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Konfigürasyon güncellenirken hata oluştu"
      );
    },
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingConfig(null);
    setShowModal(true);
  };

  const handleEdit = (config: DocumentTypeConfig) => {
    setIsCreating(false);
    setEditingConfig(config);
    setShowModal(true);
  };

  const handleSubmit = (formData: any) => {
    if (isCreating) {
      createConfigMutation.mutate(formData);
    } else if (editingConfig) {
      updateConfigMutation.mutate({ ...editingConfig, ...formData });
    }
  };

  const getDocumentTypeOptions = (entityType: "boat" | "tour") => {
    if (entityType === "boat") {
      return Object.values(BoatDocumentType).map((type) => ({
        value: type,
        label: getDocumentTypeLabel(type, "boat"),
      }));
    } else {
      return Object.values(TourDocumentType).map((type) => ({
        value: type,
        label: getDocumentTypeLabel(type, "tour"),
      }));
    }
  };

  const getDocumentTypeLabel = (
    type: string,
    entityType: "boat" | "tour"
  ): string => {
    return adminDocumentService.getDocumentTypeLabel(type as any, entityType);
  };

  const formSchema = {
    fields: [
      {
        name: "entityType",
        label: "Varlık Türü",
        type: "select",
        required: true,
        options: [
          { value: "boat", label: "Tekne" },
          { value: "tour", label: "Tur" },
        ],
      },
      {
        name: "type",
        label: "Belge Türü",
        type: "select",
        required: true,
        options: [], // Will be populated dynamically based on entityType
      },
      {
        name: "label",
        label: "Görünen Ad",
        type: "text",
        required: true,
        placeholder: "Belge türünün görünen adı",
      },
      {
        name: "description",
        label: "Açıklama",
        type: "textarea",
        placeholder: "Belge türü hakkında açıklama",
      },
      {
        name: "isRequired",
        label: "Zorunlu Belge",
        type: "checkbox",
        defaultValue: false,
      },
      {
        name: "hasExpiryDate",
        label: "Son Kullanma Tarihi Var",
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "isActive",
        label: "Aktif",
        type: "checkbox",
        defaultValue: true,
      },
      {
        name: "validationRules.maxFileSize",
        label: "Maksimum Dosya Boyutu (MB)",
        type: "number",
        placeholder: "10",
        min: 1,
        max: 50,
      },
      {
        name: "validationRules.acceptedFormats",
        label: "Kabul Edilen Formatlar",
        type: "multiselect",
        options: [
          { value: "pdf", label: "PDF" },
          { value: "jpg", label: "JPG" },
          { value: "jpeg", label: "JPEG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WEBP" },
        ],
        defaultValue: ["pdf", "jpg", "jpeg", "png"],
      },
      {
        name: "validationRules.customValidation",
        label: "Özel Doğrulama Kuralları",
        type: "textarea",
        placeholder: "JSON formatında özel doğrulama kuralları",
      },
    ],
  };

  // Table columns
  const columns = [
    {
      key: "entityType",
      label: "Varlık Türü",
      render: (config: DocumentTypeConfig) => (
        <span className="capitalize">
          {config.entityType === "boat" ? "Tekne" : "Tur"}
        </span>
      ),
    },
    {
      key: "label",
      label: "Belge Türü",
      render: (config: DocumentTypeConfig) => (
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{config.label}</div>
            <div className="text-sm text-gray-500">{config.type}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Açıklama",
      render: (config: DocumentTypeConfig) => (
        <span className="text-sm text-gray-600">
          {config.description || "-"}
        </span>
      ),
    },
    {
      key: "isRequired",
      label: "Zorunlu",
      render: (config: DocumentTypeConfig) =>
        config.isRequired ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Zorunlu
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            İsteğe Bağlı
          </span>
        ),
    },
    {
      key: "hasExpiryDate",
      label: "Son Kullanma",
      render: (config: DocumentTypeConfig) =>
        config.hasExpiryDate ? (
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        ) : (
          <XCircleIcon className="h-4 w-4 text-gray-400" />
        ),
    },
    {
      key: "isActive",
      label: "Durum",
      render: (config: DocumentTypeConfig) =>
        config.isActive ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Aktif
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Pasif
          </span>
        ),
    },
    {
      key: "validationRules",
      label: "Doğrulama",
      render: (config: DocumentTypeConfig) => (
        <div className="text-xs text-gray-500">
          {config.validationRules?.maxFileSize && (
            <div>Max: {config.validationRules.maxFileSize}MB</div>
          )}
          {config.validationRules?.acceptedFormats && (
            <div>
              Formatlar: {config.validationRules.acceptedFormats.join(", ")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "İşlemler",
      render: (config: DocumentTypeConfig) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(config)}
            className="text-blue-600 hover:text-blue-800"
            title="Düzenle"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cog6ToothIcon className="h-6 w-6 text-gray-400" />
          <h2 className="text-lg font-medium text-gray-900">
            Belge Türü Yönetimi
          </h2>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yeni Belge Türü
        </button>
      </div>

      {/* Document Type Configurations Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          data={documentTypeConfigs}
          columns={columns}
          loading={isLoading}
          emptyMessage="Henüz belge türü konfigürasyonu bulunmuyor"
        />
      </div>

      {/* Create/Edit Modal */}
      <AdminModal
        title={isCreating ? "Yeni Belge Türü Oluştur" : "Belge Türünü Düzenle"}
        size="lg"
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingConfig(null);
        }}
        actions={[
          {
            label: "İptal",
            variant: "secondary",
            onClick: () => {
              setShowModal(false);
              setEditingConfig(null);
            },
          },
          {
            label: isCreating ? "Oluştur" : "Güncelle",
            variant: "primary",
            onClick: () => {
              // Form submission will be handled by DynamicForm
            },
            loading:
              createConfigMutation.isPending || updateConfigMutation.isPending,
          },
        ]}
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Belge Türü Konfigürasyonu
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Bu konfigürasyon, belirtilen varlık türü için yeni bir belge
                    türü tanımlar. Doğrulama kuralları, zorunluluk durumu ve
                    diğer özellikler burada belirlenir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DynamicForm
            schema={formSchema}
            initialValues={editingConfig || {}}
            onSubmit={handleSubmit}
            submitButtonText={isCreating ? "Oluştur" : "Güncelle"}
            isSubmitting={
              createConfigMutation.isPending || updateConfigMutation.isPending
            }
          />
        </div>
      </AdminModal>

      {/* Info Panel */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Belge Türü Yönetimi Hakkında
        </h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            • Belge türleri, tekneler ve turlar için gerekli belgeleri tanımlar
          </p>
          <p>• Her belge türü için özel doğrulama kuralları belirlenebilir</p>
          <p>• Zorunlu belgeler olmadan varlık onaylanamaz</p>
          <p>
            • Son kullanma tarihi olan belgeler için otomatik uyarılar
            gönderilir
          </p>
          <p>• Pasif belge türleri yeni yüklemeler için kullanılamaz</p>
        </div>
      </div>
    </div>
  );
};
