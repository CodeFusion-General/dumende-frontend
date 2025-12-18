import { BaseService } from "./base/BaseService";
import {
  AccountDTO,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdatePasswordRequest,
} from "@/types/auth.types";

/**
 * Account Service - Kullanıcı hesap yönetimi için API servisi
 *
 * Backend Endpoint'leri:
 * - GET    /api/v1/accounts/{id}          - Hesap bilgisi getir
 * - GET    /api/v1/accounts               - Tüm hesapları listele (Admin)
 * - GET    /api/v1/accounts/by-email      - Email ile hesap getir
 * - GET    /api/v1/accounts/by-username   - Username ile hesap getir
 * - GET    /api/v1/accounts/{id}/exists   - Hesap var mı kontrol et
 * - POST   /api/v1/accounts               - Yeni hesap oluştur
 * - PUT    /api/v1/accounts/{id}          - Hesap güncelle
 * - PUT    /api/v1/accounts/{id}/password - Şifre güncelle
 * - PUT    /api/v1/accounts/{id}/activate - Hesabı aktifleştir
 * - PUT    /api/v1/accounts/{id}/deactivate - Hesabı devre dışı bırak
 * - DELETE /api/v1/accounts/{id}          - Hesabı sil
 */
class AccountService extends BaseService {
  constructor() {
    // BaseService httpClient baseURL: /api → full path: /api/v1/accounts
    super("/v1/accounts");
  }

  /**
   * ID ile hesap bilgisi getir
   * @param accountId - Hesap ID'si
   * @returns AccountDTO
   */
  public async getAccountById(accountId: number): Promise<AccountDTO> {
    return this.get<AccountDTO>(`/${accountId}`);
  }

  /**
   * Alias for getAccountById (backward compatibility)
   */
  public async getById(id: number): Promise<AccountDTO> {
    return this.getAccountById(id);
  }

  /**
   * Email ile hesap bilgisi getir
   * @param email - Kullanıcı email adresi
   * @returns AccountDTO veya null
   */
  public async getAccountByEmail(email: string): Promise<AccountDTO | null> {
    try {
      return await this.get<AccountDTO>(`/by-email`, { email });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Alias for getAccountByEmail (backward compatibility)
   */
  public async getByEmail(email: string): Promise<AccountDTO | null> {
    return this.getAccountByEmail(email);
  }

  /**
   * Username ile hesap bilgisi getir
   * @param username - Kullanıcı adı
   * @returns AccountDTO veya null
   */
  public async getAccountByUsername(username: string): Promise<AccountDTO | null> {
    try {
      return await this.get<AccountDTO>(`/by-username`, { username });
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Alias for getAccountByUsername (backward compatibility)
   */
  public async getByUsername(username: string): Promise<AccountDTO | null> {
    return this.getAccountByUsername(username);
  }

  /**
   * Hesap var mı kontrol et
   * @param accountId - Hesap ID'si
   * @returns boolean
   */
  public async checkAccountExists(accountId: number): Promise<boolean> {
    return this.get<boolean>(`/${accountId}/exists`);
  }

  /**
   * Yeni hesap oluştur
   * @param data - Hesap oluşturma verileri
   * @returns Oluşturulan AccountDTO
   */
  public async createAccount(data: CreateAccountRequest): Promise<AccountDTO> {
    return this.post<AccountDTO>("", data);
  }

  /**
   * Hesap bilgilerini güncelle
   * @param accountId - Hesap ID'si
   * @param data - Güncellenecek veriler
   * @returns Güncellenmiş AccountDTO
   */
  public async updateAccount(accountId: number, data: UpdateAccountRequest): Promise<AccountDTO> {
    return this.put<AccountDTO>(`/${accountId}`, data);
  }

  /**
   * Şifre güncelle
   * @param accountId - Hesap ID'si
   * @param data - Şifre güncelleme verileri (currentPassword, newPassword)
   * @returns Güncellenmiş AccountDTO
   */
  public async updatePassword(accountId: number, data: UpdatePasswordRequest): Promise<AccountDTO> {
    return this.put<AccountDTO>(`/${accountId}/password`, data);
  }

  /**
   * Hesabı aktifleştir (Admin işlemi)
   * @param accountId - Hesap ID'si
   */
  public async activateAccount(accountId: number): Promise<void> {
    await this.put<void>(`/${accountId}/activate`);
  }

  /**
   * Hesabı devre dışı bırak (Admin işlemi)
   * @param accountId - Hesap ID'si
   */
  public async deactivateAccount(accountId: number): Promise<void> {
    await this.put<void>(`/${accountId}/deactivate`);
  }

  /**
   * Hesabı sil
   * @param accountId - Hesap ID'si
   */
  public async deleteAccount(accountId: number): Promise<void> {
    return this.delete<void>(`/${accountId}`);
  }

  /**
   * Tüm hesapları listele (Admin işlemi)
   * @returns AccountDTO listesi
   */
  public async getAllAccounts(): Promise<AccountDTO[]> {
    return this.get<AccountDTO[]>("");
  }
}

export const accountService = new AccountService();
