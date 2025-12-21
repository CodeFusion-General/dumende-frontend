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
    super("/auth"); // axios baseURL zaten /api
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

  // ✅ Account metodları artık accountService.ts'de
  // import { accountService } from "./accountService" kullanın
  // Aşağıdaki metodlar geriye uyumluluk için bırakıldı, accountService'e yönlendirme yaparlar

  /**
   * @deprecated accountService.getAccountById() kullanın
   */
  public async getAccountById(accountId: number): Promise<AccountDTO> {
    // accountService'e yönlendir - doğru path kullanır
    const { accountService } = await import("./accountService");
    return accountService.getAccountById(accountId);
  }

  public async getCurrentAccount(): Promise<AccountDTO> {
    const user = this.getCurrentUser();
    if (!user?.accountId) {
      throw new Error("Account ID bulunamadı. Lütfen tekrar giriş yapın.");
    }
    return this.getAccountById(user.accountId);
  }

  /**
   * @deprecated accountService.createAccount() kullanın
   */
  public async createAccount(data: CreateAccountRequest): Promise<AccountDTO> {
    const { accountService } = await import("./accountService");
    return accountService.createAccount(data);
  }

  /**
   * @deprecated accountService.updateAccount() kullanın
   */
  public async updateAccount(accountId: number, data: UpdateAccountRequest): Promise<AccountDTO> {
    const { accountService } = await import("./accountService");
    return accountService.updateAccount(accountId, data);
  }

  /**
   * @deprecated accountService.updatePassword() kullanın
   */
  public async updatePassword(accountId: number, data: UpdatePasswordRequest): Promise<void> {
    const { accountService } = await import("./accountService");
    await accountService.updatePassword(accountId, data);
  }

  /**
   * @deprecated accountService.deleteAccount() kullanın
   */
  public async deleteAccount(accountId: number): Promise<void> {
    const { accountService } = await import("./accountService");
    await accountService.deleteAccount(accountId);
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
  // NOT: Bu metodlar adminUserService.ts'ye taşındı
  // Aşağıdaki metodlar geriye uyumluluk için bırakıldı

  /**
   * @deprecated adminUserService.getAllUsers() kullanın
   */
  public async getAllUsers(): Promise<AuthUser[]> {
    // adminUserService'e yönlendir
    const { adminUserService } = await import("./adminPanel/adminUserService");
    const result = await adminUserService.getAllUsers();
    return result.content as unknown as AuthUser[];
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
  // Backend: GET /api/admin/boat-owner-applications
  public async getBoatOwnerApplications(): Promise<{
    id: number;
    userId: number;
    accountId: number;
    username: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    companyName?: string;
    taxNumber?: string;
    address?: string;
    description?: string;
    applicationDate: string;
    reviewDate?: string;
    rejectionReason?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[]> {
    // Admin endpoint - /api prefix'i axios'da zaten var
    const response = await this.api.get('/admin/boat-owner-applications/pending', {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  // Boat owner başvurusunu onayla (Admin only)
  // Backend: PUT /api/admin/boat-owner-applications/{id}/approve
  public async approveBoatOwnerApplication(applicationId: number, adminNotes?: string): Promise<void> {
    await this.api.put(
      `/admin/boat-owner-applications/${applicationId}/approve`,
      null,
      {
        params: { adminNotes },
        headers: this.getAuthHeaders()
      }
    );
  }

  // Boat owner başvurusunu reddet (Admin only)
  // Backend: PUT /api/admin/boat-owner-applications/{id}/reject
  public async rejectBoatOwnerApplication(applicationId: number, reason: string, adminNotes?: string): Promise<void> {
    await this.api.put(
      `/admin/boat-owner-applications/${applicationId}/reject`,
      null,
      {
        params: { reason, adminNotes },
        headers: this.getAuthHeaders()
      }
    );
  }

  /**
   * @deprecated adminUserService.getUserById() kullanın
   */
  public async getUserById(userId: number): Promise<AuthUser> {
    const { adminUserService } = await import("./adminPanel/adminUserService");
    const result = await adminUserService.getUserById(userId);
    return result as unknown as AuthUser;
  }

  /**
   * @deprecated adminUserService.searchUsers() kullanın
   */
  public async searchUsers(query: string): Promise<AuthUser[]> {
    const { adminUserService } = await import("./adminPanel/adminUserService");
    const result = await adminUserService.searchUsers({ searchTerm: query });
    return result.content as unknown as AuthUser[];
  }

  /**
   * @deprecated adminUserService.getUsersByType() kullanın
   */
  public async getUsersByRole(role: UserType): Promise<AuthUser[]> {
    const { adminUserService } = await import("./adminPanel/adminUserService");
    const result = await adminUserService.getUsersByType(role);
    return result.content as unknown as AuthUser[];
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
  // Backend beklediği: { email, resetToken, newPassword, confirmPassword }
  public async resetPassword(
    email: string,
    resetToken: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<{ message: string; success: boolean }> {
    return this.postPublic<{ message: string; success: boolean }>("/password-reset/reset-password", {
      email,
      resetToken,
      newPassword,
      confirmPassword: confirmPassword || newPassword
    });
  }

  // **TEST API'LERİ** (Sadece development)
  
  // Test endpoint'i
  public async testAuth(): Promise<string> {
    return this.get<string>("/test");
  }

  // **BOAT OWNER BAŞVURU FONKSİYONLARI**

  // Boat owner başvurusu yap
  // Backend: POST /api/auth/boat-owner-application
  public async submitBoatOwnerApplication(applicationData: {
    companyName?: string;
    taxNumber?: string;
    address?: string;
    description?: string;
    phoneNumber?: string;
    documentUrls?: string[];
  }): Promise<{
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    applicationDate: string;
  }> {
    return this.post<{
      id: number;
      status: 'PENDING' | 'APPROVED' | 'REJECTED';
      applicationDate: string;
    }>("/boat-owner-application", applicationData);
  }

  // Kullanıcının boat owner başvuru durumunu kontrol et
  // Backend: GET /api/auth/boat-owner-application/my
  public async getMyBoatOwnerApplication(): Promise<{
    id: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    applicationDate: string;
    reviewDate?: string;
    rejectionReason?: string;
    adminNotes?: string;
    companyName?: string;
    taxNumber?: string;
    address?: string;
    description?: string;
  } | null> {
    try {
      const response = await this.get<any>("/boat-owner-application/my");
      return response;
    } catch (error: any) {
      // 204 No Content veya başvuru yoksa null döner
      if (error.statusCode === 204 || error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // Kullanıcının bekleyen başvurusu var mı kontrol et
  // Backend: GET /api/auth/boat-owner-application/my/exists
  public async hasMyPendingApplication(): Promise<boolean> {
    return this.get<boolean>("/boat-owner-application/my/exists");
  }

  // Boat owner başvurusu iptal et
  // Backend: DELETE /api/auth/boat-owner-application/my
  public async cancelBoatOwnerApplication(): Promise<void> {
    return this.delete<void>("/boat-owner-application/my");
  }
}

export const authService = new AuthService();
