import type { Lease, Loan, LoanApplication, PaymentRecord, TransactionEvent } from "../types.js";

export const accountId = "acc_01HQP7S1A9";
const demoLandlordAddress = process.env.DEMO_LANDLORD_ADDRESS || process.env.BACKEND_WALLET_ADDRESS || "0x0000000000000000000000000000000000000001";

export const leases: Lease[] = [
  {
    leaseId: "lease_7f31",
    tenantAccountId: accountId,
    landlordName: "Marcus Williams",
    landlordAccountAddress: demoLandlordAddress,
    monthlyRentUsd: 1850,
    dueDay: 5,
    startDate: "2026-03-01",
    status: "ACTIVE"
  }
];

export const payments: PaymentRecord[] = [];

export const loans: Loan[] = [];
export const loanApplications: LoanApplication[] = [];

export const transactions: TransactionEvent[] = [];
