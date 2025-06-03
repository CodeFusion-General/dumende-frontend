import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, Settings } from "lucide-react";
import { TourDTO } from "@/types/tour.types";

interface TourCardProps {
  tour: TourDTO;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const TourCard: React.FC<TourCardProps> = ({
  tour,
  onDelete,
  onStatusChange,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <Badge variant="success" className="text-xs">
            Aktif
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="warning" className="text-xs">
            Taslak
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="text-xs">
            Yayında Değil
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="text-xs">
            İptal
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        );
    }
  };

  const handleDelete = () => {
    if (window.confirm("Bu turu silmek istediğinize emin misiniz?")) {
      onDelete(tour.id.toString());
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(tour.id.toString(), newStatus);
    }
  };

  // İlk tour image'ını al, yoksa placeholder kullan
  const tourImage =
    tour.tourImages && tour.tourImages.length > 0
      ? `data:image/jpeg;base64,${tour.tourImages[0].imageData}`
      : "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

  // Duration hesaplama (gün cinsinden)
  const duration =
    tour.seasonStartDate && tour.seasonEndDate
      ? Math.ceil(
          (new Date(tour.seasonEndDate).getTime() -
            new Date(tour.seasonStartDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="relative h-48 overflow-hidden group">
        <img
          src={tourImage}
          alt={tour.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <h3 className="text-white font-semibold text-lg p-4 w-full">
            {tour.name}
          </h3>
        </div>
        <div className="absolute top-3 right-3">
          {getStatusBadge(tour.status)}
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link to={`/captain/tours/${tour.id}`}>
            <Button variant="secondary" size="sm" className="mr-2">
              <Edit size={16} />
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            className="mr-2"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </Button>
          {onStatusChange && (
            <Button
              variant="outline"
              size="sm"
              className="mr-2 bg-white"
              onClick={() => {
                const newStatus =
                  tour.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                handleStatusChange(newStatus);
              }}
            >
              <Settings size={16} />
            </Button>
          )}
          <Link to={`/tours/${tour.id}`} target="_blank">
            <Button variant="outline" size="sm" className="bg-white">
              <Eye size={16} />
            </Button>
          </Link>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Tekne ID:</span>
            <span className="text-sm">{tour.boatId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Süre:</span>
            <span className="text-sm">
              {duration > 0 ? `${duration} gün` : "Belirtilmemiş"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Fiyat:</span>
            <span className="text-sm font-semibold">
              {Number(tour.price).toLocaleString("tr-TR")} ₺
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Kapasite:</span>
            <span className="text-sm">{tour.capacity} kişi</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Lokasyon:</span>
            <span className="text-sm">{tour.location}</span>
          </div>
          {tour.rating && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Puan:</span>
              <span className="text-sm font-semibold text-yellow-600">
                ⭐ {tour.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-3 flex justify-between">
        <Link
          to={`/captain/tours/${tour.id}`}
          className="text-[#15847c] text-sm hover:underline"
        >
          Düzenle
        </Link>
        <Link
          to={`/tours/${tour.id}`}
          target="_blank"
          className="text-gray-500 text-sm hover:underline"
        >
          Önizle
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TourCard;
