import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';

interface AuthNotificationsProviderProps {
  children: React.ReactNode;
}

const AuthNotificationsProvider: React.FC<AuthNotificationsProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  return (
    <NotificationsProvider userId={user.id}>
      {children}
    </NotificationsProvider>
  );
};

export default AuthNotificationsProvider;