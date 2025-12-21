import React, { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  X, 
  Clock, 
  Users, 
  Info,
  CheckCircle,
  Sparkles,
  Timer,
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TourDateItem {
  startDate: string;
  endDate: string;
  availabilityStatus: string;
  maxGuests: number;
}

interface TourDatesData {
  duration: {
    hours: number;
    minutes: number;
  };
  capacity: number;
  price: number;
  tourDates: TourDateItem[];
}

interface TourDatesTabProps {
  data: TourDatesData;
  onChange: (data: Partial<TourDatesData>) => void;
}

const TourDatesTab: React.FC<TourDatesTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [newTimeInput, setNewTimeInput] = useState<string>('');

  // Parent'tan gelen tourDates'i kullan - artık LOCAL state YOK
  const scheduledDates = data.tourDates || [];

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} saat`
  }));

  // Generate minute options (0, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45].map(min => ({
    value: min,
    label: min === 0 ? '0 dakika' : `${min} dakika`
  }));

  // Suggested times
  const suggestedTimes = ['09:00', '10:00', '14:00', '15:00', '17:00', '18:00'];

  const addTime = () => {
    if (newTimeInput && !selectedTimes.includes(newTimeInput)) {
      setSelectedTimes([...selectedTimes, newTimeInput].sort());
      setNewTimeInput('');
    }
  };

  const removeTime = (timeToRemove: string) => {
    setSelectedTimes(selectedTimes.filter(time => time !== timeToRemove));
  };

  const addScheduledDate = () => {
    if (selectedDate && selectedTimes.length > 0) {
      // Her seçilen saat için ayrı bir TourDateItem oluştur
      const newDates: TourDateItem[] = selectedTimes.map((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const startDate = new Date(selectedDate);
        startDate.setHours(hours, minutes, 0, 0);

        // duration'a göre endDate hesapla
        const durationMs = (data.duration.hours * 60 + data.duration.minutes) * 60 * 1000;
        const endDate = new Date(startDate.getTime() + durationMs);

        return {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          availabilityStatus: 'AVAILABLE',
          maxGuests: data.capacity,
        };
      });

      // Parent'a güncellenmiş tourDates gönder
      onChange({
        tourDates: [...scheduledDates, ...newDates],
      });

      setSelectedTimes([]);
      setSelectedDate(new Date());
    }
  };

  const removeScheduledDate = (index: number) => {
    // Parent'a güncellenmiş tourDates gönder
    onChange({
      tourDates: scheduledDates.filter((_, i) => i !== index),
    });
  };

  // Calculate estimated earnings
  const estimatedEarnings = data.price * data.capacity;
  const commission = estimatedEarnings * 0.15; // 15% commission
  const netEarnings = estimatedEarnings - commission;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#15847c] to-[#0e5c56] rounded-2xl opacity-10"></div>
        <div className="relative p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#15847c] rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Tarih ve Fiyatlandırma</h2>
          </div>
          <p className="text-gray-600 ml-11">
            Turunuzun süresini, kapasitesini, fiyatlandırmasını ve tarihlerini belirleyin.
          </p>
        </div>
      </div>
      
      <Form {...form}>
        <div className="space-y-6">
          {/* Duration and Capacity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Duration Card */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="h-5 w-5 text-[#15847c]" />
                <FormLabel className="text-base font-semibold">Tur Süresi</FormLabel>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="duration.hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-600">Saat</FormLabel>
                      <Select
                        value={String(data.duration.hours)}
                        onValueChange={(value) => onChange({
                          duration: {
                            ...data.duration,
                            hours: Number(value)
                          }
                        })}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors">
                            <SelectValue placeholder="Saat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {hourOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
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
                  name="duration.minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-gray-600">Dakika</FormLabel>
                      <Select
                        value={String(data.duration.minutes)}
                        onValueChange={(value) => onChange({
                          duration: {
                            ...data.duration,
                            minutes: Number(value)
                          }
                        })}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors">
                            <SelectValue placeholder="Dakika" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {minuteOptions.map((option) => (
                            <SelectItem key={option.value} value={String(option.value)}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span>
                    Toplam süre: <strong>{data.duration.hours} saat {data.duration.minutes > 0 && `${data.duration.minutes} dakika`}</strong>
                  </span>
                </div>
              </div>
            </Card>
            
            {/* Capacity Card */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="h-5 w-5 text-[#15847c]" />
                      <FormLabel className="text-base font-semibold">Maksimum Kapasite</FormLabel>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={data.capacity}
                          onChange={(e) => onChange({ capacity: Number(e.target.value) })}
                          className="h-11 pr-16 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors text-lg font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                          kişi
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[10, 15, 20, 25, 30].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onChange({ capacity: num })}
                          className={`hover:bg-[#15847c] hover:text-white hover:border-[#15847c] ${
                            data.capacity === num ? 'bg-[#15847c] text-white border-[#15847c]' : ''
                          }`}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
            </Card>
          </div>
          
          {/* Pricing Card */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[#15847c] text-lg">₺</span>
                      <FormLabel className="text-base font-semibold">Kişi Başı Fiyat</FormLabel>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Komisyon dahil
                    </Badge>
                  </div>
                  
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg">₺</span>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        value={data.price}
                        onChange={(e) => onChange({ price: Number(e.target.value) })}
                        className="h-12 pl-10 text-xl font-semibold border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* Price Suggestions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-600">Önerilen fiyatlar:</span>
                    {[250, 350, 500, 750, 1000].map((price) => (
                      <Button
                        key={price}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onChange({ price })}
                        className="hover:bg-[#15847c] hover:text-white hover:border-[#15847c]"
                      >
                        ₺{price}
                      </Button>
                    ))}
                  </div>
                  
                  {/* Earnings Calculator */}
                  {data.price > 0 && data.capacity > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        Tahmini Kazanç (Tam Kapasite)
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Brüt Gelir:</span>
                          <span className="font-medium">₺{estimatedEarnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Platform Komisyonu (%15):</span>
                          <span className="text-red-600">-₺{commission.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold text-gray-800">Net Kazanç:</span>
                          <span className="font-bold text-green-600 text-lg">₺{netEarnings.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />
          </Card>
          
          {/* Date and Time Selection */}
          <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-[#15847c]" />
                <FormLabel className="text-base font-semibold">Tur Tarihleri ve Saatleri</FormLabel>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Turunuzun yapılacağı tarihleri ve saatleri ekleyin. Her tarih için birden fazla saat seçebilirsiniz.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">1. Tarih Seçin</h4>
                  <div className="border-2 border-gray-200 rounded-lg p-3 hover:border-[#15847c] transition-colors">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-md"
                    />
                  </div>
                  {selectedDate && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Seçili tarih: <strong>{selectedDate.toLocaleDateString('tr-TR')}</strong>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Time Selection */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">2. Saat Ekleyin</h4>
                  
                  {/* Time Input */}
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="time"
                      value={newTimeInput}
                      onChange={(e) => setNewTimeInput(e.target.value)}
                      className="flex-1 h-11 border-2 hover:border-[#15847c] focus:border-[#15847c] transition-colors"
                    />
                    <Button
                      type="button"
                      onClick={addTime}
                      disabled={!newTimeInput}
                      className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Suggested Times */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Hızlı seçim:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTimes.map((time) => (
                        <Button
                          key={time}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!selectedTimes.includes(time)) {
                              setSelectedTimes([...selectedTimes, time].sort());
                            }
                          }}
                          disabled={selectedTimes.includes(time)}
                          className="hover:bg-[#15847c] hover:text-white hover:border-[#15847c]"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Selected Times */}
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedTimes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Henüz saat eklenmedi</p>
                      </div>
                    ) : (
                      selectedTimes.map((time, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center border-2 border-gray-200 rounded-lg p-3 hover:border-[#15847c] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{time}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTime(time)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Add Date Button */}
              <div className="mt-6 flex justify-end">
                <Button
                  type="button"
                  onClick={addScheduledDate}
                  disabled={!selectedDate || selectedTimes.length === 0}
                  className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Tarihi Ekle
                </Button>
              </div>
            </div>
          </Card>
          
          {/* Scheduled Dates List */}
          {scheduledDates.length > 0 && (
            <Card className="p-6 border-0 shadow-lg">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Eklenen Tarihler ({scheduledDates.length})
              </h3>
              <div className="space-y-3">
                {scheduledDates.map((item, index) => {
                  const startDate = new Date(item.startDate);
                  const endDate = new Date(item.endDate);
                  const timeStr = startDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                  const endTimeStr = endDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{startDate.toLocaleDateString('tr-TR')}</span>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {timeStr} - {endTimeStr}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                          {item.maxGuests} kişi
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScheduledDate(index)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">Önemli Bilgiler</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Fiyatlar dumenden.com komisyonu dahil olarak hesaplanır</li>
                  <li>Tarihler daha sonra düzenlenebilir veya iptal edilebilir</li>
                  <li>Popüler saatler genellikle sabah 10:00 ve öğleden sonra 14:00'tür</li>
                  <li>Günbatımı turları için 17:00-18:00 arası ideal saatlerdir</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TourDatesTab;