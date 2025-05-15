
import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ReviewsFilterProps {
  sorting: string;
  onSortingChange: (value: string) => void;
  filters: {
    fiveStars: boolean;
    fourStars: boolean;
    threeStars: boolean;
    twoStars: boolean;
    oneStars: boolean;
  };
  onFilterChange: (name: string, checked: boolean) => void;
  onResetFilters: () => void;
}

const ReviewsFilter: React.FC<ReviewsFilterProps> = ({
  sorting,
  onSortingChange,
  filters,
  onFilterChange,
  onResetFilters
}) => {
  return (
    <div className="bg-white p-6 border rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-2">Sırala</h3>
          <Select value={sorting} onValueChange={onSortingChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Sıralama seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En yeni</SelectItem>
              <SelectItem value="highest">En yüksek puan</SelectItem>
              <SelectItem value="lowest">En düşük puan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-2">
          <h3 className="text-sm font-medium mb-2">Yıldız Sayısı</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fiveStars" 
                checked={filters.fiveStars} 
                onCheckedChange={(checked) => onFilterChange('fiveStars', !!checked)} 
              />
              <Label htmlFor="fiveStars" className="flex items-center">
                <span>5</span>
                <Star className="w-3.5 h-3.5 ml-1 text-yellow-400 fill-yellow-400" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fourStars" 
                checked={filters.fourStars} 
                onCheckedChange={(checked) => onFilterChange('fourStars', !!checked)} 
              />
              <Label htmlFor="fourStars" className="flex items-center">
                <span>4</span>
                <Star className="w-3.5 h-3.5 ml-1 text-yellow-400 fill-yellow-400" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="threeStars" 
                checked={filters.threeStars} 
                onCheckedChange={(checked) => onFilterChange('threeStars', !!checked)} 
              />
              <Label htmlFor="threeStars" className="flex items-center">
                <span>3</span>
                <Star className="w-3.5 h-3.5 ml-1 text-yellow-400 fill-yellow-400" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="twoStars" 
                checked={filters.twoStars} 
                onCheckedChange={(checked) => onFilterChange('twoStars', !!checked)} 
              />
              <Label htmlFor="twoStars" className="flex items-center">
                <span>2</span>
                <Star className="w-3.5 h-3.5 ml-1 text-yellow-400 fill-yellow-400" />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="oneStars" 
                checked={filters.oneStars} 
                onCheckedChange={(checked) => onFilterChange('oneStars', !!checked)} 
              />
              <Label htmlFor="oneStars" className="flex items-center">
                <span>1</span>
                <Star className="w-3.5 h-3.5 ml-1 text-yellow-400 fill-yellow-400" />
              </Label>
            </div>
          </div>
        </div>
        
        <div className="flex items-end">
          <Button variant="outline" onClick={onResetFilters} className="whitespace-nowrap">
            Filtreleri Temizle
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsFilter;
