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

const applicationSchema = z.object({
  companyName: z.string().min(2, 'Şirket adı en az 2 karakter olmalıdır').optional(),
  taxNumber: z.string().min(10, 'Vergi numarası en az 10 karakter olmalıdır').optional(),
  address: z.string().min(10, 'Adres en az 10 karakter olmalıdır').optional(),
  description: z.string().min(50, 'Açıklama en az 50 karakter olmalıdır'),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const BoatOwnerApplication = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

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
        console.error('Başvuru kontrolü hatası:', error);
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
        'Başvuru gönderilirken bir hata oluştu'
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
        return <Badge variant="secondary"><Clock className="w-4 h-4 mr-1" />Değerlendiriliyor</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Onaylandı</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-4 h-4 mr-1" />Reddedildi</Badge>;
      default:
        return null;
    }
  };

  if (!isAuthenticated || user?.role !== UserType.CUSTOMER) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Ship className="w-16 h-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Tekne Sahibi Başvurusu</h1>
            <p className="text-muted-foreground">
              Tekne sahibi olmak için başvurunuzu tamamlayın
            </p>
          </div>

          {/* Mevcut Başvuru Durumu */}
          {existingApplication && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ship className="w-5 h-5" />
                  Başvuru Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Başvuru Tarihi: {new Date(existingApplication.applicationDate).toLocaleDateString('tr-TR')}</p>
                    {existingApplication.reviewDate && (
                      <p className="text-sm text-muted-foreground">
                        Değerlendirme Tarihi: {new Date(existingApplication.reviewDate).toLocaleDateString('tr-TR')}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(existingApplication.status)}
                </div>
                
                {existingApplication.status === 'REJECTED' && existingApplication.rejectionReason && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      <strong>Ret Sebebi:</strong> {existingApplication.rejectionReason}
                    </AlertDescription>
                  </Alert>
                )}
                
                {existingApplication.status === 'APPROVED' && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      Başvurunuz onaylandı! Artık tekne sahibi olarak platform üzerinde işlem yapabilirsiniz.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Başvuru Formu */}
          {(!existingApplication || existingApplication.status === 'REJECTED') && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {existingApplication?.status === 'REJECTED' ? 'Yeni Başvuru' : 'Başvuru Formu'}
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
                        Başvurunuz başarıyla gönderildi! Değerlendirme süreci hakkında e-posta ile bilgilendirileceksiniz.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Şirket Adı (Opsiyonel)</Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Şirket adınız"
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
                      <Label htmlFor="taxNumber">Vergi Numarası (Opsiyonel)</Label>
                      <Input
                        id="taxNumber"
                        type="text"
                        placeholder="Vergi numaranız"
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
                    <Label htmlFor="address">Adres (Opsiyonel)</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Adresiniz"
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
                    <Label htmlFor="description">Açıklama *</Label>
                    <Textarea
                      id="description"
                      placeholder="Kendinizi ve tekne sahibi olmak isteme nedeninizi açıklayın..."
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
                    <Label htmlFor="documents">Belgeler (Opsiyonel)</Label>
                    <Input
                      id="documents"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={isSubmitting || isLoading}
                      onChange={handleDocumentChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Kimlik, tekne ruhsatı vb. belgelerinizi yükleyebilirsiniz. (PDF, JPG, PNG formatında)
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
                        Başvuru gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Başvuruyu Gönder
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
                <CardTitle>Değerlendirme Süreci</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Başvurunuz en geç 3 iş günü içinde değerlendirilecektir.</p>
                  <p>• Değerlendirme sonucu e-posta ile bildirilecektir.</p>
                  <p>• Başvuru durumunuzu bu sayfadan takip edebilirsiniz.</p>
                  <p>• Sorularınız için destek ekibimizle iletişime geçebilirsiniz.</p>
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