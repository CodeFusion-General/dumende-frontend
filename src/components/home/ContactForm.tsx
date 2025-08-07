import React, { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { contactService, ContactMessage } from "@/services/contactService";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/locales/translations";

const ContactForm = () => {
  const { language } = useLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState<ContactMessage>({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState<string>("");
  const [hpToken, setHpToken] = useState<string>(""); // honeypot

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Basic client-side validation (kurumsal standart)
      if (!formData.name || formData.name.trim().length < 2) {
        throw new Error(
          language === "tr" ? "Lütfen geçerli bir isim giriniz" : "Please enter a valid name"
        );
      }
      const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/;
      if (!emailRegex.test(formData.email)) {
        throw new Error(
          language === "tr" ? "Lütfen geçerli bir e-posta giriniz" : "Please enter a valid email"
        );
      }
      if (!formData.message || formData.message.trim().length < 10) {
        throw new Error(
          language === "tr"
            ? "Mesaj en az 10 karakter olmalıdır"
            : "Message must be at least 10 characters"
        );
      }

      // Honeypot: eğer doluysa işlemi durdur
      if (hpToken) {
        setIsSubmitting(false);
        return;
      }

      const response = await contactService.submitMessage(formData);
      setSubmitSuccess(true);
      setBackendMessage(response.message);
      setFormData({ name: "", email: "", phone: "", message: "" });

      // Reset success message after 8 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setBackendMessage("");
      }, 8000);
    } catch (error: any) {
      console.error("ContactForm mesaj gönderme hatası:", error);
      setSubmitError(
        error.response?.data?.message || t.home.contact.form.error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <div className="inline-block p-3 bg-primary/10 rounded-xl mb-6">
              <Mail className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t.home.contact.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {t.home.contact.subtitle}
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-xl mb-4">{t.home.contact.info.title}</h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t.home.contact.info.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      Fenerbahçe Marina, Kadıköy, İstanbul, Türkiye
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t.home.contact.info.phone}
                    </p>
                    <p className="text-sm text-gray-600">+90 216 123 45 67</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {t.home.contact.info.email}
                    </p>
                    <p className="text-sm text-gray-600">info@dumenden.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t.home.contact.form.title}
            </h3>

            {/* Success Message */}
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-green-800 font-medium">
                      {t.home.contact.form.success}
                    </p>
                    {backendMessage && (
                      <p className="text-green-700 text-sm mt-1">
                        {backendMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" aria-live="polite">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                  <p className="text-red-800">{submitError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot alanı (gizli) */}
              <div className="hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="text"
                  value={hpToken}
                  onChange={(e) => setHpToken(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t.home.contact.form.name} {t.home.contact.form.required}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.home.contact.form.namePlaceholder}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t.home.contact.form.email} {t.home.contact.form.required}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.home.contact.form.emailPlaceholder}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t.home.contact.form.phone}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.home.contact.form.phonePlaceholder}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-900 mb-2"
                >
                  {t.home.contact.form.message} {t.home.contact.form.required}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t.home.contact.form.messagePlaceholder}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-top-transparent"></div>
                    <span>{t.home.contact.form.sending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{t.home.contact.form.send}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;

