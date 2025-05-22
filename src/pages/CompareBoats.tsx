import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { X, ArrowLeft, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { boatListingData } from '@/data/boats';
import ComparisonTable from '@/components/boats/ComparisonTable';
import Navbar from '@/components/layout/Navbar';
import EmptyComparison from '@/components/boats/EmptyComparison';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/components/ui/use-toast';

const CompareBoats = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBoats, setSelectedBoats] = useState<any[]>([]);
  const isMobile = useIsMobile();
  
  // Get boat IDs from URL params
  useEffect(() => {
    const boatIds = searchParams.get('ids')?.split(',') || [];
    
    /* Backend hazır olduğunda kullanılacak kod:
    if (boatIds.length) {
      const fetchBoatsToCompare = async () => {
        try {
          setLoading(true);
          const boatsToCompare = await Promise.all(
            boatIds.map(id => boatService.getBoatById(id))
          );
          setSelectedBoats(boatsToCompare.slice(0, 4)); // Maximum 4 boats
        } catch (error) {
          console.error('Failed to fetch boats for comparison:', error);
          setError('Tekneler yüklenirken bir hata oluştu.');
          toast({
            title: "Hata",
            description: "Tekneler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };

      fetchBoatsToCompare();
    }
    */

    // Mock veri - Backend hazır olduğunda kaldırılacak
    if (boatIds.length) {
      const boatsToCompare = boatListingData.filter(boat => 
        boatIds.includes(boat.id.toString())
      );
      setSelectedBoats(boatsToCompare.slice(0, 4)); // Maximum 4 boats
    }
  }, [searchParams]);

  // Remove a boat from comparison
  const removeBoat = (id: number) => {
    const updatedBoats = selectedBoats.filter(boat => boat.id !== id);
    setSelectedBoats(updatedBoats);
    
    // Update URL params
    if (updatedBoats.length > 0) {
      const newIds = updatedBoats.map(boat => boat.id).join(',');
      setSearchParams({ ids: newIds });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container-custom pt-24 pb-10">
        <div className="flex items-center mb-6">
          <Link to="/boats" className="flex items-center text-primary hover:text-primary-dark transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            <span>Back to Boats</span>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compare Boats</h1>
          <p className="text-gray-600">
            Compare specifications and features of up to 4 boats side by side.
          </p>
        </div>
        
        {selectedBoats.length === 0 ? (
          <EmptyComparison />
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-10">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center">
                  <h2 className="text-lg font-semibold">Comparison</h2>
                  <div className="ml-3 bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-600">
                    {selectedBoats.length} {selectedBoats.length === 1 ? 'Boat' : 'Boats'}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Info size={16} className="mr-1" />
                  <span>Maximum 4 boats can be compared</span>
                </div>
              </div>
              
              <ScrollArea className={isMobile ? "w-full overflow-x-auto" : ""}>
                <ComparisonTable boats={selectedBoats} onRemove={removeBoat} />
              </ScrollArea>
            </div>
            
            <div className="flex justify-center">
              <Button asChild variant="outline" className="px-6">
                <Link to="/boats">Browse More Boats</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompareBoats;
