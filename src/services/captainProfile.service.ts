import { BaseService } from '@/services/base/BaseService';
import {
  CaptainProfile,
  PersonalInfoFormData,
  ProfessionalInfoFormData,
  PersonalInfo,
  ProfessionalInfo,
  CaptainStatistics
} from '@/types/profile.types';

class CaptainProfileService extends BaseService {
  constructor() {
    super('/captain/profile');
  }

  // Get complete captain profile
  async getCaptainProfile(): Promise<CaptainProfile> {
    return this.get('');
  }

  // Get captain profile by ID (for public viewing)
  async getCaptainProfileById(userId: number): Promise<CaptainProfile> {
    return this.get(`/${userId}`);
  }

  // Get personal info only
  async getPersonalInfo(): Promise<PersonalInfo> {
    return this.get('/personal-info');
  }

  // Update personal info
  async updatePersonalInfo(data: PersonalInfoFormData): Promise<PersonalInfo> {
    return this.put('/personal-info', data);
  }

  // Get professional info only
  async getProfessionalInfo(): Promise<ProfessionalInfo> {
    return this.get('/professional-info');
  }

  // Update professional info
  async updateProfessionalInfo(data: ProfessionalInfoFormData): Promise<ProfessionalInfo> {
    return this.put('/professional-info', data);
  }

  // Get statistics only
  async getStatistics(): Promise<CaptainStatistics> {
    return this.get('/statistics');
  }

  // Upload profile photo
  async uploadProfilePhoto(file: File): Promise<{ photoUrl: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await this.api.post(
      `${this.baseUrl}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...this.getAuthHeaders(),
        },
      }
    );
    return response.data as { photoUrl: string };
  }

  // Remove profile photo
  async removeProfilePhoto(): Promise<void> {
    return this.delete('/photo');
  }

  // Get profile photo URL (backend returns text/plain URL)
  async getProfilePhoto(userId: number): Promise<string> {
    const response = await this.api.get(`/photo/${userId}`, {
      responseType: 'text'
    });
    return response.data as string;
  }

  // **FINANCIAL ENDPOINTS**

  /**
   * Get finance summary (Backend: GET /api/captain/profile/finance/summary)
   */
  async getFinanceSummary(): Promise<{
    totalEarnings: number;
    currentBalance: number;
    pendingPayments: number;
    completedBookings: number;
    monthlyRevenue: number;
    yearlyRevenue: number;
    averageBookingValue: number;
    lastPaymentDate?: string;
  }> {
    return this.get('/finance/summary');
  }

  /**
   * Get finance transactions (Backend: GET /api/captain/profile/finance/transactions)
   */
  async getFinanceTransactions(): Promise<Array<{
    id: number;
    transactionId: string;
    bookingId: number;
    amount: number;
    type: 'PAYMENT' | 'REFUND' | 'COMMISSION' | 'BONUS';
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    description: string;
    transactionDate: string;
    processingFee?: number;
    netAmount: number;
    paymentMethod?: string;
    customerName?: string;
  }>> {
    return this.get('/finance/transactions');
  }

  /**
   * Get finance transactions with filters
   */
  async getFinanceTransactionsFiltered(filters: {
    startDate?: string;
    endDate?: string;
    type?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
  }): Promise<Array<{
    id: number;
    transactionId: string;
    bookingId: number;
    amount: number;
    type: string;
    status: string;
    description: string;
    transactionDate: string;
    processingFee?: number;
    netAmount: number;
    paymentMethod?: string;
    customerName?: string;
  }>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const queryString = queryParams.toString();
    return this.get(`/finance/transactions${queryString ? '?' + queryString : ''}`);
  }

  // **CONVENIENCE METHODS**

  /**
   * Get monthly earnings for current year
   */
  async getMonthlyEarnings(year?: number): Promise<Record<string, number>> {
    const currentYear = year || new Date().getFullYear();
    const startDate = `${currentYear}-01-01`;
    const endDate = `${currentYear}-12-31`;
    
    const transactions = await this.getFinanceTransactionsFiltered({
      startDate,
      endDate,
      type: 'PAYMENT',
      status: 'COMPLETED'
    });
    
    const monthlyEarnings: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const month = transaction.transactionDate.substring(0, 7); // YYYY-MM format
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + transaction.netAmount;
    });
    
    return monthlyEarnings;
  }

  /**
   * Get total earnings for a specific period
   */
  async getTotalEarnings(startDate: string, endDate: string): Promise<number> {
    const transactions = await this.getFinanceTransactionsFiltered({
      startDate,
      endDate,
      type: 'PAYMENT',
      status: 'COMPLETED'
    });
    
    return transactions.reduce((total, transaction) => total + transaction.netAmount, 0);
  }
}

export const captainProfileService = new CaptainProfileService();
