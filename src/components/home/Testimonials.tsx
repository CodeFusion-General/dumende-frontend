import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import { ReviewDTO } from "@/types/review.types";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      // En yüksek puanlı yorumları al
      const response = await reviewService.getReviewsByMinRating(4);
      // İlk 5 yorum
      const topReviews = Array.isArray(response) ? response.slice(0, 5) : [];
      setReviews(topReviews);
      setError(null);
    } catch (err: any) {
      console.error("Testimonials API Hatası:", err);
      console.error("Hata detayları:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.config?.url,
      });

      const errorMessage =
        err.response?.data?.message ||
        err.response?.statusText ||
        err.message ||
        "Yorumlar yüklenirken bir hata oluştu.";

      // Set error state instead of using mock data
      setError(errorMessage);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className="w-4 h-4"
          fill={i <= rating ? "#F8CB2E" : "none"}
          stroke={i <= rating ? "#F8CB2E" : "#D1D5DB"}
        />
      );
    }
    return stars;
  };

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
    <div className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t.home.testimonials.title}
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            {t.home.testimonials.subtitle}
          </p>
          
          {/* Demo Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-sm text-blue-700">
              💡 {t.home.testimonials.demoNote}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Testimonial Card */}
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                {renderStars(reviews[currentIndex].rating)}
              </div>

              <blockquote className="text-lg md:text-xl text-gray-700 mb-8 italic">
                "{reviews[currentIndex].comment}"
              </blockquote>

              <div className="flex items-center justify-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {reviews[currentIndex].customer.fullName
                      .split(" ")
                      .map((name) => name[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {reviews[currentIndex].customer.fullName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t.home.testimonials.boatReview}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {reviews.length > 1 && (
              <>
                <button
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </>
            )}
          </div>

          {/* Dots Navigation */}
          {reviews.length > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
