
import React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';

interface TourAdditionalInfoData {
  included: string;
  requirements: string;
  notAllowed: string;
  notSuitableFor: string;
}

interface TourAdditionalInfoTabProps {
  data: TourAdditionalInfoData;
  onChange: (data: Partial<TourAdditionalInfoData>) => void;
}

const TourAdditionalInfoTab: React.FC<TourAdditionalInfoTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Ek Bilgiler</h2>
        <p className="text-sm text-gray-500">
          Bu alandaki bilgiler Türkçe olarak alınacaktır.
        </p>
      </div>
      
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="included"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Neler Dahil?</FormLabel>
                <p className="text-sm text-gray-500 mb-2">
                  Tur fiyatına dahil olan hizmetleri ve ekipmanları belirtin. (Örn: Yemek, içecek, ekipmanlar)
                </p>
                <FormControl>
                  <Textarea 
                    placeholder="Örn: Öğle yemeği, alkolsüz içecekler, şnorkel ekipmanı, havlular..." 
                    value={data.included}
                    onChange={(e) => onChange({ included: e.target.value })}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Müşterinin Bilmesi Gerekenler</FormLabel>
                <p className="text-sm text-gray-500 mb-2">
                  Tura katılacak kişilerin önceden bilmesi gereken önemli hususları, yanlarında getirmeleri gereken eşyaları ve diğer önerileri yazın.
                </p>
                <FormControl>
                  <Textarea 
                    placeholder="Örn: Yüzme bilmek zorunludur. Güneş kremi ve şapka getirin. Rüzgarlı havalarda hafif bir ceket önerilir." 
                    value={data.requirements}
                    onChange={(e) => onChange({ requirements: e.target.value })}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notAllowed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İzin Verilmeyen Şeyler</FormLabel>
                <p className="text-sm text-gray-500 mb-2">
                  Tur sırasında izin verilmeyen davranışları ve getirilmemesi gereken eşyaları belirtin.
                </p>
                <FormControl>
                  <Textarea 
                    placeholder="Örn: Teknede sigara içilmez. Yüksek sesli müzik çalınamaz. Cam eşya getirilmemelidir." 
                    value={data.notAllowed}
                    onChange={(e) => onChange({ notAllowed: e.target.value })}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notSuitableFor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kimler için uygun değil?</FormLabel>
                <p className="text-sm text-gray-500 mb-2">
                  Tura katılım için yaş sınırı, fiziksel gereksinimler veya sağlık kısıtlamaları varsa belirtin.
                </p>
                <FormControl>
                  <Textarea 
                    placeholder="Örn: 3 yaşından küçük çocuklar için uygun değildir. Hareket kısıtlılığı olan kişiler için uygun değildir." 
                    value={data.notSuitableFor}
                    onChange={(e) => onChange({ notSuitableFor: e.target.value })}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
};

export default TourAdditionalInfoTab;
