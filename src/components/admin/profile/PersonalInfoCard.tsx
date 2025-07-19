import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormErrorSummary } from "@/components/ui/form-error";
import { PersonalInfo, PersonalInfoFormData } from "@/types/profile.types";
import { personalInfoFormSchema } from "@/lib/validation/profile.schemas";
import { usePersonalInfoState } from "@/hooks/useProfileState";
import { Edit2, Save, X, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { PersonalInfoCardSkeleton } from "./ProfileLoadingSkeletons";
import { ProfileCardErrorBoundary } from "./ProfileErrorBoundary";

interface PersonalInfoCardProps {
  personalInfo?: PersonalInfo;
  onSave?: (data: PersonalInfoFormData) => Promise<void> | void;
  isLoading?: boolean;
  onRetry?: () => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  personalInfo,
  onSave,
  isLoading = false,
  onRetry,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const profileState = usePersonalInfoState();

  // Show loading skeleton if loading or data is missing
  if (isLoading || !personalInfo) {
    return <PersonalInfoCardSkeleton />;
  }

  // Convert PersonalInfo to form data format
  const getFormData = (info: PersonalInfo): PersonalInfoFormData => ({
    firstName: info.firstName,
    lastName: info.lastName,
    email: info.email,
    phone: info.phone,
    dateOfBirth: info.dateOfBirth || "",
    street: info.address?.street || "",
    city: info.address?.city || "",
    district: info.address?.district || "",
    postalCode: info.address?.postalCode || "",
    country: info.address?.country || "",
  });

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoFormSchema),
    defaultValues: getFormData(personalInfo),
    mode: "onChange",
    reValidateMode: "onChange",
  });

  // Simple validation state
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    form.reset(getFormData(personalInfo));
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset(getFormData(personalInfo));
  };

  const handleSave = async (data: PersonalInfoFormData) => {
    if (onSave) {
      const result = await profileState.savePersonalInfo(() => onSave(data));
      if (result !== null) {
        setIsEditing(false);
      }
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR");
    } catch {
      return dateString;
    }
  };

  const formatAddress = (address?: PersonalInfo["address"]) => {
    if (!address) return "";
    const parts = [
      address.street,
      address.district,
      address.city,
      address.postalCode,
      address.country,
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <ProfileCardErrorBoundary cardName="Kişisel Bilgiler" onRetry={onRetry}>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-[#2c3e50]">
            Kişisel Bilgiler
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
                {showErrorSummary &&
                  Object.keys(form.formState.errors).length > 0 && (
                    <FormErrorSummary
                      errors={form.formState.errors}
                      title="Lütfen aşağıdaki hataları düzeltin:"
                      dismissible
                      onDismiss={() => setShowErrorSummary(false)}
                    />
                  )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ad</FormLabel>
                        <FormControl>
                          <Input placeholder="Adınızı girin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soyad</FormLabel>
                        <FormControl>
                          <Input placeholder="Soyadınızı girin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-posta</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ornek@email.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon</FormLabel>
                        <FormControl>
                          <Input placeholder="+90 5XX XXX XX XX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Date of Birth */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doğum Tarihi</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address Fields */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Adres Bilgileri
                  </h4>

                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sokak/Cadde</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Sokak/Cadde bilgisi"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Şehir</FormLabel>
                          <FormControl>
                            <Input placeholder="Şehir" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>İlçe</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="İlçe"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posta Kodu</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Posta Kodu"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ülke</FormLabel>
                        <FormControl>
                          <Input placeholder="Ülke" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
              {/* Name Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    Ad
                  </Label>
                  <div className="text-base text-gray-900">
                    {personalInfo.firstName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    Soyad
                  </Label>
                  <div className="text-base text-gray-900">
                    {personalInfo.lastName}
                  </div>
                </div>
              </div>

              {/* Contact Display */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm font-medium text-gray-600">
                      E-posta
                    </Label>
                    <div className="text-sm sm:text-base text-gray-900 break-all">
                      {personalInfo.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm font-medium text-gray-600">
                      Telefon
                    </Label>
                    <div className="text-sm sm:text-base text-gray-900">
                      {personalInfo.phone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Date of Birth Display */}
              {personalInfo.dateOfBirth && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm font-medium text-gray-600">
                      Doğum Tarihi
                    </Label>
                    <div className="text-sm sm:text-base text-gray-900">
                      {formatDate(personalInfo.dateOfBirth)}
                    </div>
                  </div>
                </div>
              )}

              {/* Address Display */}
              {personalInfo.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Label className="text-sm font-medium text-gray-600">
                      Adres
                    </Label>
                    <div className="text-sm sm:text-base text-gray-900 leading-relaxed">
                      {formatAddress(personalInfo.address)}
                    </div>
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

export default PersonalInfoCard;
