import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { RefreshCw, Download, BarChart3 } from "lucide-react";
import { FadeIn, SlideIn, useCountUp } from "./animations/AnimationUtils";

interface RatingsHeaderProps {
  totalReviews: number;
  averageRating: number;
  onRefresh: () => void;
  onExport: () => void;
}

const RatingsHeader = ({
  totalReviews,
  averageRating,
  onRefresh,
  onExport,
}: RatingsHeaderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Animated counters for stats
  const animatedTotalReviews = useCountUp(totalReviews, 1500);
  const animatedAverageRating = useCountUp(averageRating, 1500, 0, 1);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500); // Keep animation for a bit longer
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setTimeout(() => setIsExporting(false), 1000); // Keep animation for export feedback
    }
  };

  return (
    <header
      className="bg-white border-b border-gray-200 px-4 xs:px-6 py-4 transition-all duration-300"
      role="banner"
    >
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <FadeIn delay={100}>
          <nav className="mb-4" aria-label="Sayfa navigasyonu">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/admin"
                    className="text-gray-500 hover:text-primary transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-sm"
                  >
                    Admin Panel
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-gray-900 font-medium">
                    Değerlendirmeler
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </nav>
        </FadeIn>

        {/* Header Content */}
        <div className="flex flex-col sm:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title and Stats Section */}
          <div className="flex-1">
            <SlideIn direction="left" delay={200}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-all duration-300 hover:scale-110 hover:rotate-3"
                  aria-hidden="true"
                >
                  <BarChart3 className="h-6 w-6 text-primary transition-transform duration-300" />
                </div>
                <div>
                  <h1 className="text-xl xs:text-2xl lg:text-3xl font-bold text-gray-900 font-montserrat hover:text-primary transition-colors duration-300">
                    Müşteri Değerlendirmeleri
                  </h1>
                  <p className="text-xs xs:text-sm text-gray-600 font-roboto mt-1 transition-colors duration-300">
                    Tüm tekne ve tur değerlendirmelerini yönetin
                  </p>
                </div>
              </div>
            </SlideIn>

            {/* Quick Stats */}
            <FadeIn delay={400}>
              <div className="flex flex-wrap items-center gap-4 xs:gap-6 text-xs xs:text-sm text-gray-600">
                <div
                  className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200"
                  role="status"
                  aria-label={`Toplam ${totalReviews} değerlendirme`}
                >
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle group-hover:animate-bounce-gentle"
                    aria-hidden="true"
                  ></div>
                  <span className="font-medium group-hover:text-primary transition-colors duration-200">
                    {animatedTotalReviews.toLocaleString("tr-TR")} toplam
                    değerlendirme
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 group hover:scale-105 transition-transform duration-200"
                  role="status"
                  aria-label={`Ortalama puan ${averageRating.toFixed(1)}`}
                >
                  <div
                    className="w-2 h-2 bg-accent rounded-full animate-pulse-gentle group-hover:animate-bounce-gentle"
                    aria-hidden="true"
                  ></div>
                  <span className="font-medium group-hover:text-accent transition-colors duration-200">
                    {animatedAverageRating.toFixed(1)} ortalama puan
                  </span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Action Buttons */}
          <SlideIn direction="right" delay={300}>
            <div className="flex items-center gap-2 xs:gap-3">
              <Button
                variant="outline"
                size="default"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="group flex items-center gap-2 hover:bg-primary/5 hover:border-primary/20 hover:scale-105 hover:shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Değerlendirmeleri yenile"
              >
                <RefreshCw
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline transition-all duration-200">
                  {isRefreshing ? "Yenileniyor..." : "Yenile"}
                </span>
              </Button>

              <Button
                variant="default"
                size="default"
                onClick={handleExport}
                disabled={isExporting}
                className="group flex items-center gap-2 bg-primary hover:bg-primary-dark hover:scale-105 hover:shadow-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Değerlendirmeleri dışa aktar"
              >
                <Download
                  className={`h-4 w-4 transition-transform duration-300 ${
                    isExporting
                      ? "animate-bounce"
                      : "group-hover:translate-y-0.5"
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline transition-all duration-200">
                  {isExporting ? "Dışa Aktarılıyor..." : "Dışa Aktar"}
                </span>
              </Button>
            </div>
          </SlideIn>
        </div>
      </div>
    </header>
  );
};

export default RatingsHeader;
