import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { authService } from "@/services/authService";
import {
  AuthContextType,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserType,
} from "@/types/auth.types";
import { UserDTO } from "@/types/contact.types";
import { tokenUtils } from "@/lib/utils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
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
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        const storedToken = tokenUtils.getAuthToken();
        const storedUser = tokenUtils.getUserData();

        if (!isMounted) return; // Double check

        // Token ve user bilgilerinin ikisi de varsa ve tutarlıysa state'i güncelle
        if (storedToken && storedUser) {
          // Token'ın geçerli olup olmadığını kontrol et (basit format kontrolü)
          if (storedToken.includes(".") && storedUser.id && storedUser.role) {
            if (isMounted) {
              setToken(storedToken);
              setUser(storedUser);
            }
          } else {
            // Geçersiz data varsa temizle
            tokenUtils.clearAllAuthData();
          }
        } else if (storedToken || storedUser) {
          // Eksik data varsa (sadece token veya sadece user) temizle
          tokenUtils.clearAllAuthData();
        }
      } catch (error) {
        // Hatalı data varsa temizle
        tokenUtils.clearAllAuthData();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login fonksiyonu - memoized to prevent unnecessary re-renders
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
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
        accountId: response.accountId,
        // For existing users, we'll assume profile is complete unless we know otherwise
        // This can be updated when we fetch user details from the API
        isProfileComplete: true,
      });

      // Çifte kayıt problemini önlemek için tokenUtils'i tekrar çağırmıyoruz
    } catch (error) {
      // Hata durumunda auth verilerini temizle
      tokenUtils.clearAllAuthData();
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register fonksiyonu - memoized
  const register = useCallback(async (data: RegisterRequest): Promise<LoginResponse> => {
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
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        accountId: response.accountId ?? response.userId,
        isProfileComplete: true, // Skip profile completion step
      });

      // Çifte kayıt problemini önlemek için tokenUtils'i tekrar çağırmıyoruz
      return response;
    } catch (error) {
      // Hata durumunda auth verilerini temizle
      tokenUtils.clearAllAuthData();
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout fonksiyonu - memoized
  const logout = useCallback((): void => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  // Token refresh fonksiyonu - memoized
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const response = await authService.refreshToken();

      // AuthService zaten token'ı cookie'ye kaydediyor, burada state'i güncelle
      setToken(response.token);
      setUser((prevUser) => ({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
        accountId: response.accountId,
        // Preserve existing profile completion status during refresh
        isProfileComplete: prevUser?.isProfileComplete ?? true,
        fullName: prevUser?.fullName,
        phoneNumber: prevUser?.phoneNumber,
        profileImage: prevUser?.profileImage,
        firstName: prevUser?.firstName,
        lastName: prevUser?.lastName,
        dateOfBirth: prevUser?.dateOfBirth,
      }));
    } catch (error) {
      // Refresh token başarısız olursa tüm auth verilerini temizle
      tokenUtils.clearAllAuthData();
      setToken(null);
      setUser(null);
      authService.logout();
      throw error;
    }
  }, []);

  // Authentication durumu - memoized
  const isAuthenticated = useMemo(() => !!token && !!user, [token, user]);

  // Role kontrolü helper fonksiyonları - memoized
  const hasRole = useCallback((role: UserType): boolean => {
    return user?.role === role;
  }, [user?.role]);

  const isAdmin = useCallback((): boolean => user?.role === UserType.ADMIN, [user?.role]);
  const isBoatOwner = useCallback((): boolean => user?.role === UserType.BOAT_OWNER, [user?.role]);
  const isCustomer = useCallback((): boolean => user?.role === UserType.CUSTOMER, [user?.role]);

  // Profile completion helper methods - memoized
  const isProfileComplete = useCallback((): boolean => {
    if (!user) return false;

    // Check if user has explicitly marked profile as complete
    if (user.isProfileComplete !== undefined) {
      return user.isProfileComplete;
    }

    // Fallback: check if essential profile fields are present
    return !!(
      user.fullName &&
      user.phoneNumber &&
      user.firstName &&
      user.lastName
    );
  }, [user]);

  const needsProfileCompletion = useCallback((): boolean => {
    return isAuthenticated && !isProfileComplete();
  }, [isAuthenticated, isProfileComplete]);

  const getProfileCompletionRedirectPath = useCallback((): string | null => {
    if (!needsProfileCompletion()) {
      return null;
    }
    const targetId = user?.accountId ?? user?.id;
    return targetId ? `/profile-completion/${targetId}` : null;
  }, [needsProfileCompletion, user?.accountId, user?.id]);

  const updateUserData = useCallback((userData: Partial<AuthUser>): void => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      tokenUtils.setUserData(updatedUser);
      return updatedUser;
    });
  }, []);

  const updateUserFromProfile = useCallback((userDto: UserDTO): void => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updatedUser: AuthUser = {
        ...prevUser,
        fullName: userDto.fullName,
        phoneNumber: userDto.phoneNumber,
        profileImage: userDto.profileImage,
        isProfileComplete: true,
        // Extract firstName and lastName from fullName if not already present
        firstName: prevUser.firstName || userDto.fullName.split(" ")[0],
        lastName:
          prevUser.lastName || userDto.fullName.split(" ").slice(1).join(" "),
      };
      tokenUtils.setUserData(updatedUser);
      return updatedUser;
    });
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value: AuthContextType = useMemo(() => ({
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
    // Profile completion methods
    isProfileComplete,
    updateUserData,
    updateUserFromProfile,
    needsProfileCompletion,
    getProfileCompletionRedirectPath,
  }), [
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    hasRole,
    isAdmin,
    isBoatOwner,
    isCustomer,
    isProfileComplete,
    updateUserData,
    updateUserFromProfile,
    needsProfileCompletion,
    getProfileCompletionRedirectPath,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
