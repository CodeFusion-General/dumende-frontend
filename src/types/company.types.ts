// Company ile ilgili tüm type'lar - Backend DTO'larıyla uyumlu

// Company Types
export interface CompanyDTO {
  legalName: string;
  displayName: string;
  taxNumber: string;
  taxOffice: string;
  authorizedPerson: string;
  companyEmail: string;
  nationalIdNumber: string;
  mobilePhone: string;
  landlinePhone: string;
  billingAddress: string;
  iban: string;
}

export interface CreateCompanyDTO {
  legalName: string;
  displayName: string;
  taxNumber: string;
  taxOffice: string;
  authorizedPerson: string;
  companyEmail: string;
  nationalIdNumber: string;
  mobilePhone: string;
  landlinePhone?: string; // Opsiyonel
  billingAddress: string;
  iban: string;
}

export interface UpdateCompanyDTO {
  legalName?: string;
  displayName?: string;
  taxNumber?: string;
  taxOffice?: string;
  authorizedPerson?: string;
  companyEmail?: string;
  nationalIdNumber?: string;
  mobilePhone?: string;
  landlinePhone?: string;
  billingAddress?: string;
  iban?: string;
}

// Geriye uyumluluk için eski interface'lerin alias'ları
export interface Company extends CompanyDTO {}
export interface CompanyCreateRequest extends CreateCompanyDTO {}
export interface CompanyUpdateRequest extends UpdateCompanyDTO {}

// Filtreleme için kullanılan interface
export interface CompanyFilters {
  legalName?: string;
  displayName?: string;
  taxNumber?: string;
  taxOffice?: string;
  authorizedPerson?: string;
  companyEmail?: string;
  nationalIdNumber?: string;
}

// Company validation helper types
export interface CompanyValidation {
  isValid: boolean;
  errors: string[];
}

// Company statistics (frontend için)
export interface CompanyStatistics {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  thisMonthRegistrations: number;
}