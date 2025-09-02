import React, { useState } from "react";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { DocumentTypeConfig } from "@/types/adminDocument";
import { BoatDocumentType, TourDocumentType } from "@/types/document.types";
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

interface DocumentTemplate {
  id: number;
  name: string;
  documentType: BoatDocumentType | TourDocumentType;
  entityType: "boat" | "tour";
  description?: string;
  templateUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DocumentTemplateManagerProps {
  documentTypeConfigs: DocumentTypeConfig[];
}

export const DocumentTemplateManager: React.FC<
  DocumentTemplateManagerProps
> = ({ documentTypeConfigs }) => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    // Mock data - in real implementation, this would come from API
    {
      id: 1,
      name: "Gemi Ruhsatı Şablonu",
      documentType: BoatDocumentType.LICENSE,
      entityType: "boat",
      description: "Standart gemi ruhsatı belgesi şablonu",
      templateUrl: "/templates/boat-license-template.pdf",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: 2,
      name: "Rehber Ruhsatı Şablonu",
      documentType: TourDocumentType.GUIDE_LICENSE,
      entityType: "tour",
      description: "Turist rehberi ruhsatı belgesi şablonu",
      templateUrl: "/templates/guide-license-template.pdf",
      isActive: true,
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<DocumentTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    documentType: "",
    entityType: "boat" as "boat" | "tour",
    description: "",
    templateFile: null as File | null,
  });

  const handleCreate = () => {
    setIsCreating(true);
    setEditingTemplate(null);
    setFormData({
      name: "",
      documentType: "",
      entityType: "boat",
      description: "",
      templateFile: null,
    });
    setShowModal(true);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setIsCreating(false);
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      documentType: template.documentType,
      entityType: template.entityType,
      description: template.description || "",
      templateFile: null,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (isCreating) {
      // Create new template
      const newTemplate: DocumentTemplate = {
        id: Date.now(),
        name: formData.name,
        documentType: formData.documentType as any,
        entityType: formData.entityType,
        description: formData.description,
        templateUrl: `/templates/${formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")}.pdf`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTemplates((prev) => [...prev, newTemplate]);
    } else if (editingTemplate) {
      // Update existing template
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === editingTemplate.id
            ? {
                ...template,
                name: formData.name,
                documentType: formData.documentType as any,
                entityType: formData.entityType,
                description: formData.description,
                updatedAt: new Date().toISOString(),
              }
            : template
        )
      );
    }
    setShowModal(false);
  };

  const handleDelete = (templateId: number) => {
    if (confirm("Bu şablonu silmek istediğinizden emin misiniz?")) {
      setTemplates((prev) =>
        prev.filter((template) => template.id !== templateId)
      );
    }
  };

  const toggleActive = (templateId: number) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  const downloadTemplate = (template: DocumentTemplate) => {
    // In real implementation, this would download the actual template file
    window.open(template.templateUrl, "_blank");
  };

  const getDocumentTypeOptions = () => {
    return documentTypeConfigs
      .filter((config) => config.entityType === formData.entityType)
      .map((config) => ({
        value: config.type,
        label: config.label,
      }));
  };

  const getDocumentTypeLabel = (
    type: string,
    entityType: "boat" | "tour"
  ): string => {
    const config = documentTypeConfigs.find(
      (c) => c.type === type && c.entityType === entityType
    );
    return config?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            Belge Şablonları
          </h3>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Yeni Şablon
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {getDocumentTypeLabel(
                      template.documentType,
                      template.entityType
                    )}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  template.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {template.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>

            {template.description && (
              <p className="text-sm text-gray-600 mb-3">
                {template.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 capitalize">
                {template.entityType === "boat" ? "Tekne" : "Tur"}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => downloadTemplate(template)}
                  className="text-blue-600 hover:text-blue-800"
                  title="İndir"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleEdit(template)}
                  className="text-gray-600 hover:text-gray-800"
                  title="Düzenle"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleActive(template.id)}
                  className={`${
                    template.isActive
                      ? "text-red-600 hover:text-red-800"
                      : "text-green-600 hover:text-green-800"
                  }`}
                  title={template.isActive ? "Pasifleştir" : "Aktifleştir"}
                >
                  {template.isActive ? (
                    <XCircleIcon className="h-4 w-4" />
                  ) : (
                    <CheckCircleIcon className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Sil"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Henüz şablon yok
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Belge şablonları oluşturarak kullanıcıların doğru format
            kullanmasını sağlayın.
          </p>
          <div className="mt-6">
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              İlk Şablonu Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AdminModal
        title={isCreating ? "Yeni Şablon Oluştur" : "Şablonu Düzenle"}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        actions={[
          {
            label: "İptal",
            variant: "secondary",
            onClick: () => setShowModal(false),
          },
          {
            label: isCreating ? "Oluştur" : "Güncelle",
            variant: "primary",
            onClick: handleSubmit,
            disabled: !formData.name || !formData.documentType,
          },
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şablon Adı *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Şablon adını girin"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Varlık Türü *
            </label>
            <select
              value={formData.entityType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  entityType: e.target.value as "boat" | "tour",
                  documentType: "", // Reset document type when entity type changes
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="boat">Tekne</option>
              <option value="tour">Tur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Belge Türü *
            </label>
            <select
              value={formData.documentType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  documentType: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Belge türü seçin</option>
              {getDocumentTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Şablon hakkında açıklama"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şablon Dosyası {isCreating && "*"}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="template-file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Dosya yükle</span>
                    <input
                      id="template-file"
                      name="template-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setFormData((prev) => ({
                          ...prev,
                          templateFile: file,
                        }));
                      }}
                    />
                  </label>
                  <p className="pl-1">veya sürükle bırak</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOC, DOCX dosyaları (max 10MB)
                </p>
                {formData.templateFile && (
                  <p className="text-sm text-green-600">
                    Seçilen dosya: {formData.templateFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
