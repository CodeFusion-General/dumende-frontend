import { BaseService } from "./base/BaseService";
import type {
  ContractApproval,
  CreateContractApprovalRequest,
} from "@/types/captain.types";

class ContractApprovalService extends BaseService {
  constructor() {
    super("/contract-approvals");
  }

  // Contract approval oluştur
  async create(data: CreateContractApprovalRequest): Promise<ContractApproval> {
    return this.post<ContractApproval>("", data);
  }

  // Admin: Account'a göre approval'ları listele
  async getByAccount(accountId: number): Promise<ContractApproval[]> {
    return this.get<ContractApproval[]>(`/account/${accountId}`);
  }

  // Admin: Account ve contract type'a göre approval'ları listele
  async getByAccountAndType(accountId: number, contractType: string): Promise<ContractApproval[]> {
    return this.get<ContractApproval[]>(`/account/${accountId}/type/${contractType}`);
  }
}

export const contractApprovalService = new ContractApprovalService();
