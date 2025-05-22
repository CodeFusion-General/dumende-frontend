import React from 'react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact = () => {
  /* Backend hazır olduğunda kullanılacak state:
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    /* Backend hazır olduğunda kullanılacak kod:
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const contactData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    setLoading(true);
    setError(null);
    
    try {
      await contactService.sendContactForm(contactData);
      setSuccess(true);
      form.reset();
    } catch (error) {
      setError('Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      console.error('Failed to send contact form:', error);
    } finally {
      setLoading(false);
    }
    */
    console.log('Form submitted');
  };

  return (
    <Layout>
      <div className="container-custom py-16">
        {/* Contact Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">İletişim</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sorularınız için bizimle iletişime geçebilir veya ofisimizi ziyaret edebilirsiniz.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-primary">İletişim Bilgileri</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Adres</h3>
                    <p className="text-gray-600">Fenerbahçe Marina, Kadıköy</p>
                    <p className="text-gray-600">İstanbul, Türkiye</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Telefon</h3>
                    <p className="text-gray-600">+90 216 123 45 67</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">E-posta</h3>
                    <p className="text-gray-600">info@dumenden.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/5 p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-4 text-primary">Çalışma Saatleri</h2>
              <div className="space-y-2 text-gray-600">
                <p>Pazartesi - Cuma: 09:00 - 18:00</p>
                <p>Cumartesi: 10:00 - 15:00</p>
                <p>Pazar: Kapalı</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-primary">Bize Ulaşın</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  İsim Soyisim
                </label>
                <Input id="name" placeholder="İsim Soyisim" required />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  E-posta
                </label>
                <Input id="email" type="email" placeholder="E-posta adresiniz" required />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Konu
                </label>
                <Input id="subject" placeholder="Mesajınızın konusu" required />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Mesaj
                </label>
                <Textarea
                  id="message"
                  placeholder="Mesajınızı yazın..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Gönder
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
