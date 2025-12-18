import { BaseService } from "./base/BaseService";
import { bookingService } from "./bookingService";
import type { PaymentStatusResponseDto } from "@/types/payment.types";

class PaymentService extends BaseService {
  constructor() {
    // NOT: httpClient zaten /api baseURL kullanıyor, bu yüzden /api prefix'i eklememeliyiz
    super("/iyzico");
  }

  /**
   * Get current payment status and enrich with booking paymentUrl if present.
   */
  public async getPaymentStatus(bookingId: number): Promise<PaymentStatusResponseDto> {
    // Call status endpoint (wrapped by ApiResponse)
    const statusResp = await this.api.get(`${this.baseUrl}/booking/${bookingId}/status`, {
      headers: this.getAuthHeaders(),
    });

    const apiResponse = statusResp.data as { success: boolean; data?: any };
    const statusData = (apiResponse?.data ?? {}) as PaymentStatusResponseDto;

    // Try to fetch booking for paymentUrl and totals
    let booking: any = null;
    try {
      booking = await bookingService.getBookingById(bookingId);
    } catch {
      // ignore; we'll rely on status only
    }

    const paymentUrl: string | null =
      (booking && typeof booking.paymentUrl === "string" && booking.paymentUrl) || null;

    const totalAmount: number | undefined = (booking && booking.totalPrice) || undefined;
    const isDepositPayment: boolean | undefined =
      booking && typeof booking.isDepositPayment === "boolean" ? booking.isDepositPayment : undefined;
    const depositPercentage: number | undefined =
      booking && typeof booking.depositPercentage === "number" ? booking.depositPercentage : undefined;

    const computedDeposit =
      isDepositPayment && totalAmount
        ? this.calculateDepositAmount(totalAmount, depositPercentage ?? 20)
        : undefined;

    const paymentCompleted =
      statusData.status === "SUCCESS" || statusData.status === "COMPLETED";

    const paymentRequired = !paymentCompleted && (Boolean(paymentUrl) || statusData.status === "PENDING");

    return {
      ...statusData,
      bookingId,
      paymentUrl,
      paymentRequired,
      paymentCompleted,
      totalAmount,
      depositAmount: computedDeposit,
      remainingAmount:
        totalAmount !== undefined && computedDeposit !== undefined
          ? Math.max(totalAmount - computedDeposit, 0)
          : undefined,
    };
  }

  /**
   * Calculate deposit amount with given percentage
   */
  public calculateDepositAmount(totalAmount: number, percentage: number): number {
    if (!totalAmount || totalAmount <= 0) return 0;
    const pct = Math.max(0, Math.min(100, percentage || 0));
    const value = (totalAmount * pct) / 100;
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Format currency for display
   */
  public formatCurrency(amount: number, currency: string = "TL"): string {
    try {
      return `${amount.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} ${currency}`;
    } catch {
      return `${amount} ${currency}`;
    }
  }

  /**
   * Build iframe url by appending &iframe=true (or ?iframe=true)
   */
  public buildIframeUrl(url: string): string {
    if (!url) return url;
    const hasQuery = url.includes("?");
    if (url.includes("iframe=true")) return url;
    return `${url}${hasQuery ? "&" : "?"}iframe=true`;
  }

  /**
   * Redirect to external payment page
   */
  public redirectToPayment(url: string): void {
    if (typeof window !== "undefined" && url) {
      window.location.href = url;
    }
  }
}

export const paymentService = new PaymentService();


