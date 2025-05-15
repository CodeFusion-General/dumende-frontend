import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import BoatListingHeader from '@/components/boats/BoatListingHeader';
import FilterSidebar from '@/components/boats/FilterSidebar';
import { boatListingData } from '@/data/boats';
import NoResults from '@/components/boats/NoResults';
import BoatCard from '@/components/ui/BoatCard';
import CompareBar from '@/components/boats/CompareBar';
import ServiceFilterBadge from '@/components/boats/ServiceFilterBadge';
import { toast } from '@/components/ui/use-toast';

const serviceBoatMap: Record<string, string[]> = {
  'evlilik-teklifi': ['Lüks Yat', 'Motorlu Yat'],
  'dogum-gunu': ['Motorlu Yat', 'Sürat Teknesi', 'Katamaran'],
  'dugun': ['Lüks Yat', 'Gulet'],
  'iftar': ['Motorlu Yat', 'Gulet'],
  'sunset-cruise': ['Yelkenli', 'Motorlu Yat', 'Gulet'],
  'bekarlığa-veda': ['Motorlu Yat', 'Sürat Teknesi'],
  'tekne-partisi': ['Motorlu Yat', 'Katamaran', 'Sürat Teknesi'],
  'fotograf-cekimi': ['Yelkenli', 'Lüks Yat'],
  'kurumsal-etkinlik': ['Lüks Yat', 'Gulet'],
  'ozel-catering': ['Lüks Yat', 'Gulet', 'Katamaran'],
  'vip-transfer': ['Lüks Yat', 'Sürat Teknesi'],
  'yuzme-dalis-turu': ['Katamaran', 'Yelkenli']
};

const BoatsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [allBoats] = useState(boatListingData);
  const [filteredBoats, setFilteredBoats] = useState(boatListingData);
  const [comparedBoats, setComparedBoats] = useState<string[]>([]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [capacity, setCapacity] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([500, 30000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  const [openSections, setOpenSections] = useState({
    boatType: true,
    priceRange: true,
    capacity: true,
    features: true,
    location: true,
    date: true
  });
  
  const toggleSection = (section) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };
  
  const searchParams = new URLSearchParams(location.search);
  const serviceParam = searchParams.get('service');
  
  useEffect(() => {
    let results = [...allBoats];
    
    if (serviceParam) {
      const compatibleTypes = serviceBoatMap[serviceParam] || [];
      if (compatibleTypes.length > 0) {
        results = results.filter(boat => compatibleTypes.includes(boat.type));
      }
    }
    
    if (selectedTypes.length > 0) {
      results = results.filter(boat => selectedTypes.includes(boat.type));
    }
    
    if (selectedLocations.length > 0) {
      results = results.filter(boat => selectedLocations.includes(boat.location));
    }
    
    if (capacity) {
      if (capacity === '20+') {
        results = results.filter(boat => boat.capacity >= 20);
      } else {
        const [minCapacity, maxCapacity] = capacity.split('-').map(Number);
        results = results.filter(boat => {
          return boat.capacity >= minCapacity && boat.capacity <= maxCapacity;
        });
      }
    }
    
    results = results.filter(boat => {
      return boat.price >= priceRange[0] && boat.price <= priceRange[1];
    });
    
    if (selectedFeatures.length > 0) {
      results = results.filter(boat => {
        return selectedFeatures.every(feature => boat.features.includes(feature));
      });
    }
    
    results = sortBoats(results, sortBy);
    
    setFilteredBoats(results);
  }, [
    allBoats, 
    serviceParam, 
    selectedTypes, 
    selectedLocations, 
    capacity, 
    priceRange, 
    selectedFeatures, 
    sortBy
  ]);
  
  const sortBoats = (boats, sortType) => {
    const sortedBoats = [...boats];
    switch (sortType) {
      case 'price-asc':
        return sortedBoats.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sortedBoats.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedBoats.sort((a, b) => b.id - a.id);
      case 'popular':
      default:
        return sortedBoats.sort((a, b) => b.rating - a.rating);
    }
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    toast({
      title: "Sıralama güncellendi",
      description: "Tekneler yeni sıralamaya göre listelendi.",
      variant: "default",
    });
  };
  
  const handleCompareToggle = (id: string) => {
    if (comparedBoats.includes(id)) {
      setComparedBoats(comparedBoats.filter(boatId => boatId !== id));
    } else {
      if (comparedBoats.length < 3) {
        setComparedBoats([...comparedBoats, id]);
        toast({
          title: "Tekne karşılaştırmaya eklendi",
          description: "Karşılaştırma çubuğunda görebilirsiniz.",
          variant: "default",
        });
      } else {
        toast({
          title: "En fazla 3 tekne karşılaştırabilirsiniz",
          description: "Lütfen önce bir tekneyi çıkarın.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFilterReset = () => {
    setSelectedTypes([]);
    setSelectedLocations([]);
    setSelectedFeatures([]);
    setPriceRange([500, 30000]);
    setCapacity('');
    if (serviceParam) {
      navigate('/boats');
    } else {
      toast({
        title: "Filtreler temizlendi",
        description: "Tüm tekneler gösteriliyor.",
        variant: "default",
      });
    }
  };
  
  const handleApplyFilters = () => {
    toast({
      title: "Filtreler uygulandı",
      description: `${filteredBoats.length} tekne filtrelere uygun bulundu.`,
      variant: "default",
    });
  };
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      const results = allBoats.filter(boat => 
        boat.name.toLowerCase().includes(lowercaseQuery) || 
        boat.type.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredBoats(results);
    } else {
      handleApplyFilters();
    }
  };
  
  return (
    <Layout>
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <FilterSidebar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            selectedFeatures={selectedFeatures}
            setSelectedFeatures={setSelectedFeatures}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            capacity={capacity}
            setCapacity={setCapacity}
            openSections={openSections}
            toggleSection={toggleSection}
            resetFilters={handleFilterReset}
            applyFilters={handleApplyFilters}
          />
          
          <div className="flex-1">
            {serviceParam && (
              <div className="mb-4">
                <ServiceFilterBadge service={serviceParam} />
              </div>
            )}
            
            <BoatListingHeader
              boatCount={filteredBoats.length}
              sortBy={sortBy}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              setViewMode={setViewMode}
              onSearch={handleSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            
            {filteredBoats.length > 0 ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredBoats.map(boat => (
                  <BoatCard 
                    key={boat.id}
                    id={String(boat.id)}
                    name={boat.name}
                    type={boat.type}
                    imageUrl={boat.image}
                    location={boat.location}
                    capacity={boat.capacity}
                    price={boat.price}
                    priceUnit={boat.priceUnit === 'günlük' ? 'day' : 'hour'}
                    rating={boat.rating}
                    onCompare={handleCompareToggle}
                    isCompared={comparedBoats.includes(String(boat.id))}
                  />
                ))}
              </div>
            ) : (
              <NoResults onReset={handleFilterReset} />
            )}
          </div>
        </div>
        
        {comparedBoats.length > 0 && (
          <CompareBar 
            comparedBoats={comparedBoats.map(id => {
              const boat = boatListingData.find(b => String(b.id) === id);
              return boat ? { id, name: boat.name } : { id, name: 'Unknown Boat' };
            })} 
            removeFromComparison={(id) => handleCompareToggle(String(id))}
            clearComparison={() => setComparedBoats([])}
          />
        )}
      </div>
    </Layout>
  );
};

export default BoatsPage;
