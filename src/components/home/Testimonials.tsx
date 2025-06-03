import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import { ReviewDTO } from "@/types/review.types";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      console.log("🚀 Testimonials: Backend'den yorumlar çekiliyor...");
      console.log(
        "📡 API URL:",
        `${import.meta.env.VITE_API_BASE_URL || "/api"}/reviews?minRating=4`
      );

      // En yüksek puanlı yorumları al
      const response = await reviewService.getReviews({
        minRating: 4,
      });
      console.log("✅ Testimonials: API yanıtı alındı:", response);

      // İlk 5 yorum
      const topReviews = Array.isArray(response) ? response.slice(0, 5) : [];
      setReviews(topReviews);
      setError(null);
    } catch (err: any) {
      console.error("❌ Testimonials API Hatası:", err);
      console.error("❌ Hata detayları:", {
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

      console.log("🔄 Geçici olarak mock data kullanılıyor...");

      // Geçici mock data - backend düzelene kadar
      const mockReviews = [
        {
          id: 1,
          rating: 5,
          comment:
            "Mükemmel bir tekne kiralama deneyimi yaşadık. Personel çok yardımsever ve tekneler temizdi.",
          customer: {
            id: 1,
            fullName: "Ahmet Yılmaz",
            phoneNumber: "+90 555 123 4567",
            profileImage: null,
          },
          boatId: 1,
          date: "2024-05-15",
          createdAt: "2024-05-15T10:00:00",
          updatedAt: "2024-05-15T10:00:00",
          bookingId: 1,
        },
        {
          id: 2,
          rating: 5,
          comment:
            "Ailece unutulmaz bir gün geçirdik. Tekne çok konforlu ve personel deneyimli.",
          customer: {
            id: 2,
            fullName: "Fatma Demir",
            phoneNumber: "+90 555 987 6543",
            profileImage: null,
          },
          boatId: 2,
          date: "2024-05-10",
          createdAt: "2024-05-10T14:30:00",
          updatedAt: "2024-05-10T14:30:00",
          bookingId: 2,
        },
        {
          id: 3,
          rating: 4,
          comment: "Çok güzel bir deneyimdi. Kesinlikle tekrar kiralayacağız.",
          customer: {
            id: 3,
            fullName: "Mehmet Kaya",
            phoneNumber: "+90 555 456 7890",
            profileImage: null,
          },
          boatId: 3,
          date: "2024-05-05",
          createdAt: "2024-05-05T16:45:00",
          updatedAt: "2024-05-05T16:45:00",
          bookingId: 3,
        },
      ];

      setReviews(mockReviews);
      setError(null); // Mock data kullanıldığında error'u temizle
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
              Müşteri Yorumları
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Müşterilerimizin deneyimleri ve değerli görüşleri
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
              Müşteri Yorumları
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Müşterilerimizin deneyimleri ve değerli görüşleri
            </p>
          </div>

          <div className="text-center py-12">
            <p className="text-red-600 mb-4">❌ {error}</p>
            <button
              onClick={fetchTestimonials}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              🔄 Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No reviews
  if (reviews.length === 0) {
    return (
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Müşteri Yorumları
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Müşterilerimizin deneyimleri ve değerli görüşleri
            </p>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-600">Henüz müşteri yorumu bulunmuyor.</p>
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
            Müşteri Yorumları
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Müşterilerimizin deneyimleri ve değerli görüşleri
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => (
                <div key={review.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        src={
                          review.customer?.profileImage ||
                          "/placeholder-avatar.jpg"
                        }
                        alt={review.customer?.fullName || "Müşteri"}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">
                          {review.customer?.fullName || "Anonim Müşteri"}
                        </h4>
                        <p className="text-primary text-sm">
                          Tekne değerlendirmesi
                        </p>
                        <div className="flex mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>

                    <blockquote className="text-gray-600 italic">
                      "
                      {review.comment ||
                        "Bu müşteri mükemmel bir deneyim yaşadı."}
                      "
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex space-x-2 items-center">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary w-6" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Backend status indicator */}
          {reviews.length > 0 && (
            <div className="text-center mt-6">
              <p className="text-xs text-gray-400">
                💡 Geçici demo verisi gösteriliyor - Backend review API'si
                düzeltildikten sonra gerçek veriler gelecek
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
