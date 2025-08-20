import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Ship,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/auth.types";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { captainApplicationService } from "@/services/captainApplicationService";
import type {
  CaptainApplication,
  CaptainApplicationStatus,
  CompanyInfo,
} from "@/types/captain.types";
import {
  CONTRACT_APPROVAL_TEXT,
  CONTRACT_VERSION,
} from "@/utils/contractTexts";
import { ContractModal } from "@/components/ui/contract-modal";
import { getBrowserInfo } from "@/utils/browserInfo";

const BoatOwnerApplication = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const applicationSchema = z.object({
    licenseNumber: z
      .string()
      .min(3, "Lisans numarası en az 3 karakter olmalıdır"),
    licenseExpiry: z.string().min(10, "Lisans bitiş tarihi zorunludur"),
    yearsOfExperience: z.coerce
      .number()
      .min(0, "Deneyim yılı 0 veya daha büyük olmalıdır"),
    specializationsInput: z.string().optional(), // virgülle ayrılmış
    bio: z.string().min(30, "Biyografi en az 30 karakter olmalıdır"),
    // Şirket alanları opsiyonel; toggle açık ise kontrol edilecek
    includeCompany: z.boolean().optional(),
    company_legalName: z.string().optional(),
    company_taxNumber: z.string().optional(),
    company_taxOffice: z.string().optional(),
    company_authorizedPerson: z.string().optional(),
    company_companyEmail: z
      .string()
      .email("Geçerli bir e-posta giriniz")
      .optional(),
    company_nationalIdNumber: z.string().optional(),
    company_mobilePhone: z.string().optional(),
    company_landlinePhone: z.string().optional(),
    company_billingAddress: z.string().optional(),
    company_iban: z.string().optional(),
    // Sözleşme onayı (zorunlu)
    contractApproved: z.boolean().refine((val) => val === true, {
      message: "Sözleşmeyi kabul etmelisiniz",
    }),
  });

  type ApplicationFormData = z.infer<typeof applicationSchema>;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [existingApplication, setExistingApplication] =
    useState<CaptainApplication | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      licenseNumber: "",
      licenseExpiry: "",
      yearsOfExperience: 0,
      specializationsInput: "",
      bio: "",
      includeCompany: false,
      company_legalName: "",
      company_taxNumber: "",
      company_taxOffice: "",
      company_authorizedPerson: "",
      company_companyEmail: "",
      company_nationalIdNumber: "",
      company_mobilePhone: "",
      company_landlinePhone: "",
      company_billingAddress: "",
      company_iban: "",
      contractApproved: false,
    },
  });

  useEffect(() => {
    // Authenticated olmayan kullanıcılar da sayfayı görebilir
    // Ama form doldurmak için login olması gerekir
    if (!isAuthenticated) {
      return;
    }

    // Sadece CUSTOMER rolündeki kullanıcılar başvuru yapabilir
    // BOAT_OWNER veya ADMIN zaten boat owner oldukları için başvuru yapamaz
    if (user?.role !== UserType.CUSTOMER) {
      navigate("/");
      return;
    }

    // Mevcut başvuruyu kontrol et
    const checkExistingApplication = async () => {
      try {
        const application = await captainApplicationService.getMyLatest();
        setExistingApplication(application);
      } catch (error) {
        console.error("Application check error:", error);
      }
    };

    checkExistingApplication();
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error("Kullanıcı bulunamadı");
      }

      const specializations = (data.specializationsInput || "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      let company: CompanyInfo | undefined = undefined;
      if (data.includeCompany) {
        company = {
          legalName: data.company_legalName || "",
          displayName: data.company_legalName || "",
          taxNumber: data.company_taxNumber || "",
          taxOffice: data.company_taxOffice || "",
          authorizedPerson: data.company_authorizedPerson || "",
          companyEmail: data.company_companyEmail || "",
          nationalIdNumber: data.company_nationalIdNumber || "",
          mobilePhone: data.company_mobilePhone || "",
          landlinePhone: data.company_landlinePhone || "",
          billingAddress: data.company_billingAddress || "",
          iban: data.company_iban || "",
        };
      }

      const payload = {
        userId: user.id,
        licenseNumber: data.licenseNumber,
        licenseExpiry: data.licenseExpiry,
        yearsOfExperience: data.yearsOfExperience,
        specializations,
        bio: data.bio,
        documents: documents ? Array.from(documents) : undefined,
        company,
        contractApproved: data.contractApproved,
        contractVersion: CONTRACT_VERSION,
      };

      const created = await captainApplicationService.createMultipart(payload);

      setSuccess(true);

      // Başvuru durumunu yeniden kontrol et
      setExistingApplication(created);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          t.boatOwnerApplication.form.error
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments(e.target.files);
    }
  };

  const getStatusBadge = (status: CaptainApplicationStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary">
            <Clock className="w-4 h-4 mr-1" />
            {t.boatOwnerApplication.status.pending}
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-4 h-4 mr-1" />
            {t.boatOwnerApplication.status.approved}
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive">
            <XCircle className="w-4 h-4 mr-1" />
            {t.boatOwnerApplication.status.rejected}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Sadece CUSTOMER olmayan authenticated kullanıcıları engelle
  // (BOAT_OWNER veya ADMIN zaten boat owner oldukları için başvuru yapamaz)
  if (isAuthenticated && user?.role !== UserType.CUSTOMER) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Ship className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {t.boatOwnerApplication.title}
            </h1>
            <p className="text-muted-foreground">
              {t.boatOwnerApplication.subtitle}
            </p>
          </div>

          {/* Mevcut Başvuru Durumu */}
          {existingApplication && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  {t.boatOwnerApplication.applicationStatus.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {t.boatOwnerApplication.applicationStatus.applicationDate}
                      :{" "}
                      {new Date(
                        existingApplication.createdAt
                      ).toLocaleDateString(
                        language === "tr" ? "tr-TR" : "en-US"
                      )}
                    </p>
                    {existingApplication.updatedAt &&
                      existingApplication.status !== "PENDING" && (
                        <p className="text-sm text-muted-foreground">
                          {t.boatOwnerApplication.applicationStatus.reviewDate}:{" "}
                          {new Date(
                            existingApplication.updatedAt
                          ).toLocaleDateString(
                            language === "tr" ? "tr-TR" : "en-US"
                          )}
                        </p>
                      )}
                  </div>
                  {getStatusBadge(existingApplication.status)}
                </div>

                {existingApplication.status === "REJECTED" &&
                  existingApplication.rejectionReason && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertDescription>
                        <strong>
                          {
                            t.boatOwnerApplication.applicationStatus
                              .rejectionReason
                          }
                          :
                        </strong>{" "}
                        {existingApplication.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  )}

                {existingApplication.status === "APPROVED" && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      {t.boatOwnerApplication.applicationStatus.approvedMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {existingApplication.documentFilePaths?.length ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Yüklenen Belgeler
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {existingApplication.documentFilePaths.map((p, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="truncate max-w-xs"
                          title={p}
                        >
                          {p.split("/").pop()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Başvuru Formu */}
          {!isAuthenticated ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {t.boatOwnerApplication.loginRequired.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    {t.boatOwnerApplication.loginRequired.message}
                  </AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                  <Button onClick={() => navigate("/login")} className="w-full">
                    {t.boatOwnerApplication.loginRequired.loginButton}
                  </Button>
                  <Button
                    onClick={() => navigate("/register")}
                    variant="outline"
                    className="w-full"
                  >
                    {t.boatOwnerApplication.loginRequired.registerButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            (!existingApplication ||
              existingApplication.status === "REJECTED") && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {existingApplication?.status === "REJECTED"
                      ? t.boatOwnerApplication.form.newApplicationTitle
                      : t.boatOwnerApplication.form.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert>
                        <AlertDescription>
                          {t.boatOwnerApplication.form.success}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Profesyonel Bilgiler */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">Lisans Numarası</Label>
                        <Input
                          id="licenseNumber"
                          type="text"
                          placeholder="Örn: ABC-12345"
                          disabled={isSubmitting || isLoading}
                          {...register("licenseNumber")}
                        />
                        {errors.licenseNumber && (
                          <p className="text-sm text-destructive">
                            {errors.licenseNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseExpiry">
                          Lisans Bitiş Tarihi
                        </Label>
                        <Input
                          id="licenseExpiry"
                          type="date"
                          disabled={isSubmitting || isLoading}
                          {...register("licenseExpiry")}
                        />
                        {errors.licenseExpiry && (
                          <p className="text-sm text-destructive">
                            {errors.licenseExpiry.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="yearsOfExperience">Deneyim Yılı</Label>
                        <Input
                          id="yearsOfExperience"
                          type="number"
                          min={0}
                          placeholder="Örn: 5"
                          disabled={isSubmitting || isLoading}
                          {...register("yearsOfExperience")}
                        />
                        {errors.yearsOfExperience && (
                          <p className="text-sm text-destructive">
                            {errors.yearsOfExperience.message as string}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specializationsInput">
                          Uzmanlıklar (virgülle ayırın)
                        </Label>
                        <Input
                          id="specializationsInput"
                          type="text"
                          placeholder="Örn: Yat, Gulet, Balıkçılık"
                          disabled={isSubmitting || isLoading}
                          {...register("specializationsInput")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biyografi</Label>
                      <Textarea
                        id="bio"
                        placeholder="Kendiniz ve tecrübeleriniz hakkında bilgi verin"
                        disabled={isSubmitting || isLoading}
                        {...register("bio")}
                        rows={4}
                      />
                      {errors.bio && (
                        <p className="text-sm text-destructive">
                          {errors.bio.message}
                        </p>
                      )}
                    </div>

                    {/* Şirket Bilgileri (opsiyonel) */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          id="includeCompany"
                          type="checkbox"
                          {...register("includeCompany")}
                        />
                        <Label htmlFor="includeCompany">
                          Şirket Bilgilerini Eklemek İstiyorum (opsiyonel)
                        </Label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="company_legalName">Cari Ünvan</Label>
                          <Input
                            id="company_legalName"
                            type="text"
                            placeholder="Örn: ABC Turizm Ltd. Şti."
                            disabled={isSubmitting || isLoading}
                            {...register("company_legalName")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_taxNumber">Vergi No</Label>
                          <Input
                            id="company_taxNumber"
                            type="text"
                            placeholder="Vergi numarası"
                            disabled={isSubmitting || isLoading}
                            {...register("company_taxNumber")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_taxOffice">
                            Vergi Dairesi
                          </Label>
                          <Input
                            id="company_taxOffice"
                            type="text"
                            placeholder="Vergi dairesi"
                            disabled={isSubmitting || isLoading}
                            {...register("company_taxOffice")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_authorizedPerson">
                            Yetkili Kişi
                          </Label>
                          <Input
                            id="company_authorizedPerson"
                            type="text"
                            placeholder="Ad Soyad"
                            disabled={isSubmitting || isLoading}
                            {...register("company_authorizedPerson")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_companyEmail">
                            Şirket E-postası
                          </Label>
                          <Input
                            id="company_companyEmail"
                            type="email"
                            placeholder="ornek@firma.com"
                            disabled={isSubmitting || isLoading}
                            {...register("company_companyEmail")}
                          />
                          {errors.company_companyEmail && (
                            <p className="text-sm text-destructive">
                              {errors.company_companyEmail.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_mobilePhone">
                            Cep Telefonu
                          </Label>
                          <Input
                            id="company_mobilePhone"
                            type="text"
                            placeholder="05xx xxx xx xx"
                            disabled={isSubmitting || isLoading}
                            {...register("company_mobilePhone")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_landlinePhone">
                            Sabit Telefon (opsiyonel)
                          </Label>
                          <Input
                            id="company_landlinePhone"
                            type="text"
                            placeholder="0xxx xxx xx xx"
                            disabled={isSubmitting || isLoading}
                            {...register("company_landlinePhone")}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company_billingAddress">
                            Fatura Adresi
                          </Label>
                          <Input
                            id="company_billingAddress"
                            type="text"
                            placeholder="Adres"
                            disabled={isSubmitting || isLoading}
                            {...register("company_billingAddress")}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="company_iban">IBAN</Label>
                          <Input
                            id="company_iban"
                            type="text"
                            placeholder="TR.."
                            disabled={isSubmitting || isLoading}
                            {...register("company_iban")}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Tekne Sahibi Hizmet Sözleşmesi */}
                    <div className="space-y-4 border rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Tekne Sahibi Hizmet Sözleşmesi
                          </h3>
                          <p className="text-sm text-gray-600">
                            Başvuru yapmadan önce sözleşmeyi incelemeniz
                            gerekmektedir
                          </p>
                        </div>
                      </div>

                      {/* Sözleşme Görüntüleme Butonu */}
                      <div className="flex justify-center mb-4">
                        <ContractModal contractType="boat-owner">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-2 bg-white hover:bg-blue-50 border-blue-200"
                          >
                            <FileText className="h-4 w-4" />
                            📄 Tekne Sahibi Sözleşmesini Görüntüle
                          </Button>
                        </ContractModal>
                      </div>

                      {/* Sözleşme Onay Kutusu */}
                      <div className="space-y-3 pt-4 border-t border-blue-200">
                        <div className="flex items-start space-x-3">
                          <input
                            id="contractApproved"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 mt-1 accent-blue-600"
                            disabled={isSubmitting || isLoading}
                            {...register("contractApproved")}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor="contractApproved"
                              className="text-sm leading-relaxed cursor-pointer text-gray-700"
                            >
                              {CONTRACT_APPROVAL_TEXT}
                            </Label>
                          </div>
                        </div>
                        {errors.contractApproved && (
                          <p className="text-sm text-destructive">
                            {errors.contractApproved.message}
                          </p>
                        )}
                        <div className="bg-white p-3 rounded-lg border border-blue-200">
                          <p className="text-xs text-gray-600">
                            <strong>Sözleşme Bilgileri:</strong>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            • Versiyon: {CONTRACT_VERSION}
                          </p>
                          <p className="text-xs text-gray-600">
                            • Onay Tarihi:{" "}
                            {new Date().toLocaleDateString("tr-TR")}
                          </p>
                          <p className="text-xs text-gray-600">
                            • Elektronik imza ile geçerlidir
                          </p>
                          <p className="text-xs text-blue-600 mt-2">
                            ℹ️ Bu sözleşme tekne sahipleri için özel olarak
                            hazırlanmıştır
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documents">
                        {t.boatOwnerApplication.form.documentsOptional}
                      </Label>
                      <Input
                        id="documents"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isSubmitting || isLoading}
                        onChange={handleDocumentChange}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t.boatOwnerApplication.form.documentsDescription}
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.boatOwnerApplication.form.submitting}
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          {t.boatOwnerApplication.form.submit}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )
          )}

          {/* Bilgilendirme */}
          {existingApplication?.status === "PENDING" && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>
                  {t.boatOwnerApplication.reviewProcess.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{t.boatOwnerApplication.reviewProcess.info1}</p>
                  <p>{t.boatOwnerApplication.reviewProcess.info2}</p>
                  <p>{t.boatOwnerApplication.reviewProcess.info3}</p>
                  <p>{t.boatOwnerApplication.reviewProcess.info4}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BoatOwnerApplication;
