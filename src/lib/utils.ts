import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Cookie Utility Functions - JWT Token yönetimi için
export const cookieUtils = {
  // Cookie'yi güvenli şekilde set etme
  set: (name: string, value: string, expiresInSeconds?: number) => {
    let cookieString = `${name}=${encodeURIComponent(value)}; path=/; samesite=strict`;
    
    if (expiresInSeconds) {
      const expirationDate = new Date(Date.now() + expiresInSeconds * 1000);
      cookieString += `; expires=${expirationDate.toUTCString()}`;
    }
    
    // HTTPS'de secure flag ekle
    if (location.protocol === 'https:') {
      cookieString += '; secure';
    }
    
    document.cookie = cookieString;
  },

  // Cookie'yi okuma
  get: (name: string): string | null => {
    const cookies = document.cookie.split(';');
    const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
  },

  // Cookie'yi silme
  remove: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict`;
  },

  // Cookie'nin var olup olmadığını kontrol etme
  exists: (name: string): boolean => {
    return cookieUtils.get(name) !== null;
  }
};

// JWT Token spesifik fonksiyonları
export const tokenUtils = {
  // JWT token'ı cookie'ye kaydetme
  setAuthToken: (token: string, expiresIn: number) => {
    cookieUtils.set('authToken', token, expiresIn);
  },

  // JWT token'ı okuma
  getAuthToken: (): string | null => {
    return cookieUtils.get('authToken');
  },

  // JWT token'ı silme
  clearAuthToken: () => {
    cookieUtils.remove('authToken');
  },

  // Token'ın var olup olmadığını kontrol etme
  hasAuthToken: (): boolean => {
    return cookieUtils.exists('authToken');
  },

  // User bilgilerini cookie'ye kaydetme
  setUserData: (userData: any) => {
    cookieUtils.set('userData', JSON.stringify(userData));
  },

  // User bilgilerini okuma
  getUserData: (): any | null => {
    const userData = cookieUtils.get('userData');
    return userData ? JSON.parse(userData) : null;
  },

  // User ID'sini okuma
  getUserId: (): number | null => {
    const userData = tokenUtils.getUserData();
    return userData?.id || null;
  },

  // User bilgilerini silme
  clearUserData: () => {
    cookieUtils.remove('userData');
  },

  // Tüm auth verilerini temizleme
  clearAllAuthData: () => {
    tokenUtils.clearAuthToken();
    tokenUtils.clearUserData();
  }
};
