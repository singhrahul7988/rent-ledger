import { v4 as uuidv4 } from "uuid";
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
    startDate: "2025-03-01",
    status: "ACTIVE"
  }
];

export const payments: PaymentRecord[] = [
  {
    paymentRecordId: "pr_4481",
    leaseId: "lease_7f31",
    month: "March 2026",
    amountUsd: 1850,
    status: "ON_TIME",
    txHash: "0x7f29ab...012d",
    certificateTokenId: "1024",
    confirmedAt: "2026-03-05T08:16:02Z"
  },
  {
    paymentRecordId: "pr_4402",
    leaseId: "lease_7f31",
    month: "February 2026",
    amountUsd: 1850,
    status: "ON_TIME",
    txHash: "0x17f9aa...6f2e",
    certificateTokenId: "1018",
    confirmedAt: "2026-02-05T08:13:15Z"
  },
  {
    paymentRecordId: "pr_4328",
    leaseId: "lease_7f31",
    month: "January 2026",
    amountUsd: 1850,
    status: "ON_TIME",
    txHash: "0x29d7ab...40ce",
    certificateTokenId: "1012",
    confirmedAt: "2026-01-05T08:10:44Z"
  },
  {
    paymentRecordId: "pr_4249",
    leaseId: "lease_7f31",
    month: "December 2025",
    amountUsd: 1850,
    status: "LATE",
    txHash: "0xae3c11...91f4",
    certificateTokenId: "1006",
    confirmedAt: "2025-12-09T12:09:31Z"
  }
];

export const loans: Loan[] = [
  {
    loanId: "loan_82P1",
    accountId,
    tier: 2,
    principalUsd: 2200,
    apr: 18,
    disbursedAt: "2026-03-05T08:18:22Z",
    nextInstallmentDate: "2026-04-10",
    status: "ACTIVE"
  }
];

export const transactions: TransactionEvent[] = [
  {
    eventId: uuidv4(),
    accountId,
    eventType: "PAYMENT_CONFIRMED",
    status: "SUCCESS",
    timestamp: "2026-03-05T08:16:02Z",
    txHash: "0x7f29ab...012d",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x7f29ab012d"
  },
  {
    eventId: uuidv4(),
    accountId,
    eventType: "CERTIFICATE_ISSUED",
    status: "SUCCESS",
    timestamp: "2026-03-05T08:16:05Z",
    txHash: "0x1e81ce...99a2",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x1e81ce99a2"
  }
];
