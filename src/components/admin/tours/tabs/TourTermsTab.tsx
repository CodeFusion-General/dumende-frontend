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
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Languages, 
  XCircle, 
  CheckCircle, 
  Info,
  Clock,
  AlertTriangle,
  Globe,
  FileText
} from 'lucide-react';

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
  
  // Mock language data - will be replaced with backend data
  const languages: Array<{ id: string; label: string; flag: string }> = [
    { id: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { id: 'en', label: 'İngilizce', flag: '🇬🇧' },
    { id: 'de', label: 'Almanca', flag: '🇩🇪' },
    { id: 'ru', label: 'Rusça', flag: '🇷🇺' },
    { id: 'fr', label: 'Fransızca', flag: '🇫🇷' },
    { id: 'es', label: 'İspanyolca', flag: '🇪🇸' },
    { id: 'it', label: 'İtalyanca', flag: '🇮🇹' },
    { id: 'ar', label: 'Arapça', flag: '🇸🇦' },
    { id: 'nl', label: 'Hollandaca', flag: '🇳🇱' },
    { id: 'pl', label: 'Lehçe', flag: '🇵🇱' },
  ];

  const handleLanguageChange = (checked: boolean, langId: string) => {
    const newLanguages = checked 
      ? [...data.languages, langId] 
      : data.languages.filter(id => id !== langId);
    
    onChange({ languages: newLanguages });
  };

  const cancellationPolicies: Array<{ 
    id: string; 
    label: string; 
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    { 
      id: 'flexible', 
      label: 'Esnek İptal', 
      description: '24 saat öncesine kadar ücretsiz iptal',
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-green-600 bg-green-50 border-green-200'
    },
    { 
      id: 'moderate', 
      label: 'Orta Düzey', 
      description: '48 saat öncesine kadar %50 iade',
      icon: <Clock className="h-5 w-5" />,
      color: 'text-amber-600 bg-amber-50 border-amber-200'
    },
    { 
      id: 'strict', 
      label: 'Katı İptal', 
      description: '7 gün öncesine kadar %50 iade',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-orange-600 bg-orange-50 border-orange-200'
    },
    { 
      id: 'no_refund', 
      label: 'İade Yok', 
      description: 'İptal durumunda iade yapılmaz',
      icon: <XCircle className="h-5 w-5" />,
      color: 'text-red-600 bg-red-50 border-red-200'
    },
  ];

  const selectedLanguagesCount = data.languages.length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#15847c] to-[#0e5c56] rounded-2xl opacity-10"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#15847c] rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Şartlar ve Politikalar</h2>
          </div>
          <p className="text-gray-600 ml-11">
            Turunuza ilişkin temel şartları ve politikaları burada belirtin. Bu bilgiler müşteri güvenini artırır.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <div className="space-y-6">
          {/* Languages Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <FormLabel className="text-base font-semibold flex items-center gap-2">
                  <Languages className="h-4 w-4 text-[#15847c]" />
                  Desteklenen Diller
                </FormLabel>
                {selectedLanguagesCount > 0 && (
                  <Badge className="bg-[#15847c]/10 text-[#15847c] border-[#15847c]">
                    {selectedLanguagesCount} dil seçili
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                Bu turda rehberlik veya hizmet sağlayabileceğiniz dilleri işaretleyin. Daha fazla dil, daha geniş müşteri kitlesi demektir.
              </p>
              
              {languages.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Dil listesi yükleniyor...</p>
                  <p className="text-sm text-gray-400 mt-1">Entegrasyon tamamlandığında burada görünecek</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {languages.map((language) => (
                    <label
                      key={language.id}
                      className={`
                        relative flex items-center p-4 rounded-lg border-2 cursor-pointer
                        transition-all duration-200 hover:shadow-md
                        ${data.languages.includes(language.id) 
                          ? 'border-[#15847c] bg-[#15847c]/5 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <Checkbox 
                        id={`lang-${language.id}`}
                        checked={data.languages.includes(language.id)}
                        onCheckedChange={(checked) => 
                          handleLanguageChange(checked as boolean, language.id)
                        }
                        className="mr-3"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-2xl">{language.flag}</span>
                        <span className="font-medium text-gray-800">{language.label}</span>
                      </div>
                      {data.languages.includes(language.id) && (
                        <CheckCircle className="h-4 w-4 text-[#15847c] absolute top-2 right-2" />
                      )}
                    </label>
                  ))}
                </div>
              )}
              
              {/* Popular Languages Tip */}
              {languages.length > 0 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Tavsiye:</p>
                      <p>En az Türkçe ve İngilizce seçmenizi öneririz. Rusça ve Almanca da popüler turistik dillerdir.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Cancellation Policy Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="cancellationPolicy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-[#15847c]" />
                    İptal Politikası
                  </FormLabel>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    Müşterilerinizin rezervasyonu iptal etmesi durumunda uygulanacak kuralı seçin. Esnek politikalar daha fazla rezervasyon getirebilir.
                  </p>
                  
                  {cancellationPolicies.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">Politikalar yükleniyor...</p>
                      <p className="text-sm text-gray-400 mt-1">Entegrasyon tamamlandığında burada görünecek</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cancellationPolicies.map((policy) => (
                        <label
                          key={policy.id}
                          className={`
                            relative flex items-start p-4 rounded-lg border-2 cursor-pointer
                            transition-all duration-200 hover:shadow-md
                            ${data.cancellationPolicy === policy.id 
                              ? 'border-[#15847c] bg-[#15847c]/5 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="cancellationPolicy"
                            value={policy.id}
                            checked={data.cancellationPolicy === policy.id}
                            onChange={() => onChange({ cancellationPolicy: policy.id })}
                            className="sr-only"
                          />
                          
                          <div className={`p-2 rounded-lg mr-4 ${policy.color}`}>
                            {policy.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-800">{policy.label}</h4>
                              {data.cancellationPolicy === policy.id && (
                                <CheckCircle className="h-5 w-5 text-[#15847c]" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  <FormMessage />
                  
                  {/* Policy Impact Info */}
                  {data.cancellationPolicy && (
                    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-semibold mb-1">Önemli:</p>
                          <p>Seçtiğiniz iptal politikası tüm rezervasyonlar için geçerli olacaktır. Daha sonra değiştirilebilir.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </Card>
        </div>
      </Form>
    </div>
  );
};

export default TourTermsTab;