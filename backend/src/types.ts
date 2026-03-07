export type PaymentStatus = "ON_TIME" | "LATE";
export type LoanState = "LOCKED" | "ELIGIBLE" | "ACTIVE";
export type LoanStatus = "ACTIVE" | "PAID" | "DEFAULTED";
export type TransactionStatus = "SUCCESS" | "PENDING" | "FAILED";
export type LoanApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface Lease {
  leaseId: string;
  tenantAccountId: string;
  onchainLeaseId?: string;
  landlordName: string;
  landlordAccountAddress: string;
  monthlyRentUsd: number;
  dueDay: number;
  startDate: string;
  status: "ACTIVE" | "PAUSED" | "ENDED";
}

export interface PaymentRecord {
  paymentRecordId: string;
  leaseId: string;
  month: string;
  amountUsd: number;
  status: PaymentStatus;
  txHash: string;
  certificateTokenId: string;
  confirmedAt: string;
}

export interface RentScoreSnapshot {
  accountId: string;
  score: number;
  tier: "BUILDING_CREDIT" | "CREDIT_STARTER" | "CREDIT_BUILDER" | "CREDIT_ESTABLISHED" | "CREDIT_TRUSTED";
  pointsToNextTier: number;
  asOf: string;
}

export interface Loan {
  loanId: string;
  accountId: string;
  tier: 1 | 2 | 3 | 4;
  principalUsd: number;
  apr: number;
  disbursedAt: string;
  nextInstallmentDate: string;
  status: LoanStatus;
}

export interface LoanApplication {
  applicationId: string;
  accountId: string;
  tier: 1 | 2 | 3 | 4;
  requestedAmountUsd: number;
  requestedApr: number;
  tenorMonths: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  annualIncomeUsd: number;
  employmentStatus: "EMPLOYED" | "SELF_EMPLOYED" | "STUDENT" | "OTHER";
  purpose: string;
  idDocumentType: "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE";
  idDocumentNumberMasked: string;
  addressLine1: string;
  city: string;
  country: string;
  postalCode: string;
  consentKyc: boolean;
  consentTerms: boolean;
  status: LoanApplicationStatus;
  createdAt: string;
}

export interface TransactionEvent {
  eventId: string;
  accountId: string;
  eventType: "PAYMENT_CONFIRMED" | "CERTIFICATE_ISSUED" | "SCORE_SNAPSHOT" | "LOAN_REQUESTED" | "LOAN_ACTIVATED" | "LOAN_REPAID";
  status: TransactionStatus;
  timestamp: string;
  txHash: string;
  explorerUrl: string;
}
