import React, { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { contactService, ContactMessage } from "@/services/contactService";

const ContactForm = () => {
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
      console.log("🚀 ContactForm: Backend'e mesaj gönderiliyor...", formData);

      const response = await contactService.submitMessage(formData);
      console.log("✅ ContactForm: Mesaj başarıyla gönderildi:", response);

      setSubmitSuccess(true);
      setBackendMessage(response.message);
      setFormData({ name: "", email: "", phone: "", message: "" });

      // Reset success message after 8 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setBackendMessage("");
      }, 8000);
    } catch (error: any) {
      console.error("❌ ContactForm mesaj gönderme hatası:", error);
      setSubmitError(
        error.response?.data?.message ||
          "Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
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
              Bize Ulaşın
            </h2>
            <p className="text-gray-600 mb-6">
              Sorularınız, özel istekleriniz veya rezervasyon bilgileri için
              bizimle iletişime geçebilirsiniz. En kısa sürede size dönüş
              yapacağız.
            </p>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <h3 className="font-bold text-xl mb-4">İletişim Bilgileri</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm">Adres</p>
                  <p className="font-medium">
                    Fenerbahçe Marina, Kadıköy, İstanbul, Türkiye
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Telefon</p>
                  <a
                    href="tel:+902161234567"
                    className="font-medium hover:text-primary transition-colors"
                  >
                    +90 216 123 45 67
                  </a>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">E-posta</p>
                  <a
                    href="mailto:info@dumenden.com"
                    className="font-medium hover:text-primary transition-colors"
                  >
                    info@dumenden.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 md:p-8">
            <h3 className="font-bold text-2xl mb-6">Mesaj Gönderin</h3>

            {/* Success Message */}
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-start">
                <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">
                    Mesajınız başarıyla gönderildi!
                  </p>
                  <p className="text-sm text-green-600">{backendMessage}</p>
                  <p className="text-xs text-green-500 mt-2">
                    ✅ Backend'den onay alındı
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium mb-1">Hata!</p>
                  <p className="text-sm">{submitError}</p>
                </div>
              </div>
            )}

            {!submitSuccess && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      İsim Soyisim <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="İsminizi giriniz"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      E-posta <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="E-posta adresinizi giriniz"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Telefon numaranızı giriniz"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Mesajınız <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Mesajınızı giriniz"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Backend'e gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Mesaj Gönder</span>
                    </>
                  )}
                </button>

                {/* Backend Status */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    📡 Formlar backend ContactController'a gönderilir
                  </p>
                </div>
              </form>
            )}

            {/* Show form again button after success */}
            {submitSuccess && (
              <button
                onClick={() => {
                  setSubmitSuccess(false);
                  setBackendMessage("");
                }}
                className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Yeni Mesaj Gönder
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
