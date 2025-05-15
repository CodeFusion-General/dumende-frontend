
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const ServiceCTA = () => {
  return (
    <section className="bg-primary/10 py-16 px-4">
      <div className="container-custom">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Denizde Özel Bir Plan Mı Yapıyorsunuz?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Küçük gruplardan büyük organizasyonlara kadar, deneyimli ekibimiz hayalinizdeki deniz deneyimini gerçeğe dönüştürmek için hazır. Size özel çözümler sunalım!
          </p>
          <Button asChild size="lg" className="px-8 py-6 text-lg">
            <Link to="/contact">Bizimle İletişime Geçin</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCTA;
