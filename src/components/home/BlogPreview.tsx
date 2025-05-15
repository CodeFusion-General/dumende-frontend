
import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const BlogPreview = () => {
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
    <div className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Blog
            </h2>
            <p className="text-gray-600">
              Denizcilik ve yatçılık hakkında en güncel bilgiler
            </p>
          </div>
          <Link to="/blog" className="flex items-center space-x-2 text-primary font-medium mt-4 md:mt-0 group">
            <span>Tüm Yazıları Görüntüle</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link to={`/blog/${post.id}`} key={post.id} className="group">
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      <span>{post.readingTime} dk okuma</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPreview;
