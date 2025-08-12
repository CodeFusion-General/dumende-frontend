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

// 3DS DTOs
export interface ThreeDSInitializeRequestDto {
  bookingId: number;
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  installment?: number;
}

export interface ThreeDSInitializeResponseDto {
  status: string;
  threeDSHtmlContent?: string;
  paymentId?: string;
  conversationId?: string;
  bookingId?: number;
  errorCode?: string;
  errorMessage?: string;
  errorGroup?: string;
  systemTime?: number;
}

export interface ThreeDSCompleteRequestDto {
  paymentId: string;
  conversationData?: string | null;
  bookingId: number;
}

export interface BinCheckResponseDto {
  binNumber?: string;
  bankName?: string;
  cardType?: string;
  cardAssociation?: string;
  force3ds?: number;
  installmentPrices?: Array<{ installmentNumber: number; totalPrice: number }>;
}