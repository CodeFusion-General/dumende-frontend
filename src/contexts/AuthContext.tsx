import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { 
  AuthContextType, 
  AuthUser, 
  LoginRequest, 
  RegisterRequest,
  UserType 
} from '@/types/auth.types';
import { tokenUtils } from '@/lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sayfa yüklendiğinde cookie'den auth state'i yükle
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = tokenUtils.getAuthToken();
        const storedUser = tokenUtils.getUserData();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Hatalı data varsa temizle
        tokenUtils.clearAllAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login fonksiyonu
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      // State'i güncelle
      setToken(response.token);
      setUser({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register fonksiyonu
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      // State'i güncelle
      setToken(response.token);
      setUser({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout fonksiyonu
  const logout = (): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  // Token refresh fonksiyonu
  const refreshToken = async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();
      
      setToken(response.token);
      setUser({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      throw error;
    }
  };

  // Authentication durumu
  const isAuthenticated = !!token && !!user;

  // Role kontrolü helper fonksiyonları
  const hasRole = (role: UserType): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => hasRole(UserType.ADMIN);
  const isBoatOwner = (): boolean => hasRole(UserType.BOAT_OWNER);
  const isCustomer = (): boolean => hasRole(UserType.CUSTOMER);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    // Helper methods
    hasRole,
    isAdmin,
    isBoatOwner,
    isCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext }; 