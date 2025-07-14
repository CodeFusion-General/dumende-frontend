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

        // Token ve user bilgilerinin ikisi de varsa ve tutarlıysa state'i güncelle
        if (storedToken && storedUser) {
          // Token'ın geçerli olup olmadığını kontrol et (basit format kontrolü)
          if (storedToken.includes('.') && storedUser.id && storedUser.role) {
            setToken(storedToken);
            setUser(storedUser);
            console.log('Auth state initialized from cookies:', { 
              hasToken: !!storedToken, 
              userId: storedUser.id, 
              role: storedUser.role 
            });
          } else {
            // Geçersiz data varsa temizle
            console.warn('Invalid auth data found in cookies, clearing...');
            tokenUtils.clearAllAuthData();
          }
        } else if (storedToken || storedUser) {
          // Eksik data varsa (sadece token veya sadece user) temizle
          console.warn('Incomplete auth data found in cookies, clearing...');
          tokenUtils.clearAllAuthData();
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
      
      // AuthService zaten token'ı cookie'ye kaydediyor, burada state'i güncelle
      setToken(response.token);
      setUser({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
      
      // Çifte kayıt problemini önlemek için tokenUtils'i tekrar çağırmıyoruz
    } catch (error) {
      console.error('Login error:', error);
      // Hata durumunda auth verilerini temizle
      tokenUtils.clearAllAuthData();
      setToken(null);
      setUser(null);
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
      
      // AuthService zaten token'ı cookie'ye kaydediyor, burada state'i güncelle
      setToken(response.token);
      setUser({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
      
      // Çifte kayıt problemini önlemek için tokenUtils'i tekrar çağırmıyoruz
    } catch (error) {
      console.error('Register error:', error);
      // Hata durumunda auth verilerini temizle
      tokenUtils.clearAllAuthData();
      setToken(null);
      setUser(null);
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
      
      // AuthService zaten token'ı cookie'ye kaydediyor, burada state'i güncelle
      setToken(response.token);
      setUser({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      // Refresh token başarısız olursa tüm auth verilerini temizle
      tokenUtils.clearAllAuthData();
      setToken(null);
      setUser(null);
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