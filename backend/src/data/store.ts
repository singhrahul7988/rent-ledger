import type { Lease, Loan, PaymentRecord, TransactionEvent } from "../types.js";

export const accountId = "acc_01HQP7S1A9";

export const leases: Lease[] = [
  {
    leaseId: "lease_7f31",
    tenantAccountId: accountId,
    landlordName: "Marcus Williams",
    landlordAccountAddress: "0x9D82...A11F",
    monthlyRentUsd: 1850,
    dueDay: 5,
    startDate: "2026-03-01",
    status: "ACTIVE"
  }
];

export const payments: PaymentRecord[] = [];

export const loans: Loan[] = [];

export const transactions: TransactionEvent[] = [];
