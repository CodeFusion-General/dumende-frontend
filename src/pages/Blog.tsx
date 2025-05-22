import React from 'react';
import Layout from '../components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

const Blog = () => {
  const { language } = useLanguage();
  
  /* Backend hazır olduğunda kullanılacak state ve useEffect:
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await blogService.getAllPosts();
        setPosts(response);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading blog posts</div>;
  */
  
  const translations = {
    tr: {
      title: "Blog Yazılarımız",
      description: "Denizcilik ve yatçılık hakkında en güncel bilgiler",
      readingTime: "dk okuma",
    },
    en: {
      title: "Our Blog Posts",
      description: "Latest information about maritime and yachting",
      readingTime: "min read",
    }
  };

  const t = translations[language];

  // Mock veri - Backend hazır olduğunda kaldırılacak
  const posts = [
    {
      id: "1",
      title: "Türkiye'nin En Güzel 10 Koyu",
      excerpt: "Mavi yolculuğunuzda keşfedebileceğiniz, Türkiye'nin en güzel ve el değmemiş koyları hakkında detaylı bilgiler ve öneriler.",
      imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800&auto=format&fit=crop",
      readingTime: 8,
      date: "15 Mayıs 2023"
    },
    {
      id: "2",
      title: "Tekne Kiralama Rehberi: Nelere Dikkat Etmelisiniz?",
      excerpt: "İlk kez tekne kiralayacaklar için kapsamlı bir rehber: Bütçe planlaması, tekne türleri, sezon seçimi ve daha fazlası.",
      imageUrl: "https://images.unsplash.com/photo-1586456248323-49e8f620d6c3?q=80&w=800&auto=format&fit=crop",
      readingTime: 12,
      date: "3 Haziran 2023"
    },
    {
      id: "3",
      title: "Denizde Sürdürülebilirlik: Çevre Dostu Yatçılık",
      excerpt: "Denizlerimizi korumak için yat sahiplerinin ve tekne kiralayanların uygulayabileceği çevre dostu yöntemler ve öneriler.",
      imageUrl: "https://images.unsplash.com/photo-1484544808355-8ec84e534d75?q=80&w=800&auto=format&fit=crop",
      readingTime: 10,
      date: "22 Temmuz 2023"
    },
  ];

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-gray-600 text-lg">
              {t.description}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link to={`/blog/${post.id}`} key={post.id}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                      <span>{post.date}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{post.readingTime} {t.readingTime}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
