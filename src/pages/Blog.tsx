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

  // No mock data - use real API when backend is ready
  const posts: any[] = [];

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
