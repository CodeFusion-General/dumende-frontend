import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error";
import {
  ProfessionalInfo,
  ProfessionalInfoFormData,
  Certification,
} from "@/types/profile.types";
import { professionalInfoFormSchema } from "@/lib/validation/profile.schemas";
import { useProfileFormValidation } from "@/hooks/useFormValidation";
import { useProfessionalInfoState } from "@/hooks/useProfileState";
import {
  Edit2,
  Save,
  X,
  Award,
  Calendar,
  FileText,
  Star,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { ProfessionalInfoCardSkeleton } from "./ProfileLoadingSkeletons";
import { ProfileCardErrorBoundary } from "./ProfileErrorBoundary";

interface ProfessionalInfoCardProps {
  professionalInfo?: ProfessionalInfo;
  onSave?: (data: ProfessionalInfoFormData) => Promise<void> | void;
  isLoading?: boolean;
  onRetry?: () => void;
}

const ProfessionalInfoCard: React.FC<ProfessionalInfoCardProps> = ({
  professionalInfo,
  onSave,
  isLoading = false,
  onRetry,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const profileState = useProfessionalInfoState();

  // Show loading skeleton if loading or data is missing
  if (isLoading || !professionalInfo) {
    return <ProfessionalInfoCardSkeleton />;
  }

  // Convert ProfessionalInfo to form data format
  const getFormData = (info: ProfessionalInfo): ProfessionalInfoFormData => ({
    licenseNumber: info.licenseNumber,
    licenseExpiry: info.licenseExpiry,
    yearsOfExperience: info.yearsOfExperience,
    specializations: info.specializations,
    bio: info.bio || "",
  });

  const form = useForm<ProfessionalInfoFormData>({
    resolver: zodResolver(professionalInfoFormSchema),
    defaultValues: getFormData(professionalInfo),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Use enhanced validation hook
  const [validationState, validationActions] = useProfileFormValidation(
    form,
    "professional"
  );

  const handleEdit = () => {
    setIsEditing(true);
    form.reset(getFormData(professionalInfo));
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset(getFormData(professionalInfo));
  };

  const handleSave = async (data: ProfessionalInfoFormData) => {
    if (onSave) {
      const result = await profileState.saveProfessionalInfo(() =>
        onSave(data)
      );
      if (result !== null) {
        setIsEditing(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("tr-TR");
    } catch {
      return dateString;
    }
  };

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    return expiry <= threeMonthsFromNow && expiry > now;
  };

  const isLicenseExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return expiry <= now;
  };

  const getLicenseStatus = (expiryDate: string) => {
    if (isLicenseExpired(expiryDate)) {
      return { status: "expired", color: "destructive", icon: AlertTriangle };
    } else if (isLicenseExpiringSoon(expiryDate)) {
      return { status: "expiring", color: "warning", icon: AlertTriangle };
    } else {
      return { status: "valid", color: "success", icon: CheckCircle };
    }
  };

  const getCertificationStatus = (cert: Certification) => {
    if (!cert.expiryDate) return { status: "permanent", color: "secondary" };

    if (isLicenseExpired(cert.expiryDate)) {
      return { status: "expired", color: "destructive" };
    } else if (isLicenseExpiringSoon(cert.expiryDate)) {
      return { status: "expiring", color: "warning" };
    } else {
      return { status: "valid", color: "success" };
    }
  };

  // Handle specializations input (comma-separated)
  const handleSpecializationsChange = (value: string) => {
    const specializations = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    form.setValue("specializations", specializations);
  };

  const licenseStatus = getLicenseStatus(professionalInfo.licenseExpiry);
  const LicenseIcon = licenseStatus.icon;

  return (
    <ProfileCardErrorBoundary cardName="Mesleki Bilgiler" onRetry={onRetry}>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-[#2c3e50]">
            Mesleki Bilgiler
          </CardTitle>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={isLoading}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Edit2 className="h-4 w-4" />
              Düzenle
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className="space-y-6"
              >
                {/* Error Summary */}
                {validationState.hasErrors &&
                  validationState.submitCount > 0 && (
                    <FormErrorSummary
                      errors={form.formState.errors}
                      title="Lütfen aşağıdaki hataları düzeltin:"
                      dismissible
                      onDismiss={() =>
                        validationActions.toggleErrorSummary(false)
                      }
                    />
                  )}

                {/* License Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Lisans Bilgileri
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lisans Numarası</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="TR-CAP-YYYY-XXXXXX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="licenseExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lisans Bitiş Tarihi</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deneyim Yılı</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Specializations */}
                <FormField
                  control={form.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uzmanlık Alanları</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Lüks Yatlar, Yelken, Derin Deniz Balıkçılığı (virgülle ayırın)"
                          value={field.value.join(", ")}
                          onChange={(e) =>
                            handleSpecializationsChange(e.target.value)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biyografi (İsteğe Bağlı)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Kendinizi ve deneyimlerinizi kısaca tanıtın..."
                          className="min-h-[100px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={profileState.isSaving}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto order-2 sm:order-1"
                  >
                    <X className="h-4 w-4" />
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={profileState.isSaving}
                    className="flex items-center justify-center gap-2 bg-[#3498db] hover:bg-[#2980b9] w-full sm:w-auto order-1 sm:order-2"
                  >
                    <Save className="h-4 w-4" />
                    {profileState.isSaving ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              {/* License Information Display */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lisans Bilgileri
                </h4>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Lisans Numarası
                      </Label>
                      <div className="text-base text-gray-900 font-mono">
                        {professionalInfo.licenseNumber}
                      </div>
                    </div>
                    <Badge
                      variant={licenseStatus.color as any}
                      className="flex items-center gap-1"
                    >
                      <LicenseIcon className="h-3 w-3" />
                      {licenseStatus.status === "expired" && "Süresi Dolmuş"}
                      {licenseStatus.status === "expiring" && "Yakında Dolacak"}
                      {licenseStatus.status === "valid" && "Geçerli"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        Bitiş Tarihi
                      </Label>
                      <div className="text-base text-gray-900">
                        {formatDate(professionalInfo.licenseExpiry)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-gray-500" />
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Deneyim
                  </Label>
                  <div className="text-base text-gray-900">
                    {professionalInfo.yearsOfExperience} yıl
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-600">
                  Uzmanlık Alanları
                </Label>
                <div className="flex flex-wrap gap-2">
                  {professionalInfo.specializations.map(
                    (specialization, index) => (
                      <Badge key={index} variant="secondary">
                        {specialization}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-500" />
                  <Label className="text-sm font-medium text-gray-600">
                    Sertifikalar ({professionalInfo.certifications.length})
                  </Label>
                </div>

                <div className="space-y-3">
                  {professionalInfo.certifications.map((cert) => {
                    const certStatus = getCertificationStatus(cert);
                    return (
                      <div
                        key={cert.id}
                        className="bg-gray-50 p-3 sm:p-4 rounded-lg border-l-4 border-l-blue-500"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                          <div className="space-y-1 flex-1">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              {cert.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              {cert.issuer}
                            </div>
                            {cert.certificateNumber && (
                              <div className="text-xs text-gray-500 font-mono break-all">
                                {cert.certificateNumber}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-row sm:flex-col sm:text-right items-start sm:items-end gap-2 sm:gap-1">
                            <Badge
                              variant={certStatus.color as any}
                              className="text-xs flex-shrink-0"
                            >
                              {certStatus.status === "expired" &&
                                "Süresi Dolmuş"}
                              {certStatus.status === "expiring" &&
                                "Yakında Dolacak"}
                              {certStatus.status === "valid" && "Geçerli"}
                              {certStatus.status === "permanent" && "Süresiz"}
                            </Badge>
                            <div className="text-xs text-gray-500 flex flex-col sm:space-y-1">
                              <div>Verilme: {formatDate(cert.issueDate)}</div>
                              {cert.expiryDate && (
                                <div>Bitiş: {formatDate(cert.expiryDate)}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bio */}
              {professionalInfo.bio && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">
                    Biyografi
                  </Label>
                  <div className="text-base text-gray-900 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {professionalInfo.bio}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </ProfileCardErrorBoundary>
  );
};

export default ProfessionalInfoCard;
