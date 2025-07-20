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
  
  // No mock data - use real API when backend is ready
  const post = null;

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
