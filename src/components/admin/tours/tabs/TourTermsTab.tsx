
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";

interface TourTermsData {
  languages: string[];
  cancellationPolicy: string;
}

interface TourTermsTabProps {
  data: TourTermsData;
  onChange: (data: Partial<TourTermsData>) => void;
}

const TourTermsTab: React.FC<TourTermsTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });
  
  const languages = [
    { id: 'tr', label: 'Türkçe' },
    { id: 'en', label: 'İngilizce' },
    { id: 'de', label: 'Almanca' },
    { id: 'ru', label: 'Rusça' },
    { id: 'fr', label: 'Fransızca' },
    { id: 'es', label: 'İspanyolca' },
    { id: 'ar', label: 'Arapça' },
  ];

  const handleLanguageChange = (checked: boolean, langId: string) => {
    const newLanguages = checked 
      ? [...data.languages, langId] 
      : data.languages.filter(id => id !== langId);
    
    onChange({ languages: newLanguages });
  };

  const cancellationPolicies = [
    { id: 'no-cancellation', label: 'İptal Edilemez' },
    { id: '24h', label: '24 saat öncesine kadar' },
    { id: '3d', label: '3 gün öncesine kadar' },
    { id: '7d', label: '7 gün öncesine kadar' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Şartlar</h2>
      <p className="text-sm text-gray-500">
        Turunuza ilişkin temel şartları ve politikaları burada belirtin.
      </p>
      
      <Form {...form}>
        <div className="space-y-8">
          <div>
            <FormLabel>Desteklenen Diller</FormLabel>
            <p className="text-sm text-gray-500 mb-3">
              Bu turda rehberlik veya hizmet sağlayabileceğiniz dilleri işaretleyin.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {languages.map((language) => (
                <div key={language.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`lang-${language.id}`}
                    checked={data.languages.includes(language.id)}
                    onCheckedChange={(checked) => 
                      handleLanguageChange(checked as boolean, language.id)
                    }
                  />
                  <label 
                    htmlFor={`lang-${language.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {language.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="cancellationPolicy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>İptal Politikası</FormLabel>
                <p className="text-sm text-gray-500 mb-2">
                  Müşterilerinizin rezervasyonu iptal etmesi durumunda uygulanacak kuralı seçin.
                </p>
                <Select
                  value={data.cancellationPolicy}
                  onValueChange={(value) => onChange({ cancellationPolicy: value })}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="İptal politikası seçin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cancellationPolicies.map((policy) => (
                      <SelectItem key={policy.id} value={policy.id}>
                        {policy.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </div>
  );
};

export default TourTermsTab;
