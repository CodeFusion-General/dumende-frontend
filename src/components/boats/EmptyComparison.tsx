
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const EmptyComparison = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center">
      <div className="flex flex-col items-center max-w-lg mx-auto">
        <div className="p-4 rounded-full bg-gray-100 mb-6">
          <AlertCircle className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          No boats selected for comparison yet.
        </h2>
        <p className="text-gray-600 mb-8">
          Select boats from our collection to compare them side by side and find the perfect boat for your needs.
        </p>
        <Button asChild size="lg">
          <Link to="/boats">Browse Boats</Link>
        </Button>
      </div>
    </div>
  );
};

export default EmptyComparison;
