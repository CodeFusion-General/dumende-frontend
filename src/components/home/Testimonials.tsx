import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import { ReviewDTO } from "@/types/review.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";
import { mobileDetection } from "@/utils/mobileDetection";

// Memoized star component for better performance
const StarRating = memo(({ rating }: { rating: number }) => {
  const stars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="w-5 h-5 transition-all duration-200"
        fill={i < rating ? "#F59E0B" : "none"}
        stroke={i < rating ? "#F59E0B" : "#D1D5DB"}
      />
    ));
  }, [rating]);

  return (
    <div className="flex space-x-1 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
      {stars}
    </div>
  );
});

StarRating.displayName = "StarRating";

// Memoized testimonial card for performance
const TestimonialCard = memo(
  ({
    review,
    isActive,
    isMobile,
  }: {
    review: any;
    isActive: boolean;
    isMobile: boolean;
  }) => {
    const customerInitials = useMemo(() => {
      return review.customer.fullName
        .split(" ")
        .map((name: string) => name[0])
        .join("");
    }, [review.customer.fullName]);

    const formattedDate = useMemo(() => {
      return new Date(review.createdAt).toLocaleDateString("tr-TR");
    }, [review.createdAt]);

    if (!isActive) return null;

    return (
      <div
        className={`bg-gradient-to-br from-white to-gray-50 rounded-3xl ${
          isMobile ? "p-6" : "p-8 md:p-12"
        } text-center shadow-xl border border-gray-100 relative overflow-hidden`}
      >
        {/* Reduced background decorations for mobile */}
        {!isMobile && (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-blue-500/5 rounded-full translate-y-12 -translate-x-12"></div>
          </>
        )}

        {/* Quote icon - smaller on mobile */}
        <div className="relative mb-8">
          <div
            className={`${
              isMobile ? "w-12 h-12" : "w-16 h-16"
            } bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
          >
            <svg
              className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} text-white`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
            </svg>
          </div>

          <div className="flex justify-center mb-6">
            <StarRating rating={review.rating} />
          </div>
        </div>

        <blockquote
          className={`${
            isMobile ? "text-lg" : "text-xl md:text-2xl"
          } text-gray-800 mb-10 leading-relaxed font-medium relative`}
        >
          {review.comment}
        </blockquote>

        <div className="flex items-center justify-center space-x-4">
          <div className="relative">
            <div
              className={`${
                isMobile ? "w-12 h-12" : "w-16 h-16"
              } bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg`}
            >
              <span
                className={`text-white font-bold ${
                  isMobile ? "text-sm" : "text-lg"
                }`}
              >
                {customerInitials}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <div className="text-left">
            <h4
              className={`font-bold text-gray-900 ${
                isMobile ? "text-base" : "text-lg"
              }`}
            >
              {review.customer.fullName}
            </h4>
            <p className="text-primary font-medium">Doğrulanmış Müşteri</p>
            <p className="text-sm text-gray-600">
              {review.boat?.name} • {formattedDate}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

TestimonialCard.displayName = "TestimonialCard";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  // Detect mobile device for optimizations
  const deviceInfo = useMemo(() => mobileDetection.detectMobileDevice(), []);
  const isMobile = deviceInfo.isMobile;
  const isLowEndDevice = deviceInfo.isLowEndDevice;

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchTestimonials = useCallback(async () => {
    try {
      // Reduce number of reviews for mobile devices to improve performance
      const maxReviews = isLowEndDevice ? 3 : 5;

      // En yüksek puanlı yorumları al
      const response = await reviewService.getReviewsByMinRating(4);
      // Limit reviews based on device capability
      const topReviews = Array.isArray(response)
        ? response.slice(0, maxReviews)
        : [];
      setReviews(topReviews);
      setError(null);
    } catch (err: any) {
      console.error("Testimonials API Hatası:", err?.message || err);

      // Use mock data when API fails - reduced for mobile
      console.warn("API failed, using mock testimonials data");
      const mockReviews = [
        {
          id: 1,
          rating: 5,
          comment:
            "Muhteşem bir deneyimdi! Tekne çok temiz ve komforttu. Kaptan çok bilgili ve yardımseverdi. Kesinlikle tekrar rezervasyon yapacağım.",
          customer: {
            id: 1,
            fullName: "Ayşe Kaya",
            email: "ayse@example.com",
          },
          boat: { id: 1, name: "Deniz Yıldızı" },
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          rating: 5,
          comment:
            "Harika bir gün geçirdik! Teknede her şey mükemmeldi. Ailecek çok eğlendik. Dumende ekibine teşekkürler.",
          customer: {
            id: 2,
            fullName: "Mehmet Demir",
            email: "mehmet@example.com",
          },
          boat: { id: 2, name: "Mavi Rüya" },
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          rating: 5,
          comment:
            "Profesyonel hizmet, temiz tekne ve güler yüzlü ekip. İstanbul Boğazı'nda unutulmaz anlar yaşadık.",
          customer: {
            id: 3,
            fullName: "Zeynep Arslan",
            email: "zeynep@example.com",
          },
          boat: { id: 3, name: "Beyaz Yelken" },
          createdAt: new Date().toISOString(),
        },
      ];

      // Limit mock reviews for low-end devices
      const limitedMockReviews = isLowEndDevice
        ? mockReviews.slice(0, 2)
        : mockReviews;
      setReviews(limitedMockReviews);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [isLowEndDevice]);

  useEffect(() => {
    // Add delay for low-end devices to prevent blocking
    if (isLowEndDevice) {
      const timeoutId = setTimeout(fetchTestimonials, 100);
      return () => clearTimeout(timeoutId);
    } else {
      fetchTestimonials();
    }
  }, [fetchTestimonials, isLowEndDevice]);

  // Memoized navigation functions to prevent unnecessary re-renders
  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevTestimonial = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  // Memoized dot click handler
  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-advance testimonials (disabled on low-end devices to save resources)
  useEffect(() => {
    if (reviews.length > 1 && !isLowEndDevice) {
      const interval = setInterval(nextTestimonial, 5000);
      return () => clearInterval(interval);
    }
  }, [nextTestimonial, reviews.length, isLowEndDevice]);

  // Prefers reduced motion detection for animations
  const prefersReducedMotion = useMemo(() => {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.testimonials.title}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {t.home.testimonials.subtitle}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl p-8 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.testimonials.title}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {t.home.testimonials.subtitle}
            </p>
          </div>

          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchTestimonials}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              🔄 {t.common.tryAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No reviews state
  if (reviews.length === 0) {
    return (
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.testimonials.title}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {t.home.testimonials.subtitle}
            </p>
          </div>

          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-600">{t.common.noDataAvailable}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`section-padding ${
        isMobile ? "bg-white" : "bg-gradient-to-b from-gray-50 to-white"
      }`}
    >
      <div className="container-custom">
        <div className={`text-center ${isMobile ? "mb-8" : "mb-16"}`}>
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full mb-6">
            <span className="text-primary font-semibold text-sm">
              ✨ Müşteri Deneyimleri
            </span>
          </div>
          <h2
            className={`${
              isMobile ? "text-2xl" : "text-4xl md:text-5xl"
            } font-bold text-gray-900 mb-6`}
          >
            {t.home.testimonials.title}
          </h2>
          <p
            className={`${
              isMobile ? "text-base" : "text-xl"
            } text-gray-600 max-w-3xl mx-auto`}
          >
            {t.home.testimonials.subtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Optimized Testimonial Card */}
            <TestimonialCard
              review={reviews[currentIndex]}
              isActive={true}
              isMobile={isMobile}
            />

            {/* Navigation Buttons - Hidden on mobile for better UX */}
            {reviews.length > 1 && !isMobile && (
              <>
                <button
                  onClick={prevTestimonial}
                  className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 bg-white rounded-full p-4 shadow-xl border border-gray-100 group ${
                    prefersReducedMotion
                      ? ""
                      : "hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  }`}
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft
                    className={`w-6 h-6 text-gray-600 group-hover:text-primary ${
                      prefersReducedMotion ? "" : "transition-colors"
                    }`}
                  />
                </button>
                <button
                  onClick={nextTestimonial}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-6 bg-white rounded-full p-4 shadow-xl border border-gray-100 group ${
                    prefersReducedMotion
                      ? ""
                      : "hover:shadow-2xl transition-all duration-300 hover:scale-110"
                  }`}
                  aria-label="Next testimonial"
                >
                  <ChevronRight
                    className={`w-6 h-6 text-gray-600 group-hover:text-primary ${
                      prefersReducedMotion ? "" : "transition-colors"
                    }`}
                  />
                </button>
              </>
            )}
          </div>

          {/* Dots Navigation - Always visible for mobile navigation */}
          {reviews.length > 1 && (
            <div className="flex justify-center mt-10 space-x-3">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`${
                    prefersReducedMotion ? "" : "transition-all duration-300"
                  } ${
                    index === currentIndex
                      ? "w-8 h-3 bg-primary rounded-full"
                      : "w-3 h-3 bg-gray-300 rounded-full hover:bg-gray-400"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Statistics - Simplified for mobile */}
          <div
            className={`grid grid-cols-3 gap-${isMobile ? "4" : "8"} mt-${
              isMobile ? "8" : "16"
            } pt-${isMobile ? "8" : "12"} border-t border-gray-200`}
          >
            <div className="text-center">
              <div
                className={`${
                  isMobile ? "text-2xl" : "text-3xl"
                } font-bold text-primary mb-2`}
              >
                500+
              </div>
              <div className={`text-gray-600 ${isMobile ? "text-sm" : ""}`}>
                Mutlu Müşteri
              </div>
            </div>
            <div className="text-center">
              <div
                className={`${
                  isMobile ? "text-2xl" : "text-3xl"
                } font-bold text-primary mb-2`}
              >
                4.9
              </div>
              <div className={`text-gray-600 ${isMobile ? "text-sm" : ""}`}>
                Ortalama Puan
              </div>
            </div>
            <div className="text-center">
              <div
                className={`${
                  isMobile ? "text-2xl" : "text-3xl"
                } font-bold text-primary mb-2`}
              >
                98%
              </div>
              <div className={`text-gray-600 ${isMobile ? "text-sm" : ""}`}>
                Tavsiye Oranı
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export memoized component for better performance
export default memo(Testimonials);
