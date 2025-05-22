import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Clock } from 'lucide-react';

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
  
  // Mock veri - Backend hazır olduğunda kaldırılacak
  const posts = {
    "1": {
      title: "Türkiye'nin En Güzel 10 Koyu",
      content: "Mavi yolculuğunuzda keşfedebileceğiniz, Türkiye'nin en güzel ve el değmemiş koyları hakkında detaylı bilgiler ve öneriler. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=1920&auto=format&fit=crop",
      readingTime: 8,
      date: "15 Mayıs 2023"
    },
    "2": {
      title: "Tekne Kiralama Rehberi: Nelere Dikkat Etmelisiniz?",
      content: "İlk kez tekne kiralayacaklar için kapsamlı bir rehber: Bütçe planlaması, tekne türleri, sezon seçimi ve daha fazlası. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      imageUrl: "https://images.unsplash.com/photo-1586456248323-49e8f620d6c3?q=80&w=1920&auto=format&fit=crop",
      readingTime: 12,
      date: "3 Haziran 2023"
    },
    "3": {
      title: "Denizde Sürdürülebilirlik: Çevre Dostu Yatçılık",
      content: "Denizlerimizi korumak için yat sahiplerinin ve tekne kiralayanların uygulayabileceği çevre dostu yöntemler ve öneriler. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      imageUrl: "https://images.unsplash.com/photo-1484544808355-8ec84e534d75?q=80&w=1920&auto=format&fit=crop",
      readingTime: 10,
      date: "22 Temmuz 2023"
    },
  };

  const post = posts[id as keyof typeof posts];

  if (!post) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-custom">
            <h1 className="text-2xl font-bold">Blog yazısı bulunamadı</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center space-x-2 text-gray-500">
              <span>{post.date}</span>
              <span>•</span>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{post.readingTime} dk okuma</span>
              </div>
            </div>
          </div>
          
          <div className="aspect-video mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p>{post.content}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
