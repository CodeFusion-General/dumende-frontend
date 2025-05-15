
import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      id: 1,
      name: "Ayşe Yılmaz",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      boat: "Artemis",
      rating: 5,
      text: "Mükemmel bir deneyimdi! Artemis teknesi tam olarak fotoğraflardaki gibiydi. Kaptan çok yardımcı oldu ve önerdiği koylarda harika vakit geçirdik. Kesinlikle tekrar kiralayacağız.",
    },
    {
      id: 2,
      name: "Mehmet Kaya",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      boat: "Blue Heaven",
      rating: 4.5,
      text: "İş arkadaşlarımla kurumsal bir etkinlik için Blue Heaven'ı kiraladık. Ekibinizin profesyonel yaklaşımı ve hizmet kalitesi beklentilerimizin üzerindeydi. Teknenin temizliği ve konforu kusursuzdu.",
    },
    {
      id: 3,
      name: "Zeynep Demir",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      boat: "Poseidon",
      rating: 5,
      text: "Doğum günüm için kiraladığımız Poseidon yatında muhteşem bir gün geçirdik. Mürettebatın misafirperverliği, teknenin konforu ve sunulan ikramlar harikaydı. dümende.com ekibine teşekkürler!",
    },
    {
      id: 4,
      name: "Ahmet Yıldız",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      boat: "Sea Spirit",
      rating: 4,
      text: "Ailecek yaptığımız tatilde Sea Spirit'i tercih ettik ve çok memnun kaldık. Çocuklar için güvenli ve konforlu bir tekneydi. Rezervasyon süreci çok kolay ve hızlıydı.",
    },
    {
      id: 5,
      name: "Elif Şahin",
      avatar: "https://randomuser.me/api/portraits/women/66.jpg",
      boat: "Mavi Rüya",
      rating: 5,
      text: "Mavi Rüya ile çıktığımız mavi tur gerçekten hayallerimi aştı. Kaptanın deneyimi ve bilgisi sayesinde Ege'nin gizli koylarını keşfettik. Yemekler lezzetli, hizmet kusursuzdu.",
    },
  ];
  
  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
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
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                    <div className="flex items-center space-x-4 mb-6">
                      <img 
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">{testimonial.name}</h4>
                        <p className="text-primary text-sm">{testimonial.boat} teknesi</p>
                        <div className="flex mt-1">
                          {renderStars(testimonial.rating)}
                        </div>
                      </div>
                    </div>
                    
                    <blockquote className="text-gray-600 italic">
                      "{testimonial.text}"
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
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-6' : 'bg-gray-300'
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
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
