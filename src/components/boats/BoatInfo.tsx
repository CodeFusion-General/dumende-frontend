import React from "react";
import {
  Star,
  MapPin,
  Users,
  Ruler,
  Anchor,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExpandableText } from "@/components/ui/ExpandableText";

interface BoatInfoProps {
  boat: {
    name: string;
    type: string;
    location: string;
    rating: number;
    reviewCount: number;
    length: string;
    capacity: number;
    captainOption: string;
    description: string;
    isVerified?: boolean;
    isInstantBook?: boolean;
  };
}

const BoatInfo: React.FC<BoatInfoProps> = ({ boat }) => {
  // Render star rating with proper visualization
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative w-4 h-4">
            <Star className="w-4 h-4 text-gray-300 fill-gray-300 absolute" />
            <div className="overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className="w-4 h-4 text-gray-300 fill-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      {/* Header Card with Title, Rating, and Badges */}
      <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4">
            {/* Title and Badges Row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-montserrat leading-tight">
                  {boat.name}
                </h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <MapPin className="w-4 h-4 mr-1 text-primary" />
                  <span className="text-sm font-medium">{boat.location}</span>
                </div>
              </div>

              {/* Professional Badge System */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-primary/20 text-primary bg-primary/5"
                >
                  <Anchor className="w-3 h-3 mr-1" />
                  {boat.type}
                </Badge>
                {boat.isVerified && (
                  <Badge
                    variant="success"
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {boat.isInstantBook && (
                  <Badge
                    variant="info"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Instant Book
                  </Badge>
                )}
              </div>
            </div>

            {/* Enhanced Rating Display */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                {renderStars(boat.rating)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">
                  {boat.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({boat.reviewCount}{" "}
                  {boat.reviewCount === 1 ? "review" : "reviews"})
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Info Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Ruler className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {boat.length} ft
                </p>
                <p className="text-xs text-gray-500 font-medium">Length</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {boat.capacity}
                </p>
                <p className="text-xs text-gray-500 font-medium">Guests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Anchor className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {boat.type}
                </p>
                <p className="text-xs text-gray-500 font-medium">Boat Type</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-gray-900">
                  {boat.captainOption}
                </p>
                <p className="text-xs text-gray-500 font-medium">Captain</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardHeader className="pb-3">
          <h2 className="text-xl font-semibold text-gray-900 font-montserrat">
            About This Boat
          </h2>
        </CardHeader>
        <CardContent className="pt-0">
          <ExpandableText
            text={boat.description}
            maxLength={300}
            className="text-gray-600 leading-relaxed"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default BoatInfo;
