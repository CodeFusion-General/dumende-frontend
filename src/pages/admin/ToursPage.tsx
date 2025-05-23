import React, { useState } from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ToursList from '@/components/admin/tours/ToursList';
import TourFilters from '@/components/admin/tours/TourFilters';
import EmptyTours from '@/components/admin/tours/EmptyTours';
import { toast } from '@/components/ui/use-toast';

/* Backend hazır olduğunda kullanılacak interface:
interface Tour {
  id: string;
  title: string;
  duration: string;
  price: number;
  location: string;
  status: 'active' | 'draft' | 'inactive';
  image: string;
  boat: string;
}
*/

const ToursPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  
  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await tourService.getTours();
        setTours(response);
      } catch (error) {
        console.error('Failed to fetch tours:', error);
        setError('Turlar yüklenirken bir hata oluştu.');
        toast({
          title: "Hata",
          description: "Turlar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);
  */

  // Mock implementation - Backend hazır olduğunda kaldırılacak
  const [tours, setTours] = useState([
    {
      id: '1',
      title: 'Günbatımı Turu',
      duration: '2 saat',
      price: 1200,
      location: 'İstanbul, Bebek',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      boat: 'Mavi Rüzgar'
    },
    {
      id: '2',
      title: 'Adalar Turu',
      duration: '4 saat',
      price: 2500,
      location: 'İstanbul, Kadıköy',
      status: 'draft',
      image: 'https://images.unsplash.com/photo-1589046207215-55114aecf5a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      boat: 'Deniz Yıldızı'
    },
    {
      id: '3',
      title: 'Özel Yelken Turu',
      duration: '6 saat',
      price: 5000,
      location: 'Bodrum, Yalıkavak',
      status: 'inactive',
      image: 'https://images.unsplash.com/photo-1669125256832-9e414ffc2d67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
      boat: 'Rüzgar Gülü'
    }
  ]);

  const handleAddTour = () => {
    navigate('/captain/tours/new');
  };

  // Filter tours based on search query and filters
  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tour.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === 'all' || tour.location.includes(locationFilter);
    
    const matchesDuration = durationFilter === 'all' ||
      (durationFilter === '1-2' && parseInt(tour.duration) <= 2) ||
      (durationFilter === '3-5' && parseInt(tour.duration) >= 3 && parseInt(tour.duration) <= 5) ||
      (durationFilter === '6+' && parseInt(tour.duration) >= 6);
    
    const matchesPrice = priceFilter === 'all' ||
      (priceFilter === '0-1000' && tour.price <= 1000) ||
      (priceFilter === '1000-3000' && tour.price > 1000 && tour.price <= 3000) ||
      (priceFilter === '3000+' && tour.price > 3000);
    
    return matchesSearch && matchesLocation && matchesDuration && matchesPrice;
  });

  /* Backend hazır olduğunda kullanılacak fonksiyonlar:
  const handleDelete = async (id: string) => {
    try {
      await tourService.deleteTour(id);
      setTours(prev => prev.filter(tour => tour.id !== id));
      toast({
        title: "Başarılı",
        description: "Tur silindi.",
      });
    } catch (error) {
      console.error('Failed to delete tour:', error);
      toast({
        title: "Hata",
        description: "Tur silinemedi. Lütfen daha sonra tekrar deneyin.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await tourService.updateTourStatus(id, status);
      const response = await tourService.getTours();
      setTours(response);
      toast({
        title: "Başarılı",
        description: "Tur durumu güncellendi.",
      });
    } catch (error) {
      console.error('Failed to update tour status:', error);
      toast({
        title: "Hata",
        description: "Tur durumu güncellenemedi.",
        variant: "destructive",
      });
    }
  };
  */

  // Mock implementation - Backend hazır olduğunda kaldırılacak
  const handleDelete = (id: string) => {
    setTours(tours.filter(tour => tour.id !== id));
  };

  return (
    <CaptainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Tekne Turlarım</h1>
          <Button 
            onClick={handleAddTour}
            className="bg-[#15847c] hover:bg-[#0e5c56] text-white"
          >
            <Plus size={16} className="mr-1" /> Tekne Turu Ekle
          </Button>
        </div>
        
        <TourFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          locationFilter={locationFilter}
          setLocationFilter={setLocationFilter}
          durationFilter={durationFilter}
          setDurationFilter={setDurationFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
        />
        
        {tours.length === 0 ? (
          <EmptyTours onAddClick={handleAddTour} />
        ) : filteredTours.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-lg text-gray-600">Arama kriteriyle eşleşen tur bulunamadı.</p>
            <p className="text-gray-500 mt-2">Lütfen filtreleri değiştirin veya yeni tur ekleyin.</p>
          </div>
        ) : (
          <ToursList tours={filteredTours} onDelete={handleDelete} />
        )}
      </div>
    </CaptainLayout>
  );
};

export default ToursPage;
