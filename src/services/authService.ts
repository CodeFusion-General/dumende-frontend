import { BaseService } from "./base/BaseService";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthUser,
  AccountDTO,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdatePasswordRequest,
  UserType,
} from "@/types/auth.types";
import { tokenUtils } from "@/lib/utils";
import axios, { AxiosInstance } from "axios";

class AuthService extends BaseService {
  protected authApi: AxiosInstance;

  constructor() {
    super("/auth");
    // Auth için tamamen ayrı axios instance - /api prefix kullanarak
    this.authApi = axios.create({
      baseURL: "/api", // /api prefix ile backend'e yönlendirme
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Auth API için ayrı interceptors
    this.setupAuthInterceptors();
  }

  private setupAuthInterceptors(): void {
    // Request interceptor - JWT token'ı otomatik header'a ekle
    this.authApi.interceptors.request.use(
      (config) => {
        const token = tokenUtils.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Token expiry ve error handling
    this.authApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired veya invalid - auth verilerini temizle
          tokenUtils.clearAllAuthData();
          
          // Captain panelindeyse captain login'e, normal sayfadaysa ana sayfaya yönlendir
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/captain')) {
            window.location.href = "/?auth=true"; // Auth modal'ı açmak için
          } else if (currentPath.startsWith('/admin')) {
            window.location.href = "/?auth=true"; // Auth modal'ı açmak için  
          } else {
            // Normal sayfalarda auth modal'ı aç
            window.location.href = "/?auth=true";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Override base methods to use direct auth endpoints
  protected async authGet<T>(url: string, params?: any): Promise<T> {
    try {
      const response = await this.authApi.get(`/auth${url}`, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async authPost<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.authApi.post(`/auth${url}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async authPut<T>(url: string, data?: any): Promise<T> {
    try {
      const response = await this.authApi.put(`/auth${url}`, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  protected async authDelete<T>(url: string): Promise<T> {
    try {
      const response = await this.authApi.delete(`/auth${url}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Yeni backend API'sine uygun register
  public async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.authPost<LoginResponse>("/register", data);
    
    // Token ve user bilgilerini cookie'ye kaydet
    if (response.token) {
      tokenUtils.setAuthToken(response.token, response.expiresIn);
      tokenUtils.setUserData({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    }
    
    return response;
  }

  // Yeni backend API'sine uygun login
  public async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.authPost<LoginResponse>("/login", data);
    
    // Token ve user bilgilerini cookie'ye kaydet
    if (response.token) {
      tokenUtils.setAuthToken(response.token, response.expiresIn);
      tokenUtils.setUserData({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    }
    
    return response;
  }

  // Logout
  public logout(): void {
    // Backend'de logout endpoint'i yoksa sadece client-side temizlik
    tokenUtils.clearAllAuthData();
    window.location.href = "/";
  }

  // Current user bilgilerini getir
  public getCurrentUser(): AuthUser | null {
    const userData = tokenUtils.getUserData();
    return userData ? {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      role: userData.role,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
    } : null;
  }

  // Token kontrolü
  public getToken(): string | null {
    return tokenUtils.getAuthToken();
  }

  // Authentication durumu
  public isAuthenticated(): boolean {
    return tokenUtils.hasAuthToken();
  }

  // User role kontrolü
  public hasRole(role: UserType): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Admin kontrolü
  public isAdmin(): boolean {
    return this.hasRole(UserType.ADMIN);
  }

  // Boat owner kontrolü
  public isBoatOwner(): boolean {
    return this.hasRole(UserType.BOAT_OWNER);
  }

  // Customer kontrolü
  public isCustomer(): boolean {
    return this.hasRole(UserType.CUSTOMER);
  }

  // Account yönetimi (backend'deki diğer endpoints için)
  public async getCurrentAccount(): Promise<AccountDTO> {
    return this.authGet<AccountDTO>("/account");
  }

  public async createAccount(data: CreateAccountRequest): Promise<AccountDTO> {
    return this.authPost<AccountDTO>("/account", data);
  }

  public async updateAccount(data: UpdateAccountRequest): Promise<AccountDTO> {
    return this.authPut<AccountDTO>("/account", data);
  }

  public async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    return this.authPut<void>("/account/password", data);
  }

  public async deleteAccount(): Promise<void> {
    await this.authDelete<void>("/account");
    this.logout();
  }

  // Token refresh (eğer backend'de varsa)
  public async refreshToken(): Promise<LoginResponse> {
    const response = await this.authPost<LoginResponse>("/refresh");
    
    if (response.token) {
      tokenUtils.setAuthToken(response.token, response.expiresIn);
      tokenUtils.setUserData({
        id: response.userId,
        email: response.email,
        username: response.username,
        role: response.role,
      });
    }
    
    return response;
  }

  // **ADMİN PANELİ FONKSİYONLARI**
  
  // Tüm kullanıcıları getir (Admin only)
  public async getAllUsers(): Promise<AuthUser[]> {
    return this.authGet<AuthUser[]>("/admin/users");
  }

  // Kullanıcı rolünü güncelle (Admin only)
  public async updateUserRole(userId: number, newRole: UserType): Promise<void> {
    return this.authPut<void>(`/admin/users/${userId}/role`, { role: newRole });
  }

  // Kullanıcıyı aktif/pasif et (Admin only)
  public async toggleUserStatus(userId: number, isActive: boolean): Promise<void> {
    return this.authPut<void>(`/admin/users/${userId}/status`, { isActive });
  }

  // Boat owner başvurularını getir (Admin only)
  public async getBoatOwnerApplications(): Promise<{
    id: number;
    userId: number;
    username: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    applicationDate: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[]> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // return this.authGet<any[]>("/admin/boat-owner-applications");
    
    // Mock data - örnek boat owner başvuruları
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: 1,
        userId: 101,
        username: "ahmet_kaptan",
        email: "ahmet@example.com",
        fullName: "Ahmet Kaptan",
        phoneNumber: "+90 555 123 4567",
        applicationDate: "2024-01-15T10:00:00Z",
        status: 'PENDING'
      },
      {
        id: 2,
        userId: 102,
        username: "mehmet_tekne",
        email: "mehmet@example.com",
        fullName: "Mehmet Tekne",
        phoneNumber: "+90 555 987 6543",
        applicationDate: "2024-01-10T14:30:00Z",
        status: 'APPROVED'
      }
    ];
  }

  // Boat owner başvurusunu onayla (Admin only)
  public async approveBoatOwnerApplication(applicationId: number): Promise<void> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // return this.authPut<void>(`/admin/boat-owner-applications/${applicationId}/approve`);
    
    // Mock onay işlemi
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mock boat owner application ${applicationId} approved`);
  }

  // Boat owner başvurusunu reddet (Admin only)
  public async rejectBoatOwnerApplication(applicationId: number, reason?: string): Promise<void> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // return this.authPut<void>(`/admin/boat-owner-applications/${applicationId}/reject`, { reason });
    
    // Mock red işlemi
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Mock boat owner application ${applicationId} rejected with reason:`, reason);
  }

  // Kullanıcıyı ID ile getir (Admin only)
  public async getUserById(userId: number): Promise<AuthUser> {
    return this.authGet<AuthUser>(`/admin/users/${userId}`);
  }

  // Kullanıcı arama (Admin only)
  public async searchUsers(query: string): Promise<AuthUser[]> {
    return this.authGet<AuthUser[]>(`/admin/users/search?q=${encodeURIComponent(query)}`);
  }

  // Role göre kullanıcıları filtrele (Admin only)
  public async getUsersByRole(role: UserType): Promise<AuthUser[]> {
    return this.authGet<AuthUser[]>(`/admin/users?role=${role}`);
  }

  // **BOAT OWNER BAŞVURU FONKSİYONLARI**
  
  // Boat owner başvurusu yap
  public async submitBoatOwnerApplication(applicationData: {
    companyName?: string;
    taxNumber?: string;
    address?: string;
    description?: string;
    documents?: File[];
  }): Promise<void> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // const formData = new FormData();
    
    // if (applicationData.companyName) {
    //   formData.append('companyName', applicationData.companyName);
    // }
    // if (applicationData.taxNumber) {
    //   formData.append('taxNumber', applicationData.taxNumber);
    // }
    // if (applicationData.address) {
    //   formData.append('address', applicationData.address);
    // }
    // if (applicationData.description) {
    //   formData.append('description', applicationData.description);
    // }
    
    // // Belgeler varsa ekle
    // if (applicationData.documents) {
    //   Array.from(applicationData.documents).forEach((file, index) => {
    //     formData.append(`documents`, file);
    //   });
    // }

    // try {
    //   const response = await this.authApi.post("/auth/boat-owner-application", formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });
    //   return response.data;
    // } catch (error) {
    //   this.handleError(error);
    //   throw error;
    // }
    
    // Mock başvuru gönderme simülasyonu
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock boat owner application submitted:', applicationData);
  }

  // Kullanıcının boat owner başvuru durumunu kontrol et
  public async getMyBoatOwnerApplication(): Promise<{
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    applicationDate: string;
    reviewDate?: string;
    rejectionReason?: string;
  } | null> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // try {
    //   return await this.authGet<any>("/boat-owner-application/my");
    // } catch (error) {
    //   // Başvuru yoksa null döner
    //   return null;
    // }
    
    // Mock data - başvuru olmadığı durumu simüle ediyoruz
    await new Promise(resolve => setTimeout(resolve, 500));
    return null; // Hiç başvuru yok
    
    // Aşağıdaki mock data'yı istediğiniz senaryoya göre değiştirebilirsiniz:
    // return {
    //   id: 1,
    //   status: 'PENDING',
    //   applicationDate: new Date().toISOString(),
    //   reviewDate: undefined,
    //   rejectionReason: undefined
    // };
  }

  // Boat owner başvurusu iptal et
  public async cancelBoatOwnerApplication(): Promise<void> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // return this.authDelete<void>("/boat-owner-application/my");
    
    // Mock başvuru iptal etme simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Mock boat owner application cancelled');
  }
}

export const authService = new AuthService();
