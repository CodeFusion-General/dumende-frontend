import { APIRequestContext, Page } from "@playwright/test";

export type UserType = "CUSTOMER" | "BOAT_OWNER" | "ADMIN";

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  userId: number | null;
  email: string;
  username: string;
  role: UserType;
  accountId?: number;
}

const API_BASE_URL = process.env.PLAYWRIGHT_API_URL || "http://localhost:8080";

async function withBackendRetry<T>(
  fn: () => Promise<T>,
  options?: { retries?: number; delayMs?: number }
): Promise<T> {
  const retries = options?.retries ?? 10;
  const delayMs = options?.delayMs ?? 1000;
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const message: string = err?.message || "";

      // Sadece backend henüz ayağa kalkmamışsa görülen düşük seviye network hatalarında retry yap
      if (!/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ECONNRESET/i.test(message)) {
        throw err;
      }

      if (attempt === retries - 1) {
        break;
      }

      // Kısa bir bekleme sonrası tekrar dene
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  throw new Error(
    `Backend ${API_BASE_URL} adresine birden fazla denemeye rağmen ulaşılamadı. Son hata: ${
      (lastError as any)?.message || lastError
    }`
  );
}

export async function apiRegisterCustomer(
  request: APIRequestContext,
  params: { email: string; username: string; password: string }
): Promise<LoginResponse> {
  const body = {
    email: params.email,
    username: params.username,
    password: params.password,
    fullName: `${params.username} Test`,
    phoneNumber: "05378123456",
    userType: "CUSTOMER",
    contractApproved: true,
    contractVersion: "v1",
  };

  const response = await withBackendRetry(() =>
    request.post(`${API_BASE_URL}/api/auth/register`, {
      data: body,
    })
  );

  if (!response.ok()) {
    throw new Error(
      `Register failed with status ${response.status()}: ${await response
        .text()
        .catch(() => "")}`
    );
  }

  return (await response.json()) as LoginResponse;
}

export async function apiLogin(
  request: APIRequestContext,
  emailOrUsername: string,
  password: string
): Promise<LoginResponse> {
  const response = await withBackendRetry(() =>
    request.post(`${API_BASE_URL}/api/auth/login`, {
      data: {
        emailOrUsername,
        password,
      },
    })
  );

  if (!response.ok()) {
    throw new Error(
      `Login failed with status ${response.status()}: ${await response
        .text()
        .catch(() => "")}`
    );
  }

  return (await response.json()) as LoginResponse;
}

export async function setAuthCookies(
  page: Page,
  login: LoginResponse
): Promise<void> {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173";
  const url = new URL(baseUrl);

  const cookieBase = {
    domain: url.hostname,
    path: "/",
    httpOnly: false,
    secure: url.protocol === "https:",
    sameSite: "Lax" as const,
  };

  const userData = {
    id: login.userId,
    email: login.email,
    username: login.username,
    role: login.role,
    accountId: login.accountId,
    isProfileComplete: true,
  };

  await page.context().addCookies([
    {
      name: "authToken",
      value: login.token,
      ...cookieBase,
    },
    {
      name: "userData",
      value: encodeURIComponent(JSON.stringify(userData)),
      ...cookieBase,
    },
  ]);
}

export function randomTestEmail(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  // Iyzico gerçek email formatı bekliyor, .local domain kabul edilmiyor
  return `${prefix}.${suffix}@testmail.com`;
}

export function randomUsername(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${suffix}`;
}
