import React from "react";
import { X, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BoatDTO } from "@/types/boat.types";
import { getDefaultImageUrl } from "@/lib/imageUtils";

interface ComparisonTableProps {
  boats: BoatDTO[];
  onRemove: (id: number) => void;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  boats,
  onRemove,
}) => {
  const featuresList = [
    "Klima",
    "Jakuzi",
    "Flybridge",
    "Snorkel Ekipmanı",
    "Jet Ski",
    "Balık Tutma Ekipmanı",
    "Wi-Fi",
  ];

  return (
    <div className="min-w-[800px]">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white z-10">
          <tr>
            <th className="min-w-[180px] bg-gray-50 p-4 text-left border-r border-gray-100"></th>
            {boats.map((boat) => (
              <th
                key={boat.id}
                className="min-w-[250px] p-0 border-r border-gray-100"
              >
                <div className="relative">
                  <button
                    onClick={() => onRemove(boat.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Remove from comparison"
                  >
                    <X size={16} />
                  </button>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={
                        boat.images?.find((img) => img && img.imageUrl)
                          ? boat.images.find((img) => img && img.imageUrl)!
                              .imageUrl
                          : getDefaultImageUrl()
                      }
                      alt={boat.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{boat.name}</h3>
                    <p className="text-sm text-gray-500">{boat.type}</p>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Fiyat
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                <div className="font-bold text-primary">
                  {boat.dailyPrice} ₺
                  <span className="text-gray-400 text-sm font-normal ml-1">
                    /gün
                  </span>
                </div>
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Kapasite
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                {boat.capacity} kişi
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Model
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                {boat.model}
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Yapım Yılı
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                {boat.buildYear}
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Lokasyon
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                {boat.location}
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Değerlendirme
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                {boat.rating ? (
                  <div className="flex items-center">
                    <span className="bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-bold mr-2">
                      {boat.rating.toFixed(1)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">
                    Henüz değerlendirme yok
                  </span>
                )}
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              Özellikler
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                <ul className="space-y-2">
                  {featuresList.map((feature) => {
                    const hasFeature = boat.features?.some(
                      (f) => f.featureName === feature
                    );
                    return (
                      <li key={feature} className="flex items-center text-sm">
                        {hasFeature ? (
                          <CheckCircle2
                            size={16}
                            className="text-green-500 mr-2"
                          />
                        ) : (
                          <XCircle size={16} className="text-gray-400 mr-2" />
                        )}
                        <span className={hasFeature ? "" : "text-gray-400"}>
                          {feature}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </td>
            ))}
          </tr>

          <tr className="border-t border-gray-100">
            <td className="bg-gray-50 font-medium p-4 border-r border-gray-100">
              İşlem
            </td>
            {boats.map((boat) => (
              <td key={boat.id} className="p-4 border-r border-gray-100">
                <Button asChild className="w-full">
                  <Link to={`/boats/${boat.id}`}>Detayları Görüntüle</Link>
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
