
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
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';

interface TourDatesData {
  duration: {
    hours: number;
    minutes: number;
  };
  capacity: number;
  price: number;
}

interface TourDatesTabProps {
  data: TourDatesData;
  onChange: (data: Partial<TourDatesData>) => void;
}

const TourDatesTab: React.FC<TourDatesTabProps> = ({ data, onChange }) => {
  const form = useForm({
    defaultValues: data,
  });
  
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

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedTimes, setSelectedTimes] = React.useState<string[]>([]);
  const [newTimeInput, setNewTimeInput] = React.useState<string>('');

  const addTime = () => {
    if (newTimeInput && !selectedTimes.includes(newTimeInput)) {
      setSelectedTimes([...selectedTimes, newTimeInput]);
      setNewTimeInput('');
    }
  };

  const removeTime = (timeToRemove: string) => {
    setSelectedTimes(selectedTimes.filter(time => time !== timeToRemove));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Tarih ve Fiyatlandırma</h2>
      <p className="text-sm text-gray-500">
        Turunuzun süresini, kapasitesini ve fiyatlandırmasını belirleyin.
      </p>
      
      <Form {...form}>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <FormField
              control={form.control}
              name="duration.hours"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Tur Süresi (Saat)</FormLabel>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Saat seçin" />
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
                <FormItem className="flex-1">
                  <FormLabel>Tur Süresi (Dakika)</FormLabel>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Dakika seçin" />
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
          
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kapasite (Kişi)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={data.capacity}
                    onChange={(e) => onChange({ capacity: Number(e.target.value) })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kişi Başı Fiyat (₺)</FormLabel>
                <p className="text-sm text-gray-500 mb-2">
                  Bu fiyat dumenden.com komisyonu dahil olarak hesaplanır.
                </p>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={data.price}
                    onChange={(e) => onChange({ price: Number(e.target.value) })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Tarih ve Saat Ekle</FormLabel>
            <p className="text-sm text-gray-500 mb-3">
              Turunuzun yapılacağı tarihleri ve saatleri ekleyin. Her tarih için birden fazla saat seçebilirsiniz.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <div className="mb-4">
                  <FormLabel className="block mb-2">Tarih Seçin</FormLabel>
                  <div className="border rounded-md p-1">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                    />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <div>
                  <FormLabel className="block mb-2">Saat Ekle</FormLabel>
                  <div className="flex mb-4">
                    <Input
                      type="time"
                      value={newTimeInput}
                      onChange={(e) => setNewTimeInput(e.target.value)}
                      className="mr-2"
                    />
                    <Button
                      type="button"
                      onClick={addTime}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-[180px] overflow-y-auto">
                    {selectedTimes.length === 0 ? (
                      <p className="text-sm text-gray-500">Henüz saat eklenmedi</p>
                    ) : (
                      selectedTimes.map((time, index) => (
                        <div 
                          key={index}
                          className="flex justify-between items-center border rounded-md p-2"
                        >
                          <span>{time}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTime(time)}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
                disabled={!selectedDate || selectedTimes.length === 0}
              >
                <CalendarIcon className="h-4 w-4 mr-2" /> Tarihi Ekle
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default TourDatesTab;
