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
// No longer need separate axios instance

class AuthService extends BaseService {
  constructor() {
    super("/api/auth");
  }


  // Yeni backend API'sine uygun register
  public async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/register", data);
    
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
    const response = await this.post<LoginResponse>("/login", data);
    
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

  // ✅ DÜZELT: Account yönetimi (Backend: /api/v1/accounts)
  // NOT: Account endpoint'leri /api/v1/accounts altında, /api/auth altında DEĞİL

  public async getAccountById(accountId: number): Promise<AccountDTO> {
    // Backend: GET /api/v1/accounts/{id}
    return this.get<AccountDTO>(`/v1/accounts/${accountId}`);
  }

  public async getCurrentAccount(): Promise<AccountDTO> {
    const user = this.getCurrentUser();
    if (!user?.accountId) {
      throw new Error("Account ID bulunamadı. Lütfen tekrar giriş yapın.");
    }
    return this.getAccountById(user.accountId);
  }

  public async createAccount(data: CreateAccountRequest): Promise<AccountDTO> {
    // Backend: POST /api/v1/accounts/
    return this.post<AccountDTO>("/v1/accounts", data);
  }

  public async updateAccount(accountId: number, data: UpdateAccountRequest): Promise<AccountDTO> {
    // Backend: PUT /api/v1/accounts/{id}
    return this.put<AccountDTO>(`/v1/accounts/${accountId}`, data);
  }

  public async updatePassword(accountId: number, data: UpdatePasswordRequest): Promise<void> {
    // Backend: PUT /api/v1/accounts/{id}/password
    return this.put<void>(`/v1/accounts/${accountId}/password`, data);
  }

  public async deleteAccount(accountId: number): Promise<void> {
    // Backend: DELETE /api/v1/accounts/{id}
    await this.delete<void>(`/v1/accounts/${accountId}`);
    this.logout();
  }

  // ❌ KALDIR: refreshToken() - Backend'de bu endpoint yok
  // Token refresh için yeniden login yapılmalı veya backend'de endpoint eklenmeli
  /*
  public async refreshToken(): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("/refresh");

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
  */

  // ❌ DEPRECATED: ADMİN PANELİ FONKSİYONLARI
  // NOT: Bu metodlar adminUserService.ts'ye taşınmalı
  // Backend endpoint'leri /api/users altında, /api/auth/admin/users DEĞİL

  // ⚠️ DEPRECATED: adminUserService.getAllUsers() kullan
  // Backend: GET /api/users/ (@PreAuthorize('ADMIN'))
  public async getAllUsers(): Promise<AuthUser[]> {
    // Doğru endpoint: /api/users/ (BaseService zaten /api/auth kullanıyor, o yüzden relative path)
    // UYARI: Bu method adminUserService'e taşınmalı
    return this.get<AuthUser[]>("/../users/");
  }

  // ⚠️ DEPRECATED: Backend'de bu endpoint YOK - adminUserService'de implement edilmeli
  // public async updateUserRole(userId: number, newRole: UserType): Promise<void> {
  //   return this.put<void>(`/admin/users/${userId}/role`, { role: newRole });
  // }

  // ⚠️ DEPRECATED: Backend'de bu endpoint YOK - adminUserService'de implement edilmeli
  // public async toggleUserStatus(userId: number, isActive: boolean): Promise<void> {
  //   return this.put<void>(`/admin/users/${userId}/status`, { isActive });
  // }

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
    // return this.get<any[]>("/admin/boat-owner-applications");
    
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
    // return this.put<void>(`/admin/boat-owner-applications/${applicationId}/approve`);
    
    // Mock onay işlemi
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Boat owner başvurusunu reddet (Admin only)
  public async rejectBoatOwnerApplication(applicationId: number, reason?: string): Promise<void> {
    // Backend henüz hazır olmadığı için mock data kullanıyoruz
    // return this.put<void>(`/admin/boat-owner-applications/${applicationId}/reject`, { reason });
    
    // Mock red işlemi
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // ⚠️ DEPRECATED: userService.getUserById() veya adminUserService kullan
  // Backend: GET /api/users/{id} (@PreAuthorize)
  public async getUserById(userId: number): Promise<AuthUser> {
    // Doğru endpoint için relative path kullan
    return this.get<AuthUser>(`/../users/${userId}`);
  }

  // ⚠️ DEPRECATED: adminUserService.searchUsers() kullan
  // Backend'de search endpoint'i farklı formatta olabilir
  public async searchUsers(query: string): Promise<AuthUser[]> {
    // Bu method adminUserService'e taşınmalı
    return this.get<AuthUser[]>(`/../admin/users/search?q=${encodeURIComponent(query)}`);
  }

  // ⚠️ DEPRECATED: Backend'de bu exact endpoint YOK
  // Backend: GET /api/admin/users/type/{userType} kullanılmalı
  public async getUsersByRole(role: UserType): Promise<AuthUser[]> {
    // Bu method adminUserService'e taşınmalı ve backend endpoint'i ile senkronize edilmeli
    return this.get<AuthUser[]>(`/../admin/users/type/${role}`);
  }

  // **EMAIL VERİFİCATİON API'LERİ**
  
  // Email doğrulama kodu gönder
  public async sendEmailVerificationCode(email: string): Promise<void> {
    return this.postPublic<void>("/email-verification/send-code", { email });
  }

  // Email doğrula
  public async verifyEmail(email: string, code: string): Promise<void> {
    return this.postPublic<void>("/email-verification/verify", { email, code });
  }

  // **PASSWORD RESET API'LERİ**
  
  // Şifre sıfırlama isteği
  public async forgotPassword(email: string): Promise<{ message: string }> {
    return this.postPublic<{ message: string }>("/password-reset/forgot-password", { email });
  }

  // Şifre sıfırla
  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.postPublic<{ message: string }>("/password-reset/reset-password", { 
      token, 
      newPassword 
    });
  }

  // **TEST API'LERİ** (Sadece development)
  
  // Test endpoint'i
  public async testAuth(): Promise<string> {
    return this.get<string>("/test");
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
    //   return await this.get<any>("/boat-owner-application/my");
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
    // return this.delete<void>("/boat-owner-application/my");
    
    // Mock başvuru iptal etme simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const authService = new AuthService();
