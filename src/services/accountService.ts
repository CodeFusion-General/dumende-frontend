import { BaseService } from "./base/BaseService";
import { AccountDTO, UpdatePasswordRequest } from "@/types/auth.types";

class AccountService extends BaseService {
  constructor() {
    // BaseService httpClient baseURL: /api → full path: /api/v1/accounts
    super("/v1/accounts");
  }

  public async getById(id: number): Promise<AccountDTO> {
    return this.get<AccountDTO>(`/${id}`);
  }

  public async getByEmail(email: string): Promise<AccountDTO> {
    // Controller: GET /api/v1/accounts/by-email?email=...
    return this.get<AccountDTO>(`/by-email`, { email });
  }

  public async getByUsername(username: string): Promise<AccountDTO> {
    return this.get<AccountDTO>(`/by-username`, { username });
  }

  public async updatePassword(
    accountId: number,
    data: UpdatePasswordRequest
  ): Promise<AccountDTO> {
    // Controller returns AccountDTO
    return this.put<AccountDTO>(`/${accountId}/password`, data);
  }

  public async activateAccount(accountId: number): Promise<void> {
    await this.put<void>(`/${accountId}/activate`);
  }

  public async deactivateAccount(accountId: number): Promise<void> {
    await this.put<void>(`/${accountId}/deactivate`);
  }
}

export const accountService = new AccountService();


