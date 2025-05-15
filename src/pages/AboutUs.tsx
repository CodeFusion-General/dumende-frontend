
import React from 'react';
import Layout from '../components/layout/Layout';
import { Users, Anchor, Award, Shell } from 'lucide-react';

const AboutUs = () => {
  return (
    <Layout>
      <div className="container-custom py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">Hakkımızda</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            2015'ten beri deniz tutkunlarına özel yat kiralama hizmetleri sunuyoruz. 
            Misyonumuz, sizlere unutulmaz deniz deneyimleri yaşatmak.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Users className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Deneyimli Ekip</h3>
            <p className="text-gray-600">Profesyonel ve deneyimli ekibimizle size en iyi hizmeti sunuyoruz.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Anchor className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Geniş Filo</h3>
            <p className="text-gray-600">Her bütçe ve ihtiyaca uygun tekne seçenekleri sunuyoruz.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Award className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kalite Güvencesi</h3>
            <p className="text-gray-600">Yüksek standartlarda bakımlı tekneler ve özel hizmet.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <Shell className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Özel Deneyim</h3>
            <p className="text-gray-600">Size özel planlanmış, unutulmaz deniz yolculukları.</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-secondary/5 rounded-2xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-primary">Hikayemiz</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                2015 yılında İstanbul'da küçük bir ofiste başlayan yolculuğumuz, bugün Türkiye'nin önde gelen yat kiralama platformlarından biri olarak devam ediyor.
              </p>
              <p>
                Misyonumuz, deniz tutkunlarına en kaliteli ve güvenilir yat kiralama hizmetini sunmak. Her geçen yıl büyüyen filomuz ve profesyonel ekibimizle, müşterilerimize unutulmaz deneyimler yaşatıyoruz.
              </p>
              <p>
                Türkiye'nin en güzel koylarında, en prestijli marinalarında hizmet veren dümende.com, sizlere lüks ve konforlu bir deniz tatili sunmak için çalışıyor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
