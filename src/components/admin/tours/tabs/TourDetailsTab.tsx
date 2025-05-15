
import React from 'react';
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
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface TourDetailsData {
  category: string;
  boat: string;
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

  // Mock data for boats
  const boats = [
    { id: '1', name: 'Mavi Rüzgar' },
    { id: '2', name: 'Deniz Yıldızı' },
    { id: '3', name: 'Rüzgar Gülü' },
  ];

  // Mock data for tour categories
  const categories = [
    { id: 'private', name: 'Özel Tur' },
    { id: 'sunset', name: 'Günbatımı Turu' },
    { id: 'corporate', name: 'Kurumsal Tur' },
    { id: 'diving', name: 'Dalış Turu' },
    { id: 'fishing', name: 'Balık Avı Turu' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Ana Bilgiler</h2>
      <p className="text-sm text-gray-500">
        Turunuzun temel bilgilerini giriniz. Bu bilgiler müşterilerinize turunuzu tanıtırken kullanılacaktır.
      </p>
      
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekne Turu Kategorisi</FormLabel>
                <Select
                  value={data.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="boat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekne İsmi</FormLabel>
                <Select
                  value={data.boat}
                  onValueChange={(value) => handleInputChange('boat', value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Tekne seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {boats.map((boat) => (
                      <SelectItem key={boat.id} value={boat.id}>
                        {boat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tur Başlığı</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Örn: İstanbul Boğazı Günbatımı Turu" 
                    value={data.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
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
                <FormLabel>Tur Açıklaması (Kısa)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Turunuzu kısaca tanımlayın (maksimum 150 karakter)" 
                    value={data.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    maxLength={150}
                  />
                </FormControl>
                <div className="text-xs text-right text-gray-500 mt-1">
                  {data.description.length}/150
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fullDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tur Tam Açıklama</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Turunuz hakkında detaylı bilgi verin" 
                    value={data.fullDescription}
                    onChange={(e) => handleInputChange('fullDescription', e.target.value)}
                    rows={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Öne Çıkan Noktalar</FormLabel>
            <p className="text-sm text-gray-500 mb-2">
              Turunuzu diğerlerinden ayıran özellikleri ekleyin.
            </p>
            
            <div className="space-y-2">
              {data.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Öne çıkan özellik ${index + 1}`}
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeHighlight(index)}
                    disabled={data.highlights.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHighlight}
                className="mt-2"
                disabled={data.highlights.length >= 5}
              >
                <Plus className="h-4 w-4 mr-1" /> Özellik Ekle
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TourDetailsTab;
