
import React, { memo } from 'react';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BoatOrganization } from './types';
import { useNavigate } from 'react-router-dom';

interface OrganizationsSectionProps {
  organizations: BoatOrganization[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

const CategoryButton = memo(({ category, isSelected, onClick }: { 
  category: string; 
  isSelected: boolean; 
  onClick: () => void;
}) => (
  <Button 
    variant={isSelected ? "default" : "outline"} 
    onClick={onClick}
  >
    {category}
  </Button>
));

CategoryButton.displayName = 'CategoryButton';

const OrganizationCard = memo(({ organization }: { organization: BoatOrganization }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    // Create slug from title
    const slug = organization.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
    
    // Navigate to boats page with service parameter
    navigate(`/boats?service=${slug}`);
  };
  
  return (
    <Card key={organization.id} className="hover:shadow-lg transition-custom overflow-hidden group cursor-pointer" onClick={handleClick}>
      <div className="aspect-[3/4] overflow-hidden relative">
        <img 
          src={organization.image} 
          alt={organization.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
        <div className="absolute bottom-0 left-0 p-3 text-white">
          <div className="flex items-center space-x-1">
            {organization.icon}
            <h3 className="font-bold text-sm sm:text-base">{organization.title}</h3>
          </div>
          <p className="text-xs mt-1 line-clamp-2">{organization.description}</p>
        </div>
      </div>
      <CardFooter className="p-2">
        <Button size="sm" variant="ghost" className="w-full">
          Tekneleri Göster
        </Button>
      </CardFooter>
    </Card>
  );
});

OrganizationCard.displayName = 'OrganizationCard';

const OrganizationsSection = ({ organizations, selectedCategory, onCategorySelect }: OrganizationsSectionProps) => {
  const categories = ["Tümü", "Partiler", "Romantik", "Turlar", "Özel Hizmetler"];
  const filteredOrganizations = selectedCategory 
    ? organizations.filter(org => org.category === selectedCategory.toLowerCase())
    : organizations;

  return (
    <div id="organizasyonlar" className="scroll-mt-20">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Tekne Organizasyonları</h2>
        <p className="text-muted-foreground mt-2">
          Özel günleriniz ve etkinlikleriniz için profesyonel tekne organizasyonları
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <CategoryButton
            key={category}
            category={category}
            isSelected={category === "Tümü" ? selectedCategory === null : selectedCategory === category.toLowerCase()}
            onClick={() => onCategorySelect(category === "Tümü" ? null : category.toLowerCase())}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {filteredOrganizations.map((organization) => (
          <OrganizationCard key={organization.id} organization={organization} />
        ))}
      </div>
    </div>
  );
};

export default OrganizationsSection;
