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
import { boatService } from '@/services/boatService';
import { BoatDTO } from '@/types/boat.types';

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

// Mock data adapter to convert listing data to BoatDTO format
const convertToBoatDTO = (mockData: any): BoatDTO => ({
  id: mockData.id,
  ownerId: 1, // Mock owner ID
  name: mockData.name,
  description: mockData.description || '',
  model: mockData.model || '',
  year: mockData.year,
  length: 0, // Mock value
  capacity: mockData.capacity,
  dailyPrice: mockData.price,
  hourlyPrice: 0, // Mock value
  location: mockData.location,
  rating: mockData.rating,
  type: mockData.type,
  status: 'ACTIVE',
  brandModel: mockData.model || '',
  buildYear: mockData.year,
  captainIncluded: false,
  images: mockData.images.map((url: string) => ({
    id: 0,
    boatId: mockData.id,
    imageData: url,
    isPrimary: false,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })),
  features: mockData.features.map((feature: string, index: number) => ({
    id: index,
    boatId: mockData.id,
    featureName: feature,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })),
  availabilities: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const BoatsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  
  // Mock data state (commented out but preserved)
  /* const [allBoats] = useState(boatListingData);
  const [filteredBoats, setFilteredBoats] = useState(boatListingData); */
  
  // Real data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allBoats, setAllBoats] = useState<BoatDTO[]>([]);
  const [filteredBoats, setFilteredBoats] = useState<BoatDTO[]>([]);
  
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
  
  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };
  
  const searchParams = new URLSearchParams(location.search);
  const serviceParam = searchParams.get('service');
  
  useEffect(() => {
    fetchBoats();
  }, []);

  const fetchBoats = async () => {
    try {
      setLoading(true);
      
      // Real API call
      const response = await boatService.getBoats();
      // Ensure we always set an array
      const boats = Array.isArray(response) ? response : (response as any)?.content || [];
      setAllBoats(boats);
      setFilteredBoats(boats);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching boats:', err);
      setError('Tekneleri yüklerken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setAllBoats([]);
      setFilteredBoats([]);
    } finally {
      setLoading(false);
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
    }
  };

  const applyFilters = async () => {
    try {
      setLoading(true);
      
      // Real API call
      const response = await boatService.searchBoats({
        type: selectedTypes.length > 0 ? selectedTypes[0] : undefined,
        minCapacity: capacity ? parseInt(capacity) : undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        location: selectedLocations.length > 0 ? selectedLocations[0] : undefined
      });
      // Ensure we always set an array
      const filteredResults = Array.isArray(response) ? response : (response as any)?.content || [];
      setFilteredBoats(filteredResults);
      
    } catch (err) {
      console.error('Error applying filters:', err);
      toast({
        title: 'Hata',
        description: 'Filtreleri uygularken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        variant: 'destructive'
      });
      setFilteredBoats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (serviceParam && serviceBoatMap[serviceParam]) {
      setSelectedTypes(serviceBoatMap[serviceParam]);
    }
  }, [serviceParam]);

  useEffect(() => {
    applyFilters();
  }, [selectedTypes, capacity, priceRange, selectedLocations, selectedFeatures]);

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <BoatListingHeader
          viewMode={viewMode}
          setViewMode={setViewMode}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          totalBoats={filteredBoats.length}
        />

        <div className="flex flex-col md:flex-row gap-6">
          <FilterSidebar
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            capacity={capacity}
            setCapacity={setCapacity}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedLocations={selectedLocations}
            setSelectedLocations={setSelectedLocations}
            selectedFeatures={selectedFeatures}
            setSelectedFeatures={setSelectedFeatures}
            openSections={openSections}
            toggleSection={toggleSection}
            resetFilters={handleFilterReset}
            applyFilters={applyFilters}
          />

          <div className="flex-1">
            {serviceParam && (
              <div className="mb-4">
                <ServiceFilterBadge service={serviceParam} onRemove={() => navigate('/boats')} />
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="animate-pulse">
                    <div className="bg-gray-200 h-64 rounded-lg mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredBoats.length > 0 ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {filteredBoats.map((boat) => (
                  <BoatCard
                    key={boat.id}
                    boat={boat}
                    viewMode={viewMode}
                    isCompared={comparedBoats.includes(boat.id.toString())}
                    onCompareToggle={(id) => {
                      if (comparedBoats.includes(id)) {
                        setComparedBoats(comparedBoats.filter((boatId) => boatId !== id));
                      } else if (comparedBoats.length < 3) {
                        setComparedBoats([...comparedBoats, id]);
                      } else {
                        toast({
                          title: "Karşılaştırma Limiti",
                          description: "En fazla 3 tekneyi karşılaştırabilirsiniz.",
                          variant: "destructive",
                        });
                      }
                    }}
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
            comparedBoats={comparedBoats}
            boats={allBoats}
            onRemove={(id) => setComparedBoats(comparedBoats.filter((boatId) => boatId !== id))}
            onClearAll={() => setComparedBoats([])}
          />
        )}
      </div>
    </Layout>
  );
};

export default BoatsPage;
