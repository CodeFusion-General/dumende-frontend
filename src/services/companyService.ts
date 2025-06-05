import { BaseService } from "./base/BaseService";

export interface CompanyFormData {
  legalName: string;
  displayName: string;
  taxNumber: string;
  taxOffice: string;
  authorizedPerson: string;
  companyEmail: string;
  nationalIdNumber: string;
  mobilePhone: string;
  landlinePhone?: string;
  billingAddress: string;
  iban: string;
}

export interface UpdateUserCompanyRequest {
  userId: number;
  legalName: string;
  displayName: string;
  taxNumber: string;
  taxOffice: string;
  authorizedPerson: string;
  companyEmail: string;
  nationalIdNumber: string;
  mobilePhone: string;
  landlinePhone?: string;
  billingAddress: string;
  iban: string;
}

class CompanyService extends BaseService {
  constructor() {
    super("/company");
  }

  public async updateUserCompany(userId: number, companyData: CompanyFormData) {
    const request: UpdateUserCompanyRequest = {
      userId,
      ...companyData,
    };

    try {
      const updatedUser = await this.put("/update", request);
      return updatedUser;
    } catch (error: any) {
      console.error("Şirket bilgileri güncellenirken hata:", error);
      console.error("📤 Hatalı Request:", JSON.stringify(request, null, 2));

      // Backend validation errors'u logla
      if (error.response && error.response.data && error.response.data.errors) {
        console.error("🔍 Validation Errors:", error.response.data.errors);
      }

      throw error;
    }
  }
}

export const companyService = new CompanyService();
