import React from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { boatTypes, locations, features } from '@/data/boats';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface OpenSections {
  boatType: boolean;
  priceRange: boolean;
  capacity: boolean;
  features: boolean;
  location: boolean;
  date: boolean;
}

interface FilterSidebarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedLocations: string[];
  setSelectedLocations: (locations: string[]) => void;
  selectedFeatures: string[];
  setSelectedFeatures: (features: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  capacity: string;
  setCapacity: (capacity: string) => void;
  openSections: OpenSections;
  toggleSection: (section: keyof OpenSections) => void;
  resetFilters: () => void;
  applyFilters: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  showFilters,
  setShowFilters,
  selectedTypes,
  setSelectedTypes,
  selectedLocations,
  setSelectedLocations,
  selectedFeatures,
  setSelectedFeatures,
  priceRange,
  setPriceRange,
  capacity,
  setCapacity,
  openSections,
  toggleSection,
  resetFilters,
  applyFilters,
}) => {
  const toggleBoatType = (value: string) => {
    if (selectedTypes.includes(value)) {
      setSelectedTypes(selectedTypes.filter(type => type !== value));
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const toggleLocation = (value: string) => {
    if (selectedLocations.includes(value)) {
      setSelectedLocations(selectedLocations.filter(location => location !== value));
    } else {
      setSelectedLocations([...selectedLocations, value]);
    }
  };

  const toggleFeature = (value: string) => {
    if (selectedFeatures.includes(value)) {
      setSelectedFeatures(selectedFeatures.filter(feature => feature !== feature));
    } else {
      setSelectedFeatures([...selectedFeatures, value]);
    }
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  return (
    <>
      <div className="md:hidden mb-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
          {showFilters ? 'Filtreleri Kapat' : 'Filtreleri Göster'}
        </Button>
      </div>
      
      <div className={`${showFilters ? 'block' : 'hidden'} md:block md:w-1/4 lg:w-1/5 pr-0 md:pr-6`}>
        <div className="bg-white rounded-lg shadow-md p-5 mb-6 sticky top-20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-brand-secondary">Filtreler</h3>
            <button 
              className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
              onClick={resetFilters}
            >
              Temizle
            </button>
          </div>

          <Collapsible
            open={openSections.boatType}
            onOpenChange={() => toggleSection('boatType')}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Tekne Türü</span>
              {openSections.boatType ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {boatTypes.map((boatType) => (
                <div key={boatType.value} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={boatType.value} 
                    checked={selectedTypes.includes(boatType.value)}
                    onChange={() => toggleBoatType(boatType.value)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor={boatType.value} className="text-sm text-gray-700">
                    {boatType.label}
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.priceRange}
            onOpenChange={() => toggleSection('priceRange')}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Fiyat Aralığı</span>
              {openSections.priceRange ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-2">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Min: {priceRange[0].toLocaleString('tr-TR')} ₺</span>
                <span className="text-sm text-gray-600">Max: {priceRange[1].toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="mb-6 px-1">
                <Slider 
                  defaultValue={[priceRange[0], priceRange[1]]}
                  min={500}
                  max={30000}
                  step={500}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={handlePriceRangeChange}
                  className="w-full"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.capacity}
            onOpenChange={() => toggleSection('capacity')}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Kapasite</span>
              {openSections.capacity ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {['1-6', '7-12', '13-20', '20+'].map((range) => (
                <div key={range} className="flex items-center">
                  <input 
                    type="radio" 
                    id={`capacity-${range}`} 
                    name="capacity" 
                    value={range}
                    checked={capacity === range}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mr-2 h-4 w-4 border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor={`capacity-${range}`} className="text-sm text-gray-700">
                    {range} Kişi
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.features}
            onOpenChange={() => toggleSection('features')}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Özellikler</span>
              {openSections.features ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`feature-${index}`} 
                    checked={selectedFeatures.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor={`feature-${index}`} className="text-sm text-gray-700">
                    {feature}
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.location}
            onOpenChange={() => toggleSection('location')}
            className="mb-6"
          >
            <CollapsibleTrigger className="flex items-center w-full font-semibold text-brand-secondary mb-3">
              <span>Lokasyon</span>
              {openSections.location ? (
                <ChevronUp className="ml-auto h-4 w-4" />
              ) : (
                <ChevronDown className="ml-auto h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
              {locations.map((location, index) => (
                <div key={index} className="flex items-center">
                  <input 
                    type="checkbox" 
                    id={`location-${index}`} 
                    checked={selectedLocations.includes(location)}
                    onChange={() => toggleLocation(location)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                  />
                  <label htmlFor={`location-${index}`} className="text-sm text-gray-700">
                    {location}
                  </label>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          <div className="flex flex-col gap-2">
            <Button 
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white"
              onClick={applyFilters}
            >
              Filtreleri Uygula
            </Button>
            
            <Button 
              variant="outline"
              className="w-full border-brand-primary text-brand-primary hover:bg-brand-primary/10"
              onClick={resetFilters}
            >
              Filtreleri Temizle
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
