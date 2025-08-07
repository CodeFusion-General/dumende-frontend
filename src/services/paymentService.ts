import { BaseService } from './base/BaseService';
import { PaymentStatusResponseDto } from '@/types/payment.types';

class PaymentService extends BaseService {
  constructor() {
    super('/bookings');
  }

  /**
   * Get payment status for a booking
   */
  public async getPaymentStatus(bookingId: number): Promise<PaymentStatusResponseDto> {
    return this.get<PaymentStatusResponseDto>(`/${bookingId}/payment/status`);
  }

  /**
   * Initialize deposit payment for a booking
   */
  public async initializeDepositPayment(bookingId: number): Promise<PaymentStatusResponseDto> {
    return this.post<PaymentStatusResponseDto>(`/${bookingId}/payment/initialize-deposit`, {});
  }

  /**
   * Redirect user to payment URL
   */
  public redirectToPayment(paymentUrl: string): void {
    if (!paymentUrl) {
      throw new Error('Payment URL is required');
    }
    
    // External redirect to Iyzico payment page
    window.location.href = paymentUrl;
  }

  /**
   * Poll payment status until completion or timeout
   */
  public async pollPaymentStatus(bookingId: number, maxRetries: number = 30, intervalMs: number = 2000): Promise<PaymentStatusResponseDto> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const status = await this.getPaymentStatus(bookingId);
        
        // If payment is completed or failed, return immediately
        if (status.paymentCompleted || status.paymentStatus === 'COMPLETED' || status.paymentStatus === 'FAILED') {
          return status;
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      } catch (error) {
        console.error('Error polling payment status:', error);
        // Continue polling even if there's an error
      }
    }
    
    throw new Error('Payment status polling timeout');
  }

  /**
   * Calculate deposit amount from total price
   */
  public calculateDepositAmount(totalPrice: number, depositPercentage: number = 20): number {
    return Math.round((totalPrice * depositPercentage) / 100);
  }

  /**
   * Format currency amount
   */
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export const paymentService = new PaymentService();
