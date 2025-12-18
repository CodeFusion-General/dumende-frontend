import React, { useState } from "react";
import AdminPanelLayout from "@/components/admin/layout/AdminPanelLayout";
import { DataTable, ColumnDef } from "@/components/admin/ui/DataTable";
import { FilterPanel } from "@/components/admin/ui/FilterPanel";
import { SearchBar } from "@/components/admin/ui/SearchBar";
import StatCard from "@/components/admin/ui/StatCard";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { DocumentViewer } from "@/components/admin/documents/DocumentViewer";
import { BulkDocumentActions } from "@/components/admin/documents/BulkDocumentActions";
import { DocumentNotificationSystem } from "@/components/admin/documents/DocumentNotificationSystem";
import { DocumentTypeManagement } from "@/components/admin/documents/DocumentTypeManagement";
import { useAdminDocumentManagement } from "@/hooks/useAdminDocumentManagement";
import { AdminDocumentView } from "@/types/adminDocument";
import {
  FileText as DocumentTextIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  AlertTriangle as ExclamationTriangleIcon,
  XCircle as XCircleIcon,
  Eye as EyeIcon,
  Trash as TrashIcon,
  RotateCcw as ArrowPathIcon,
  Download as DocumentArrowDownIcon,
  Settings as Cog6ToothIcon,
  Bell as BellIcon,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const DocumentManagement: React.FC = () => {
  const {
    documents,
    pagination,
    documentStats,
    expiredDocuments,
    expiringSoonDocuments,
    pendingDocuments,
    isLoadingDocuments,
    isLoadingStats,
    filter,
    sort,
    selectedDocuments,
    updateFilter,
    clearFilters,
    updateSort,
    searchDocuments,
    selectDocument,
    selectAllDocuments,
    clearSelection,
    approveDocument,
    rejectDocument,
    bulkApprove,
    bulkReject,
    bulkDelete,
    deleteDocument,
    requestReupload,
    exportDocuments,
    goToPage,
    changePageSize,
    isUpdatingVerification,
    isBulkOperating,
    refetchDocuments,
    refetchStats,
  } = useAdminDocumentManagement();

  const [selectedDocument, setSelectedDocument] =
    useState<AdminDocumentView | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "documents" | "notifications" | "types"
  >("documents");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  // Filter options
  const filterOptions = [
    {
      key: "entityType",
      label: "Varlık Türü",
      type: "select" as const,
      options: [
        { value: "", label: "Tümü" },
        { value: "boat", label: "Tekne" },
        { value: "tour", label: "Tur" },
      ],
    },
    {
      key: "verificationStatus",
      label: "Doğrulama Durumu",
      type: "select" as const,
      options: [
        { value: "", label: "Tümü" },
        { value: "verified", label: "Onaylanmış" },
        { value: "pending", label: "Beklemede" },
        { value: "rejected", label: "Reddedilmiş" },
      ],
    },
    {
      key: "expiryStatus",
      label: "Son Kullanma Durumu",
      type: "select" as const,
      options: [
        { value: "", label: "Tümü" },
        { value: "valid", label: "Geçerli" },
        { value: "expiring_soon", label: "Yakında Sona Erecek" },
        { value: "expired", label: "Süresi Dolmuş" },
      ],
    },
    {
      key: "dateRange",
      label: "Tarih Aralığı",
      type: "daterange" as const,
    },
  ];

  // Table columns
  const columns: ColumnDef<AdminDocumentView>[] = [
    {
      key: "select",
      header: "",
      render: (document: AdminDocumentView) => (
        <input
          type="checkbox"
          checked={selectedDocuments.includes(document.id)}
          onChange={() => selectDocument(document.id)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      width: "50px",
    },
    {
      key: "documentName",
      header: "Belge Adı",
      sortable: true,
      render: (document: AdminDocumentView) => (
        <div className="flex items-center space-x-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">
              {document.documentName}
            </div>
            <div className="text-sm text-gray-500">
              {getDocumentTypeLabel(document.documentType, document.entityType)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "entityName",
      header: "Varlık",
      sortable: true,
      render: (document: AdminDocumentView) => (
        <div>
          <div className="font-medium text-gray-900">{document.entityName}</div>
          <div className="text-sm text-gray-500 capitalize">
            {document.entityType === "boat" ? "Tekne" : "Tur"}
          </div>
        </div>
      ),
    },
    {
      key: "ownerName",
      header: "Sahip",
      sortable: true,
      render: (document: AdminDocumentView) => (
        <div>
          <div className="font-medium text-gray-900">
            {document.ownerInfo.name}
          </div>
          <div className="text-sm text-gray-500">
            {document.ownerInfo.email}
          </div>
        </div>
      ),
    },
    {
      key: "verificationStatus",
      header: "Durum",
      sortable: true,
      render: (document: AdminDocumentView) => {
        if (document.isVerified) {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Onaylanmış
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              <ClockIcon className="h-4 w-4 mr-1" />
              Beklemede
            </span>
          );
        }
      },
    },
    {
      key: "expiryDate",
      header: "Son Kullanma",
      sortable: true,
      render: (document: AdminDocumentView) => {
        if (!document.expiryDate) {
          return <span className="text-gray-400">-</span>;
        }

        const isExpired = document.isExpired;
        const isExpiringSoon = document.isExpiringSoon;

        return (
          <div className="flex items-center space-x-1">
            {isExpired && <XCircleIcon className="h-4 w-4 text-red-500" />}
            {isExpiringSoon && !isExpired && (
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />
            )}
            <span
              className={`text-sm ${
                isExpired
                  ? "text-red-600 font-medium"
                  : isExpiringSoon
                  ? "text-yellow-600 font-medium"
                  : "text-gray-900"
              }`}
            >
              {format(new Date(document.expiryDate), "dd MMM yyyy", {
                locale: tr,
              })}
            </span>
            {document.daysUntilExpiry !== undefined && (
              <span className="text-xs text-gray-500">
                (
                {document.daysUntilExpiry > 0
                  ? `${document.daysUntilExpiry} gün`
                  : "Süresi dolmuş"}
                )
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "Yüklenme Tarihi",
      sortable: true,
      render: (document: AdminDocumentView) => (
        <span className="text-sm text-gray-900">
          {format(new Date(document.createdAt), "dd MMM yyyy HH:mm", {
            locale: tr,
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      render: (document: AdminDocumentView) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedDocument(document);
              setShowDocumentViewer(true);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Belgeyi Görüntüle"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          {!document.isVerified && (
            <>
              <button
                onClick={() => approveDocument(document.id)}
                disabled={isUpdatingVerification}
                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                title="Onayla"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedDocument(document);
                  setRejectNotes("");
                  setShowRejectModal(true);
                }}
                disabled={isUpdatingVerification}
                className="text-red-600 hover:text-red-800 disabled:opacity-50"
                title="Reddet"
              >
                <XCircleIcon className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={() =>
              requestReupload(document.id, "Belge yeniden yüklenmesi gerekiyor")
            }
            className="text-yellow-600 hover:text-yellow-800"
            title="Yeniden Yükleme Talep Et"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteDocument(document.id)}
            className="text-red-600 hover:text-red-800"
            title="Sil"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const getDocumentTypeLabel = (
    documentType: string,
    entityType: "boat" | "tour"
  ): string => {
    // This would use the service method in a real implementation
    return documentType.replace(/_/g, " ").toLowerCase();
  };

  const handleRejectSubmit = () => {
    if (selectedDocument && rejectNotes.trim()) {
      rejectDocument(selectedDocument.id, rejectNotes);
      setShowRejectModal(false);
      setRejectNotes("");
      setSelectedDocument(null);
    }
  };

  const tabs = [
    { id: "documents", label: "Belgeler", icon: DocumentTextIcon },
    { id: "notifications", label: "Bildirimler", icon: BellIcon },
    { id: "types", label: "Belge Türleri", icon: Cog6ToothIcon },
  ];

  return (
    <AdminPanelLayout
      title="Belge Yönetimi"
      breadcrumbs={[
        { label: "Admin Panel", href: "/adminPanel" },
        { label: "Belge Yönetimi", href: "/adminPanel/documents" },
      ]}
    >
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Toplam Belge"
            value={documentStats?.total || 0}
            icon={<DocumentTextIcon className="h-6 w-6" />}
            color="blue"
          />
          <StatCard
            title="Onaylanmış"
            value={documentStats?.verified || 0}
            icon={<CheckCircleIcon className="h-6 w-6" />}
            color="green"
          />
          <StatCard
            title="Beklemede"
            value={documentStats?.pending || 0}
            icon={<ClockIcon className="h-6 w-6" />}
            color="yellow"
          />
          <StatCard
            title="Süresi Dolmuş"
            value={documentStats?.expired || 0}
            icon={<ExclamationTriangleIcon className="h-6 w-6" />}
            color="red"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Belge adı, sahip adı veya varlık adı ile ara..."
                    onSearch={searchDocuments}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportDocuments("csv")}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Dışa Aktar
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <FilterPanel
                  filters={filterOptions}
                  values={filter}
                  onChange={updateFilter}
                  onReset={clearFilters}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            <BulkDocumentActions
              selectedDocumentIds={selectedDocuments}
              onBulkOperation={(operation) => {
                switch (operation.operation) {
                  case "approve":
                    bulkApprove(operation.verificationNotes);
                    break;
                  case "reject":
                    bulkReject(operation.verificationNotes || "");
                    break;
                  case "delete":
                    bulkDelete();
                    break;
                }
              }}
              onClearSelection={clearSelection}
              isOperating={isBulkOperating}
            />

            {/* Documents Table */}
            <div className="bg-white rounded-lg shadow">
              <DataTable
                data={documents}
                columns={columns}
                loading={isLoadingDocuments}
                pagination={{
                  page: pagination?.page || 1,
                  pageSize: pagination?.limit || 20,
                  total: pagination?.total || 0,
                }}


              />
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <DocumentNotificationSystem
            expiredDocuments={expiredDocuments}
            expiringSoonDocuments={expiringSoonDocuments}
            onRefresh={() => {
              refetchDocuments();
              refetchStats();
            }}
          />
        )}

        {activeTab === "types" && <DocumentTypeManagement />}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={showDocumentViewer}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
          }}
          onVerificationUpdate={(update) => {
            if (update.isVerified) {
              approveDocument(update.documentId, update.verificationNotes);
            } else {
              rejectDocument(update.documentId, update.verificationNotes || "");
            }
          }}
        />
      )}

      {/* Reject Modal */}
      <AdminModal
        title="Belgeyi Reddet"
        open={showRejectModal}
        onOpenChange={setShowRejectModal}
        actions={[
          {
            label: "İptal",
            variant: "secondary",
            onClick: () => setShowRejectModal(false),
          },
          {
            label: "Reddet",
            variant: "destructive",
            onClick: handleRejectSubmit,
            disabled: !rejectNotes.trim(),
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Bu belgeyi reddetmek istediğinizden emin misiniz? Red sebebini
            belirtmeniz gerekmektedir.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Red Sebebi <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Red sebebini buraya yazın..."
              required
            />
          </div>
        </div>
      </AdminModal>
    </AdminPanelLayout>
  );
};

export default DocumentManagement;
