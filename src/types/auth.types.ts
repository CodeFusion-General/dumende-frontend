// Auth ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// Account (Hesap) Types
export interface AccountDTO {
  id: number;
  email: string;
  username: string;
  role: string;
  isEnabled: boolean;
  createdAt: string; // LocalDateTime -> string
  updatedAt: string; // LocalDateTime -> string
}

export interface CreateAccountRequest {
  email: string;
  username: string;
  password: string;
  role: string;
}

export interface UpdateAccountRequest {
  email: string;
  username: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Giriş için gerekli types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role?: string; // Opsiyonel, default role verilir
}

export interface AuthResponse {
  account: AccountDTO;
  token: string;
}

// Geriye uyumluluk için
export interface User extends AccountDTO {
  name?: string; // username yerine
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: string;
  isEnabled: boolean;
}
