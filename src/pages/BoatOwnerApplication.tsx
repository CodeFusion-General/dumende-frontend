import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Ship, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { UserType } from '@/types/auth.types';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const BoatOwnerApplication = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  const applicationSchema = z.object({
    companyName: z.string().min(2, t.boatOwnerApplication.validation.companyNameMin).optional(),
    taxNumber: z.string().min(10, t.boatOwnerApplication.validation.taxNumberMin).optional(),
    address: z.string().min(10, t.boatOwnerApplication.validation.addressMin).optional(),
    description: z.string().min(50, t.boatOwnerApplication.validation.descriptionMin),
  });

  type ApplicationFormData = z.infer<typeof applicationSchema>;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: '',
      taxNumber: '',
      address: '',
      description: '',
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
      navigate('/');
      return;
    }

    // Mevcut başvuruyu kontrol et
    const checkExistingApplication = async () => {
      try {
        const application = await authService.getMyBoatOwnerApplication();
        setExistingApplication(application);
      } catch (error) {
        console.error('Application check error:', error);
      }
    };

    checkExistingApplication();
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.submitBoatOwnerApplication({
        companyName: data.companyName,
        taxNumber: data.taxNumber,
        address: data.address,
        description: data.description,
        documents: documents ? Array.from(documents) : undefined,
      });

      setSuccess(true);
      
      // Başvuru durumunu yeniden kontrol et
      const application = await authService.getMyBoatOwnerApplication();
      setExistingApplication(application);
      
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />{t.boatOwnerApplication.status.pending}</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />{t.boatOwnerApplication.status.approved}</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />{t.boatOwnerApplication.status.rejected}</Badge>;
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
            <h1 className="text-3xl font-bold mb-2">{t.boatOwnerApplication.title}</h1>
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
                    <p className="font-medium">{t.boatOwnerApplication.applicationStatus.applicationDate}: {new Date(existingApplication.applicationDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}</p>
                    {existingApplication.reviewDate && (
                      <p className="text-sm text-muted-foreground">
                        {t.boatOwnerApplication.applicationStatus.reviewDate}: {new Date(existingApplication.reviewDate).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(existingApplication.status)}
                </div>
                
                {existingApplication.status === 'REJECTED' && existingApplication.rejectionReason && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      <strong>{t.boatOwnerApplication.applicationStatus.rejectionReason}:</strong> {existingApplication.rejectionReason}
                    </AlertDescription>
                  </Alert>
                )}
                
                {existingApplication.status === 'APPROVED' && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      {t.boatOwnerApplication.applicationStatus.approvedMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Başvuru Formu */}
          {!isAuthenticated ? (
            <Card>
              <CardHeader>
                <CardTitle>{t.boatOwnerApplication.loginRequired.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    {t.boatOwnerApplication.loginRequired.message}
                  </AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    {t.boatOwnerApplication.loginRequired.loginButton}
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    variant="outline"
                    className="w-full"
                  >
                    {t.boatOwnerApplication.loginRequired.registerButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (!existingApplication || existingApplication.status === 'REJECTED') && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {existingApplication?.status === 'REJECTED' ? t.boatOwnerApplication.form.newApplicationTitle : t.boatOwnerApplication.form.title}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">{t.boatOwnerApplication.form.companyNameOptional}</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder={t.boatOwnerApplication.form.companyNamePlaceholder}
                        disabled={isSubmitting || isLoading}
                        {...register('companyName')}
                      />
                      {errors.companyName && (
                        <p className="text-sm text-destructive">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxNumber">{t.boatOwnerApplication.form.taxNumberOptional}</Label>
                      <Input
                        id="taxNumber"
                        type="text"
                        placeholder={t.boatOwnerApplication.form.taxNumberPlaceholder}
                        disabled={isSubmitting || isLoading}
                        {...register('taxNumber')}
                      />
                      {errors.taxNumber && (
                        <p className="text-sm text-destructive">
                          {errors.taxNumber.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">{t.boatOwnerApplication.form.addressOptional}</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder={t.boatOwnerApplication.form.addressPlaceholder}
                      disabled={isSubmitting || isLoading}
                      {...register('address')}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t.boatOwnerApplication.form.descriptionRequired}</Label>
                    <Textarea
                      id="description"
                      placeholder={t.boatOwnerApplication.form.descriptionPlaceholder}
                      disabled={isSubmitting || isLoading}
                      {...register('description')}
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documents">{t.boatOwnerApplication.form.documentsOptional}</Label>
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
          )}

          {/* Bilgilendirme */}
          {existingApplication?.status === 'PENDING' && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{t.boatOwnerApplication.reviewProcess.title}</CardTitle>
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