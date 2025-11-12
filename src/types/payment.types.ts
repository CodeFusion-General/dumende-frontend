export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "COMPLETED" | "CANCELLED" | "EXPIRED" | "TIMEOUT";

export interface PaymentStatusResponseDto {
  paymentTransactionId: number;
  merchantOid?: string | null;
  bookingId: number;
  status: PaymentStatus;
  statusDescription?: string;
  amount?: number;
  currency?: string;
  transactionId?: string | null;
  paytrSessionId?: string | null;
  errorMessage?: string | null;
  paymentDate?: string | null;
  transactionDate?: string | null;
  createdAt?: string | null;
  isTestTransaction?: boolean;
  conversationId?: string | null;
  paymentId?: string | null;

  // Frontend convenience fields (not from backend, computed client-side)
  paymentRequired?: boolean;
  paymentCompleted?: boolean;
  paymentUrl?: string | null;
  totalAmount?: number;
  depositAmount?: number;
  remainingAmount?: number;
}

export interface PaymentInitializationResponseDto {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  merchantOrderId?: string;
  amount?: number;
  currency?: string;
  testMode?: boolean;
  isDeposit?: boolean;
  depositPercentage?: number | null;
  bookingId?: number;
  errorMessage?: string;
}

export interface PaymentConfigDto {
  testMode?: boolean;
  locale?: string;
  currency?: string;
  enabledInstallments?: number[];
  testCardInfo?: string | null;
}


