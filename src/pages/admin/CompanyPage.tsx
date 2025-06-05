import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CaptainLayout from "@/components/admin/layout/CaptainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { companyService } from "@/services/companyService";

/* Backend hazır olduğunda kullanılacak interface:
interface CompanyDetails {
  legalName: string;
  displayName: string;
  taxNumber: string;
  taxOffice: string;
  authorizedPerson: string;
  companyEmail: string;
  nationalIdNumber: string;
  mobilePhone: string;
  landlinePhone?: string;
  billingAddress: string;
  iban: string;
}
*/

// Define form schema with validation rules
const companyFormSchema = z.object({
  legalName: z.string().min(1, { message: "Cari Ünvanı boş bırakılamaz." }),
  displayName: z
    .string()
    .min(1, { message: "Gösterilecek şirket ismi boş bırakılamaz." }),
  taxNumber: z.string().min(1, { message: "Vergi numarası boş bırakılamaz." }),
  taxOffice: z.string().min(1, { message: "Vergi dairesi boş bırakılamaz." }),
  authorizedPerson: z
    .string()
    .min(1, { message: "Yetkili kişi boş bırakılamaz." }),
  companyEmail: z
    .string()
    .email({ message: "Geçerli bir e-posta adresi giriniz." }),
  nationalIdNumber: z
    .string()
    .min(11, { message: "TC Kimlik numarası 11 haneli olmalıdır." })
    .max(11),
  mobilePhone: z
    .string()
    .min(10, { message: "Geçerli bir telefon numarası giriniz." }),
  landlinePhone: z
    .string()
    .max(20, { message: "Telefon numarası en fazla 20 karakter olmalıdır." })
    .optional(),
  billingAddress: z
    .string()
    .min(5, { message: "Fatura adresi boş bırakılamaz." }),
  iban: z
    .string()
    .min(15, { message: "IBAN numarası en az 15 karakter olmalıdır." })
    .max(35, { message: "IBAN numarası en fazla 35 karakter olmalıdır." }),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const CompanyPage: React.FC = () => {
  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  */

  // Initialize form with default values
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      legalName: "",
      displayName: "",
      taxNumber: "",
      taxOffice: "",
      authorizedPerson: "",
      companyEmail: "",
      nationalIdNumber: "",
      mobilePhone: "",
      landlinePhone: "",
      billingAddress: "",
      iban: "",
    },
  });

  /* Backend hazır olduğunda kullanılacak useEffect:
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const response = await companyService.getCompanyDetails();
        form.reset(response);
      } catch (error) {
        console.error('Failed to fetch company details:', error);
        setError('Şirket bilgileri yüklenirken bir hata oluştu.');
        toast({
          title: "Hata",
          description: "Şirket bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [form]);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      setLoading(true);
      await companyService.updateCompanyDetails(data);
      toast({
        title: "Başarılı",
        description: "Şirket bilgileri güncellendi.",
      });
    } catch (error) {
      console.error('Failed to update company details:', error);
      toast({
        title: "Hata",
        description: "Şirket bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  */

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      setLoading(true);

      // TODO: Replace with actual logged-in user ID
      const currentUserId = 1; // Geçici olarak sabit değer

      await companyService.updateUserCompany(currentUserId, data as any);

      toast({
        title: "Başarılı",
        description: "Şirket bilgileri başarıyla güncellendi.",
      });
    } catch (error) {
      console.error("Company update error:", error);
      toast({
        title: "Hata",
        description: "Şirket bilgileri güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Şirketim</h1>
          <p className="text-muted-foreground">
            Şirket bilgilerinizi güncelleyebilir ve ödeme alabilmek için gerekli
            bilgileri girebilirsiniz.
          </p>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-700 text-sm">
            Ödemelerinizi alabilmeniz için, eğer şahıs şirketiyseniz Cari
            Ünvanım kısmına vergi levhanızda bulunan Ad Soyad kısmını giriniz,
            eğer özel şirket sahibiyseniz (LTD, A.Ş.) Ticaret Ünvanı kısmını
            giriniz. Ayrıca, ödemeler banka hesabınıza yatacağından dolayı IBAN
            kısmına şirketinizin IBAN bilgisini girmeyi unutmayınız.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cari Ünvanı</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Müşteriye Gözükecek Şirket İsmi</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi Numarası</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taxOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi Dairesi</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="authorizedPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yetkili Kişi</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şirket E-Postası</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationalIdNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TC Kimlik Numarası</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobilePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cep Telefon Numarası</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="landlinePhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sabit Telefon Numarası (Opsiyonel)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Örn: 02121234567"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iban"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IBAN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Örn: TR330006100519786457841326"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="billingAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fatura Adresi</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#2ecc71] hover:bg-[#27ae60]"
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CaptainLayout>
  );
};

export default CompanyPage;
