
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthDialog: React.FC<AuthDialogProps> = ({ 
  isOpen, 
  onClose, 
  initialTab = 'login' 
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {activeTab === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="register">Hesap Oluştur</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
