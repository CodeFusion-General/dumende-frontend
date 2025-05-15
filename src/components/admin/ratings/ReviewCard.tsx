
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { ExpandableText } from '@/components/ui/ExpandableText';

interface ReviewCardProps {
  userName: string;
  date: string;
  rating: number;
  comment: string;
  tourName?: string;
  boatName?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  userName,
  date,
  rating,
  comment,
  tourName,
  boatName
}) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-medium">{userName}</h4>
            <p className="text-sm text-gray-500">{date}</p>
          </div>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-3">
          <ExpandableText text={comment} maxLength={150} />
        </div>
        
        {(tourName || boatName) && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              {tourName && <span className="inline-block mr-2">Tur: {tourName}</span>}
              {boatName && <span className="inline-block">Tekne: {boatName}</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
