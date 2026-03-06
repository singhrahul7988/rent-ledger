import { Router } from "express";
import { z } from "zod";
import { leases, loans, payments, transactions } from "../data/store.js";
import { BlockchainService } from "../services/blockchainService.js";
import { calculateRentScore, isTierEligible } from "../services/rentScore.js";
import type { Loan, TransactionEvent } from "../types.js";

const eligibilitySchema = z.object({
  accountId: z.string().min(3),
  requestedTier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
});

const requestSchema = z.object({
  accountId: z.string().min(3),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  amountUsd: z.number().positive()
});

const tierTerms: Record<1 | 2 | 3 | 4, { minScore: number; maxAmountUsd: number; apr: number; tenorMonths: number }> = {
  1: { minScore: 300, maxAmountUsd: 10000, apr: 18, tenorMonths: 6 },
  2: { minScore: 450, maxAmountUsd: 30000, apr: 15, tenorMonths: 6 },
  3: { minScore: 600, maxAmountUsd: 75000, apr: 12, tenorMonths: 6 },
  4: { minScore: 700, maxAmountUsd: 150000, apr: 10, tenorMonths: 6 }
};
const explorerBaseUrl = process.env.EXPLORER_BASE_URL || "https://creditcoin-testnet.blockscout.com/tx/";

function toExplorerUrl(txHash: string) {
  if (!txHash || txHash.includes("...")) return "";
  return `${explorerBaseUrl}${txHash}`;
}

export function loansRouter(blockchainService: BlockchainService) {
  const router = Router();

  router.get("/:accountId", (req, res) => {
    const { accountId } = req.params;
    const items = loans.filter((loan) => loan.accountId === accountId);
    return res.status(200).json({ items, total: items.length });
  });

  router.post("/eligibility", (req, res) => {
    const parsed = eligibilitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid eligibility payload", issues: parsed.error.flatten() });
    }

    const { accountId, requestedTier } = parsed.data;
    const leaseIds = leases.filter((l) => l.tenantAccountId === accountId).map((l) => l.leaseId);
    const accountPayments = payments.filter((p) => leaseIds.includes(p.leaseId));
    const score = calculateRentScore(accountId, accountPayments).score;
    const terms = tierTerms[requestedTier];
    const eligible = isTierEligible(score, requestedTier);

    return res.status(200).json({
      eligible,
      score,
      requiredScore: terms.minScore,
      maxAmountUsd: terms.maxAmountUsd,
      apr: terms.apr,
      tenorMonths: terms.tenorMonths
    });
  });

  router.post("/request", async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid loan payload", issues: parsed.error.flatten() });
    }

    const { accountId, tier, amountUsd } = parsed.data;
    const leaseIds = leases.filter((l) => l.tenantAccountId === accountId).map((l) => l.leaseId);
    const accountPayments = payments.filter((p) => leaseIds.includes(p.leaseId));
    const score = calculateRentScore(accountId, accountPayments).score;
    const terms = tierTerms[tier];

    if (!isTierEligible(score, tier)) {
      return res.status(400).json({ error: "Account not eligible for this tier" });
    }
    if (amountUsd > terms.maxAmountUsd) {
      return res.status(400).json({ error: "Requested amount exceeds tier limit" });
    }

    const chain = await blockchainService.requestLoanOnChain({
      accountId,
      tier,
      amountUsd
    });

    const loan: Loan = {
      loanId: chain.loanId,
      accountId,
      tier,
      principalUsd: amountUsd,
      apr: terms.apr,
      disbursedAt: new Date().toISOString(),
      nextInstallmentDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      status: "ACTIVE"
    };
    loans.unshift(loan);

    const tx: TransactionEvent = {
      eventId: `evt_${Math.random().toString(36).slice(2, 8)}`,
      accountId,
      eventType: "LOAN_REQUESTED",
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      txHash: chain.txHash,
      explorerUrl: toExplorerUrl(chain.txHash)
    };
    transactions.unshift(tx);

    return res.status(201).json({
      loanId: loan.loanId,
      status: loan.status,
      principalUsd: loan.principalUsd,
      apr: loan.apr,
      nextInstallmentDate: loan.nextInstallmentDate
    });
  });

  return router;
}
