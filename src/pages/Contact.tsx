import React from 'react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translations } from '@/locales/translations';

const Contact = () => {
  const { language } = useLanguage();
  const t = translations[language];

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
  };

  return (
    <Layout>
      <div className="container-custom py-16">
        {/* Contact Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">{t.pages.contact.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.pages.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-8 text-primary">{t.pages.contact.info.title}</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{t.pages.contact.info.address}</h3>
                  <p className="text-gray-600">
                    Fenerbahçe Marina, Kadıköy<br />
                    34726 İstanbul, Türkiye
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{t.pages.contact.info.phone}</h3>
                  <p className="text-gray-600">+90 216 123 45 67</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{t.pages.contact.info.email}</h3>
                  <p className="text-gray-600">info@dumenden.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">{t.pages.contact.info.workingHours}</h3>
                  <p className="text-gray-600">{t.pages.contact.info.workingHoursValue}</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-12 bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500">Harita yüklenecek (Google Maps entegrasyonu)</p>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold mb-8 text-primary">{t.pages.contact.form.title}</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pages.contact.form.name} *
                </label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder={t.pages.contact.form.namePlaceholder}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pages.contact.form.email} *
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t.pages.contact.form.emailPlaceholder}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pages.contact.form.subject} *
                </label>
                <Input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder={t.pages.contact.form.subjectPlaceholder}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.pages.contact.form.message} *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder={t.pages.contact.form.messagePlaceholder}
                  required
                  className="w-full resize-none"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark">
                {t.pages.contact.form.send}
              </Button>
            </form>

            {/* Backend Ready Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Form fonksiyonelliği backend hazır olduğunda aktif olacak.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
