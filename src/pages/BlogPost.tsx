import React from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { Clock, ArrowLeft, Share2, Calendar } from "lucide-react";

const BlogPost = () => {
  const { id } = useParams();

  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await blogService.getPostById(id);
        setPost(response);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch blog post:', error);
        setError(error);
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading blog post</div>;
  */

  // Mock blog posts data
  const mockPosts = {
    "tekne-kiralama-rehberi": {
      id: "tekne-kiralama-rehberi",
      title: "Tekne Kiralama Rehberi: İlk Kez Tekne Kiralayacaklar İçin",
      date: "15 Ağustos 2024",
      readingTime: "8",
      imageUrl:
        "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=1200&h=600&fit=crop&q=80",
      category: "Rehber",
      author: "Dumende Ekibi",
      content: `
        <h2>Tekne Kiralamanın Temel Kuralları</h2>
        <p>Tekne kiralamak, deniz severlerin en çok tercih ettiği aktivitelerden biridir. Ancak ilk kez tekne kiralayacak olanlar için bazı önemli noktalar bulunmaktadır.</p>
        
        <h3>1. Ehliyet ve Belgeler</h3>
        <p>Tekne kullanabilmek için geçerli bir denizci belgesi veya yat kaptanı belgeniz olması gerekmektedir. Eğer belgeniz yoksa, kaptan hizmeti ile birlikte kiralama yapabilirsiniz.</p>
        
        <h3>2. Tekne Seçimi</h3>
        <p>İhtiyaçlarınıza uygun tekne seçimi yapmak çok önemlidir. Kişi sayısı, gezi süresi ve istediğiniz konfora göre seçim yapmalısınız.</p>
        
        <h3>3. Güvenlik Ekipmanları</h3>
        <p>Her teknede bulunması gereken temel güvenlik ekipmanları: can yelekleri, yangın söndürme cihazı, ilk yardım çantası ve iletişim ekipmanları.</p>
        
        <h3>4. Kiralama Süreci</h3>
        <p>Rezervasyon yaparken mutlaka tekneyi önceden görmenizi öneririz. Tüm özellikleri kontrol edin ve anlaşmayı detaylıca okuyun.</p>
        
        <h3>5. Fiyatlandırma</h3>
        <p>Tekne kiralama fiyatları sezona, tekne tipine ve ek hizmetlere göre değişiklik gösterir. Karşılaştırma yaparak en uygun seçeneği bulabilirsiniz.</p>
        
        <p><strong>Sonuç:</strong> Doğru planlama ve hazırlık ile tekne kiralama deneyiminiz unutulmaz olacaktır. Dumende olarak size en iyi hizmeti sunmak için buradayız.</p>
      `,
    },
    "istanbul-koylari": {
      id: "istanbul-koylari",
      title: "İstanbul'un En Güzel Koyları: Tekne Turu Rotaları",
      date: "12 Ağustos 2024",
      readingTime: "6",
      imageUrl:
        "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&h=600&fit=crop&q=80",
      category: "Destinasyon",
      author: "Deniz Rehberi",
      content: `
        <h2>İstanbul'un Saklı Cennetleri</h2>
        <p>İstanbul ve çevresinde tekne ile keşfedebileceğiniz birçok muhteşem koy bulunmaktadır. İşte en popüler rotalarımız:</p>
        
        <h3>1. Büyükada Koyları</h3>
        <p>Büyükada'nın kuzey kıyılarında yer alan saklı koylar, berrak suları ve doğal güzellikleriyle dikkat çeker. Özellikle Dilburnu ve Yörükali koyları çok popülerdir.</p>
        
        <h3>2. Heybeliada - Çam Limanı</h3>
        <p>Heybeliada'nın güney kısmında bulunan Çam Limanı, çam ağaçlarıyla çevrili ve oldukça sakin bir koydir. Aile gezileri için idealdir.</p>
        
        <h3>3. Kilyos Koyları</h3>
        <p>Karadeniz kıyısında yer alan Kilyos, geniş plajları ve temiz suyu ile ünlüdür. Tekne ile yaklaştığınızda muhteşem manzaralar sizi bekler.</p>
        
        <h3>4. Polonezköy Rezervuarı</h3>
        <p>Doğal koruma altındaki bu alan, kuş gözlemciliği ve fotoğrafçılık için mükemmel bir lokasyondur.</p>
        
        <h3>5. Şile Koyları</h3>
        <p>Şile çevresindeki küçük koylar, sakin ve huzurlu bir gün geçirmek isteyenler için idealdir.</p>
        
        <h3>Gezi Önerileri</h3>
        <ul>
          <li>Sabah erken saatlerde çıkmak daha az kalabalık olacaktır</li>
          <li>Güneş kremi ve şapka almayı unutmayın</li>
          <li>Suya girecekseniz deniz ayakkabısı kullanın</li>
          <li>Çöpünüzü mutlaka yanınızda götürün</li>
        </ul>
        
        <p><strong>Not:</strong> Hava koşullarını takip ederek güvenli seyir yapmanızı öneririz.</p>
      `,
    },
    "tekne-guvenligi": {
      id: "tekne-guvenligi",
      title: "Tekne Güvenliği: Denizde Güvenli Seyir İpuçları",
      date: "8 Ağustos 2024",
      readingTime: "10",
      imageUrl:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=600&fit=crop&q=80",
      category: "Güvenlik",
      author: "Kaptan Ahmet",
      content: `
        <h2>Denizde Güvenlik Önceliğimizdir</h2>
        <p>Tekne ile deniz keyfi yaparken güvenliğiniz her şeyden önemlidir. İşte bilmeniz gereken temel güvenlik kuralları:</p>
        
        <h3>1. Hava Durumu Kontrolü</h3>
        <p>Denize çıkmadan önce hava durumunu mutlaka kontrol edin. Fırtına uyarısı varsa kesinlikle denize çıkmayın.</p>
        
        <h3>2. Güvenlik Ekipmanları</h3>
        <h4>Zorunlu Ekipmanlar:</h4>
        <ul>
          <li>Her kişi için can yeleği</li>
          <li>Yangın söndürücü</li>
          <li>İlk yardım çantası</li>
          <li>Sinyal fişekleri</li>
          <li>VHF telsiz</li>
          <li>GPS veya navigasyon sistemi</li>
        </ul>
        
        <h3>3. Seyir Öncesi Kontroller</h3>
        <ul>
          <li>Yakıt seviyesi kontrolü</li>
          <li>Motor kontrolü</li>
          <li>Elektrik sistemi kontrolü</li>
          <li>Su kaçağı kontrolü</li>
          <li>Güvenlik ekipmanlarının yerinde olup olmadığı</li>
        </ul>
        
        <h3>4. Seyir Kuralları</h3>
        <p>Deniz trafik kurallarına uygun hareket edin. Diğer teknelerin geçiş hakkına saygı gösterin ve güvenli mesafe bırakın.</p>
        
        <h3>5. Acil Durum Prosedürleri</h3>
        <h4>Motor Arızası:</h4>
        <p>Motor arızası durumunda panik yapmayın. Çapayı atın ve yardım isteyin.</p>
        
        <h4>Su Kaçağı:</h4>
        <p>Su kaçağı durumunda önce kaçağın yerini tespit edin. Geçici onarım yapın ve en yakın limana yönelin.</p>
        
        <h4>Yangın:</h4>
        <p>Yangın durumunda motoru kapatın, elektriği kesin ve yangın söndürücüyü kullanın.</p>
        
        <h3>6. İletişim</h3>
        <p>VHF telsizi her zaman açık tutun. Channel 16 acil durum kanalıdır ve sürekli dinlenmelidir.</p>
        
        <h3>7. İlk Yardım Bilgisi</h3>
        <p>Temel ilk yardım bilgisine sahip olun. Özellikle boğulma, kesik ve yanık müdahalelerini öğrenin.</p>
        
        <p><strong>Hatırlatma:</strong> Güvenlik hiçbir zaman tesadüfe bırakılmamalıdır. Her zaman hazırlıklı olun ve kurallara uyun.</p>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4>🚨 Acil Durum Numaraları:</h4>
          <p><strong>Sahil Güvenlik:</strong> 158</p>
          <p><strong>Genel Acil:</strong> 112</p>
        </div>
      `,
    },
  };

  const post = mockPosts[id as keyof typeof mockPosts];

  if (!post) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Blog yazısı bulunamadı
            </h1>
            <p className="text-gray-600 mb-8">
              Aradığınız blog yazısı mevcut değil veya kaldırılmış olabilir.
            </p>
            <a
              href="/blog"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Blog Ana Sayfası
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-700 hover:scale-110"
          style={{ backgroundImage: `url(${post.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80"></div>
        </div>

        <div className="relative h-full flex items-end">
          <div className="container-custom pb-16">
            <Link
              to="/blog"
              className="inline-flex items-center text-white/90 hover:text-white mb-8 transition-all duration-300 hover:translate-x-[-4px] group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-[-2px]" />
              <span className="font-medium">Blog'a Dön</span>
            </Link>

            <div className="max-w-5xl">
              <div className="flex items-center space-x-4 mb-6">
                <span className="px-4 py-2 bg-primary/90 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20">
                  {post.category}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">
                      {post.author
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <span className="font-medium">{post.author}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">{post.date}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">
                    {post.readingTime} dk okuma
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 pb-8 border-b border-gray-200">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Son güncelleme: {post.date}
            </div>

            <button className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-primary border border-gray-300 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 hover:shadow-md">
              <Share2 className="w-4 h-4" />
              <span className="font-medium">Paylaş</span>
            </button>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none">
            <div
              className="blog-content prose prose-lg max-w-none 
                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:pb-3
                [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-10 [&_h3]:mb-4
                [&_h4]:text-xl [&_h4]:font-medium [&_h4]:text-gray-800 [&_h4]:mt-8 [&_h4]:mb-3
                [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-lg
                [&_ul]:mb-8 [&_ul]:space-y-3 [&_ol]:mb-8 [&_ol]:space-y-3
                [&_li]:text-gray-700 [&_li]:leading-relaxed [&_li]:text-lg [&_li]:pl-2
                [&_strong]:font-semibold [&_strong]:text-gray-900
                [&_div[style*='background-color']]:rounded-xl [&_div[style*='background-color']]:p-8 
                [&_div[style*='background-color']]:my-8 [&_div[style*='background-color']]:border-l-4 
                [&_div[style*='background-color']]:border-blue-500 [&_div[style*='background-color']]:shadow-sm"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Call to Action */}
          <div className="mt-20 p-10 bg-gradient-to-br from-primary/10 via-blue-50 to-primary/5 rounded-3xl border border-primary/20 shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Tekne Kiralama için Hazır mısınız?
              </h3>
              <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
                Dumende ile hayalinizdeki tekne deneyimini yaşayın. Güvenli,
                konforlu ve unutulmaz anlar için hemen rezervasyon yapın.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/boats"
                  className="px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Tekneleri İncele
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-semibold"
                >
                  Bize Ulaşın
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
