
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface RatingsSummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  color?: string;
}

const RatingsSummaryCard = ({ icon, title, value, color }: RatingsSummaryCardProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className={`mb-2 ${color ? `text-${color}` : 'text-primary'}`}>
          {icon}
        </div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default RatingsSummaryCard;
