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
   * ✅ Manual check and update payment status - Backend'den gerçek durumu çeker
   */
  public async checkAndUpdatePaymentStatus(bookingId: number): Promise<PaymentStatusResponseDto> {
    return this.post<PaymentStatusResponseDto>(`/${bookingId}/payment/check-status`, {});
  }

  /**
   * Redirect user to payment URL
   */
    public redirectToPayment(paymentUrl: string): void {
    if (!paymentUrl) {
        throw new Error('Payment URL is required');
    }
    
    // ✅ BASIT: Backend'den gelen URL'i olduğu gibi kullan
    console.log('🔄 Redirecting to payment URL (as-is):', paymentUrl);
    
    // External redirect to Iyzico payment page
    window.location.href = paymentUrl;
    }

  /**
   * Poll payment status until completion or timeout
   */
  public async pollPaymentStatus(bookingId: number, maxRetries: number = 30, intervalMs: number = 2000): Promise<PaymentStatusResponseDto> {
    let lastStatus: PaymentStatusResponseDto | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        console.log(`Polling payment status - attempt ${i + 1}/${maxRetries}`);
        
        // Use the manual check method for more accurate status
        const status = i === 0 
          ? await this.getPaymentStatus(bookingId) 
          : await this.checkAndUpdatePaymentStatus(bookingId);
        
        lastStatus = status;
        
        console.log(`Payment status: ${status.paymentStatus}, Completed: ${status.paymentCompleted}`);
        
        // If payment is completed or failed, return immediately
        if (status.paymentCompleted || 
            status.paymentStatus === 'COMPLETED' || 
            status.paymentStatus === 'FAILED' ||
            status.paymentStatus === 'CANCELLED') {
          return status;
        }
        
        // Wait before next check (except for last iteration)
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        console.error(`Error polling payment status (attempt ${i + 1}):`, error);
        
        // On last attempt, throw the error
        if (i === maxRetries - 1) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    // Return last known status or throw timeout error
    if (lastStatus) {
      console.warn('Payment status polling timeout, returning last known status');
      return lastStatus;
    }
    
    throw new Error('Payment status polling timeout - no status received');
  }

  /**
   * ✅ Enhanced polling with callback for status updates
   */
  public async pollPaymentStatusWithCallback(
    bookingId: number, 
    onStatusUpdate: (status: PaymentStatusResponseDto) => void,
    maxRetries: number = 30, 
    intervalMs: number = 2000
  ): Promise<PaymentStatusResponseDto> {
    let lastStatus: PaymentStatusResponseDto | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const status = i === 0 
          ? await this.getPaymentStatus(bookingId) 
          : await this.checkAndUpdatePaymentStatus(bookingId);
        
        lastStatus = status;
        
        // Call the callback with current status
        onStatusUpdate(status);
        
        // If payment is completed or failed, return immediately
        if (status.paymentCompleted || 
            status.paymentStatus === 'COMPLETED' || 
            status.paymentStatus === 'FAILED' ||
            status.paymentStatus === 'CANCELLED') {
          return status;
        }
        
        // Wait before next check
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        console.error(`Error polling payment status (attempt ${i + 1}):`, error);
        
        if (i === maxRetries - 1 && !lastStatus) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
    
    if (lastStatus) {
      return lastStatus;
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

  /**
   * ✅ Check if payment is in final state
   */
  public isPaymentFinal(status: string): boolean {
    const finalStates = ['COMPLETED', 'FAILED', 'CANCELLED'];
    return finalStates.includes(status.toUpperCase());
  }

  /**
   * ✅ Get status display info
   */
  public getStatusDisplayInfo(status: PaymentStatusResponseDto) {
    const isSuccess = status.paymentCompleted || status.paymentStatus === 'COMPLETED';
    const isFailed = status.paymentStatus === 'FAILED' || status.paymentStatus === 'CANCELLED';
    const isPending = status.paymentStatus === 'PENDING' || status.paymentPending;
    
    return {
      isSuccess,
      isFailed,
      isPending,
      statusText: isSuccess ? 'Başarılı' : isFailed ? 'Başarısız' : 'Bekliyor',
      statusColor: isSuccess ? 'text-green-600' : isFailed ? 'text-red-600' : 'text-yellow-600',
      bgColor: isSuccess ? 'bg-green-50' : isFailed ? 'bg-red-50' : 'bg-yellow-50'
    };
  }
}

export const paymentService = new PaymentService();