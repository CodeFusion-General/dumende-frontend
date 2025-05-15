
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServiceCategory } from './types';

interface CategoryGridProps {
  categories: ServiceCategory[];
}

const CategoryGrid = ({ categories }: CategoryGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {categories.map((category) => (
        <Card key={category.id} className="transition-custom hover:shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
              {category.icon}
            </div>
            <CardTitle>{category.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              {category.description}
            </CardDescription>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to={`/hizmetler#${category.id}`}>Detaylı Bilgi</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
