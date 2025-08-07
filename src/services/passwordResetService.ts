import { BaseService } from "./base/BaseService";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  expiresInMinutes?: number | null;
}

class PasswordResetService extends BaseService {
  constructor() {
    // BaseService httpClient baseURL: /api → full path: /api/auth/password-reset
    super("/auth/password-reset");
  }

  public async forgotPassword(request: ForgotPasswordRequest): Promise<PasswordResetResponse> {
    return this.post<PasswordResetResponse>("/forgot-password", request);
  }

  public async resetPassword(request: ResetPasswordRequest): Promise<PasswordResetResponse> {
    return this.post<PasswordResetResponse>("/reset-password", request);
  }
}

export const passwordResetService = new PasswordResetService();


