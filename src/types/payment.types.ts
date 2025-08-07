export interface PaymentStatusResponseDto {
  bookingId: number;
  paymentRequired: boolean;
  paymentStatus: string;
  paymentUrl?: string;
  checkoutToken?: string;
  totalAmount: number;
  depositAmount: number;
  paidAmount: number;
  remainingAmount: number;
  depositPercentage: number;
  paymentDeadline: string;
  message: string;
  paymentType: PaymentType;
  paymentCompleted: boolean;
  paymentPending: boolean;
}

export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  REMAINING = 'REMAINING',
  FULL = 'FULL'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PARTIAL = 'PARTIAL'
}
