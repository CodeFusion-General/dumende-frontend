import React, { useEffect, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  Sparkles, 
  Tag, 
  FileText, 
  Info,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { tourService } from '@/services/tourService';
import { TourType } from '@/types/tour.types';

interface TourDetailsData {
  category: string;
  title: string;
  description: string;
  fullDescription: string;
  highlights: string[];
}

interface TourDetailsTabProps {
  data: TourDetailsData;
  onChange: (data: Partial<TourDetailsData>) => void;
}

const TourDetailsTab: React.FC<TourDetailsTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });

  const handleInputChange = (field: keyof TourDetailsData, value: any) => {
    onChange({ [field]: value });
  };

  const addHighlight = () => {
    const newHighlights = [...data.highlights, ''];
    onChange({ highlights: newHighlights });
  };

  const removeHighlight = (index: number) => {
    const newHighlights = data.highlights.filter((_, i) => i !== index);
    onChange({ highlights: newHighlights });
  };

  const updateHighlight = (index: number, value: string) => {
    const newHighlights = [...data.highlights];
    newHighlights[index] = value;
    onChange({ highlights: newHighlights });
  };

  // Tour types from backend
  const [types, setTypes] = useState<string[]>([]);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [typesError, setTypesError] = useState<string | null>(null);

  useEffect(() => {
    const loadTypes = async () => {
      try {
        setLoadingTypes(true);
        setTypesError(null);
        const result = await tourService.getTourTypes();
        setTypes(result);
      } catch (e) {
        setTypesError('Tur tipleri yüklenemedi');
        setTypes(Object.values(TourType));
      } finally {
        setLoadingTypes(false);
      }
    };
    loadTypes();
  }, []);

  // Character count for inputs
  const descriptionLength = data.description.length;
  const titleLength = data.title.length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#15847c] to-[#0e5c56] rounded-2xl opacity-10"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#15847c] rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Ana Bilgiler</h2>
          </div>
          <p className="text-gray-600 ml-11">
            Turunuzun temel bilgilerini giriniz. Bu bilgiler müşterilerinize turunuzu tanıtırken kullanılacaktır.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <div className="space-y-6">
          {/* Tour Type Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-3">
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#15847c]" />
                      Tur Tipi
                    </FormLabel>
                    {loadingTypes && (
                      <Loader2 className="h-4 w-4 animate-spin text-[#15847c]" />
                    )}
                  </div>
                  <Select
                    value={data.category}
                    onValueChange={(value) => handleInputChange('category', value)}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors">
                        <SelectValue placeholder={loadingTypes ? 'Yükleniyor...' : 'Tur tipi seçiniz'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem 
                          key={type} 
                          value={type}
                          className="py-3 hover:bg-[#15847c]/10 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-[#15847c]" />
                            {type}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {typesError && (
                    <div className="flex items-center gap-2 mt-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{typesError}</span>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
          
          {/* Title and Description Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#15847c]" />
                      Tur Başlığı
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Örn: İstanbul Boğazı Günbatımı Turu" 
                          value={data.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          className="h-12 pr-16 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                          maxLength={100}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Badge 
                            variant="outline" 
                            className={`${titleLength > 80 ? 'text-amber-600 border-amber-600' : 'text-gray-500'}`}
                          >
                            {titleLength}/100
                          </Badge>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4 text-[#15847c]" />
                      Kısa Açıklama
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea 
                          placeholder="Turunuzu kısaca tanımlayın (maksimum 150 karakter)" 
                          value={data.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={3}
                          maxLength={150}
                          className="border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors resize-none"
                        />
                        <div className="absolute bottom-2 right-2">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-gray-200 rounded-full w-20 overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  descriptionLength > 120 ? 'bg-amber-500' : 'bg-[#15847c]'
                                }`}
                                style={{ width: `${(descriptionLength / 150) * 100}%` }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${
                              descriptionLength > 120 ? 'text-amber-600' : 'text-gray-500'
                            }`}>
                              {descriptionLength}/150
                            </span>
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#15847c]" />
                      Detaylı Açıklama
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Turunuz hakkında detaylı bilgi verin. Rotayı, deneyimleri ve özel anları anlatın..." 
                        value={data.fullDescription}
                        onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                        rows={8}
                        className="border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
          
          {/* Highlights Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              <FormLabel className="text-base font-semibold flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-[#15847c]" />
                Öne Çıkan Noktalar
              </FormLabel>
              <p className="text-sm text-gray-600 mb-6">
                Turunuzu diğerlerinden ayıran özellikleri ekleyin. En fazla 5 özellik ekleyebilirsiniz.
              </p>
              
              <div className="space-y-3">
                {data.highlights.map((highlight, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 group animate-in slide-in-from-bottom duration-300"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#15847c]/10 text-[#15847c] font-semibold text-sm">
                      {index + 1}
                    </div>
                    <Input
                      placeholder={`Örn: ${
                        index === 0 ? 'Profesyonel kaptan eşliğinde' : 
                        index === 1 ? 'Yüzme molaları' : 
                        'Özel bir özellik ekleyin'
                      }`}
                      value={highlight}
                      onChange={(e) => updateHighlight(index, e.target.value)}
                      className="flex-1 h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHighlight(index)}
                      disabled={data.highlights.length <= 1}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {data.highlights.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addHighlight}
                    className="w-full h-11 border-2 border-dashed border-gray-300 hover:border-[#15847c] hover:bg-[#15847c]/5 transition-all duration-300 group"
                  >
                    <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" /> 
                    Yeni Özellik Ekle ({data.highlights.length}/5)
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Form>
    </div>
  );
};

export default TourDetailsTab;