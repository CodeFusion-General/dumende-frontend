import { BaseService } from "./base/BaseService";

export interface FinanceSummaryDTO {
  from: string; // ISO date (YYYY-MM-DD)
  to: string;   // ISO date (YYYY-MM-DD)
  totalRevenue: number | string; // backend BigDecimal → number/string
  pendingPayout: number | string;
  transactionCount: number;
}

export interface FinanceTransactionDTO {
  id: number;
  date: string; // ISO datetime
  tourName: string;
  amount: number | string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "REFUNDED";
}

class FinanceService extends BaseService {
  constructor() {
    // BaseService httpClient baseURL: /api → full path: /api/captain/profile/finance
    super("/captain/profile/finance");
  }

  public async getSummary(params?: { from?: string; to?: string }): Promise<FinanceSummaryDTO> {
    return this.get<FinanceSummaryDTO>(`/summary`, params);
  }

  public async getTransactions(params?: { from?: string; to?: string }): Promise<FinanceTransactionDTO[]> {
    return this.get<FinanceTransactionDTO[]>(`/transactions`, params);
  }
}

export const financeService = new FinanceService();


