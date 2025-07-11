import { BaseService } from "./base/BaseService";
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  AccountDTO,
  CreateAccountRequest,
  UpdateAccountRequest,
  UpdatePasswordRequest,
} from "@/types/auth.types";

// Cookie yardımcı fonksiyonları
function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name: string): string | null {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, null as string | null);
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

class AuthService extends BaseService {
  constructor() {
    super("/auth");
  }

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.post<AuthResponse>("/register", data);
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>("/login", data);
    if (response.token) {
      setCookie("token", response.token);
      setCookie("account", JSON.stringify(response.account));
    }
    return response;
  }

  public async logout(): Promise<void> {
    await this.post<void>("/logout");
    deleteCookie("token");
    deleteCookie("account");
  }

  public async getCurrentAccount(): Promise<AccountDTO> {
    return this.get<AccountDTO>("/account");
  }

  public async createAccount(data: CreateAccountRequest): Promise<AccountDTO> {
    return this.post<AccountDTO>("/account", data);
  }

  public async updateAccount(data: UpdateAccountRequest): Promise<AccountDTO> {
    return this.put<AccountDTO>("/account", data);
  }

  public async updatePassword(data: UpdatePasswordRequest): Promise<void> {
    return this.put<void>("/account/password", data);
  }

  public async deleteAccount(): Promise<void> {
    await this.delete<void>("/account");
    deleteCookie("token");
    deleteCookie("account");
  }

  // Token management
  public getToken(): string | null {
    return getCookie("token");
  }

  public getStoredAccount(): AccountDTO | null {
    const accountStr = getCookie("account");
    return accountStr ? JSON.parse(accountStr) : null;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
