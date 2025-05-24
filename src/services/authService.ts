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
      localStorage.setItem("token", response.token);
      localStorage.setItem("account", JSON.stringify(response.account));
    }
    return response;
  }

  public async logout(): Promise<void> {
    await this.post<void>("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("account");
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
    localStorage.removeItem("token");
    localStorage.removeItem("account");
  }

  // Token management
  public getToken(): string | null {
    return localStorage.getItem("token");
  }

  public getStoredAccount(): AccountDTO | null {
    const accountStr = localStorage.getItem("account");
    return accountStr ? JSON.parse(accountStr) : null;
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
