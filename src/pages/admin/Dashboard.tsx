
import React from 'react';
import CaptainLayout from '@/components/admin/layout/CaptainLayout';
import { CheckCircle, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // These would be fetched from an API in a real application
  const onboardingTasks = [
    { id: 1, title: 'Şirket bilgilerini gir', completed: false, path: '/admin/company' },
    { id: 2, title: 'Profil bilgilerini tamamla', completed: false, path: '/admin/profile' },
    { id: 3, title: 'Tekneni ekle', completed: false, path: '/admin/vessels' },
    { id: 4, title: 'Fiyat bilgilerini gir', completed: false, path: '/admin/pricing' },
    { id: 5, title: 'Müsaitlik takvimini oluştur', completed: false, path: '/admin/availability' },
  ];

  return (
    <SidebarProvider>
      <CaptainLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Hoş Geldiniz, Kaptan</h1>
            <p className="text-gray-500">Son Giriş: {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-[#2c3e50]">Başlamak İçin</h2>
            <p className="text-gray-600 mb-6">
              dümende platformuna hoş geldiniz. Teknenizi kiralamaya başlamak için aşağıdaki adımları tamamlayın.
            </p>
            
            <div className="space-y-4">
              {onboardingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-start p-4 border rounded-md bg-gray-50 hover:shadow-sm transition-shadow"
                >
                  <div className="mr-3 mt-0.5 text-[#15847c]">
                    {task.completed ? <CheckCircle size={20} /> : <CircleDashed size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {task.completed 
                        ? 'Tamamlandı' 
                        : 'Bu görevi tamamlamak için aşağıdaki butona tıklayın.'}
                    </p>
                    {!task.completed && (
                      <Button 
                        className="mt-2 bg-[#15847c] hover:bg-[#0e5c56] shadow-sm"
                        onClick={() => navigate(task.path)}
                      >
                        Devam Et
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-[#2c3e50]">Duyurular</h2>
              <p className="text-gray-600">
                Henüz okunmamış duyurunuz bulunmamaktadır.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-[#2c3e50]">Özet</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                  <span className="text-gray-600">Toplam Tekne</span>
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-[#15847c]">0</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                  <span className="text-gray-600">Bekleyen Rezervasyonlar</span>
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-[#15847c]">0</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors">
                  <span className="text-gray-600">Bugünkü Turlar</span>
                  <span className="font-medium bg-gray-100 px-3 py-1 rounded-full text-[#15847c]">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CaptainLayout>
    </SidebarProvider>
  );
};

export default Dashboard;
