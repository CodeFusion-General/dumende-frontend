
import React from 'react';

const ServiceHero = () => {
  return (
    <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=2072&auto=format&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>
      
      <div className="relative container-custom h-full flex flex-col justify-center items-center text-center z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fade-in font-montserrat">
          Tekne Kiralama & Deniz Turizmi
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: "200ms"}}>
          Yüksek standartlarda deniz turizmi hizmetleri sunuyoruz. Size özel teknelerimiz ile unutulmaz anlar yaşayın.
        </p>
      </div>
    </div>
  );
};

export default ServiceHero;
