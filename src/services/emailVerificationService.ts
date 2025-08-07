import { BaseService } from "./base/BaseService";

export interface SendVerificationCodeRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  expiresInMinutes?: number | null;
}

class EmailVerificationService extends BaseService {
  constructor() {
    // BaseService httpClient baseURL: /api → full path: /api/auth/email-verification
    super("/auth/email-verification");
  }

  public async sendCode(request: SendVerificationCodeRequest): Promise<EmailVerificationResponse> {
    return this.post<EmailVerificationResponse>("/send-code", request);
  }

  public async verify(request: VerifyEmailRequest): Promise<EmailVerificationResponse> {
    return this.post<EmailVerificationResponse>("/verify", request);
  }
}

export const emailVerificationService = new EmailVerificationService();


