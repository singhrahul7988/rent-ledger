import { Router } from "express";
import { z } from "zod";
import { leases, payments, transactions } from "../data/store.js";
import { BlockchainService } from "../services/blockchainService.js";
import { calculateRentScore } from "../services/rentScore.js";
import type { TransactionEvent } from "../types.js";

const initiateSchema = z.object({
  leaseId: z.string().min(4),
  payerAccountId: z.string().min(3),
  amountUsd: z.number().positive(),
  processingFeeUsd: z.number().min(0),
  dueDate: z.string().min(8)
});

const webhookSchema = z.object({
  paymentIntentId: z.string().min(4),
  networkStatus: z.enum(["CONFIRMED", "FAILED"]),
  txHash: z.string().optional(),
  confirmedAt: z.string().optional()
});

type PaymentIntent = {
  paymentIntentId: string;
  leaseId: string;
  payerAccountId: string;
  amountUsd: number;
  processingFeeUsd: number;
  dueDate: string;
  status: "PENDING_ONCHAIN" | "CONFIRMED" | "FAILED";
};

const paymentIntents: PaymentIntent[] = [];
const explorerBaseUrl = process.env.EXPLORER_BASE_URL || "https://creditcoin-testnet.blockscout.com/tx/";

function toExplorerUrl(txHash: string) {
  if (!txHash || txHash.includes("...")) return "";
  return `${explorerBaseUrl}${txHash}`;
}

export function paymentsRouter(blockchainService: BlockchainService) {
  const router = Router();

  router.post("/initiate", (req, res) => {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payment payload", issues: parsed.error.flatten() });
    }

    const lease = leases.find((l) => l.leaseId === parsed.data.leaseId);
    if (!lease) {
      return res.status(404).json({ error: "Lease not found" });
    }

    const paymentIntentId = `pay_${Math.random().toString(36).slice(2, 7)}`;
    paymentIntents.push({
      paymentIntentId,
      leaseId: parsed.data.leaseId,
      payerAccountId: parsed.data.payerAccountId,
      amountUsd: parsed.data.amountUsd,
      processingFeeUsd: parsed.data.processingFeeUsd,
      dueDate: parsed.data.dueDate,
      status: "PENDING_ONCHAIN"
    });

    return res.status(202).json({
      paymentIntentId,
      status: "PENDING_ONCHAIN",
      estimatedConfirmationSeconds: 25
    });
  });

  router.post("/webhook/mock", async (req, res) => {
    const parsed = webhookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid webhook payload", issues: parsed.error.flatten() });
    }

    const intent = paymentIntents.find((p) => p.paymentIntentId === parsed.data.paymentIntentId);
    if (!intent) {
      return res.status(404).json({ error: "Payment intent not found" });
    }

    if (parsed.data.networkStatus === "FAILED") {
      intent.status = "FAILED";
      return res.status(200).json({ paymentIntentId: intent.paymentIntentId, status: intent.status });
    }

    const onchain = await blockchainService.recordPaymentOnChain({
      leaseId: intent.leaseId,
      amountUsd: intent.amountUsd,
      statusCode: 1
    });

    intent.status = "CONFIRMED";
    const confirmedAt = parsed.data.confirmedAt || new Date().toISOString();

    const monthLabel = new Date(confirmedAt).toLocaleString("en-US", {
      month: "long",
      year: "numeric"
    });

    payments.unshift({
      paymentRecordId: onchain.paymentRecordId,
      leaseId: intent.leaseId,
      month: monthLabel,
      amountUsd: intent.amountUsd,
      status: "ON_TIME",
      txHash: parsed.data.txHash || onchain.txHash,
      certificateTokenId: onchain.tokenId,
      confirmedAt
    });

    const lease = leases.find((l) => l.leaseId === intent.leaseId);
    const accountPayments = payments.filter((p) =>
      leases.some((l) => l.leaseId === p.leaseId && l.tenantAccountId === lease?.tenantAccountId)
    );
    const scoreSnapshot = calculateRentScore(lease?.tenantAccountId || intent.payerAccountId, accountPayments);

    const tx: TransactionEvent = {
      eventId: `evt_${Math.random().toString(36).slice(2, 8)}`,
      accountId: lease?.tenantAccountId || intent.payerAccountId,
      eventType: "PAYMENT_CONFIRMED",
      status: "SUCCESS",
      timestamp: confirmedAt,
      txHash: parsed.data.txHash || onchain.txHash,
      explorerUrl: toExplorerUrl(parsed.data.txHash || onchain.txHash)
    };
    transactions.unshift(tx);

    return res.status(200).json({
      paymentRecordId: onchain.paymentRecordId,
      certificateTokenId: onchain.tokenId,
      scoreDelta: 18,
      newScore: scoreSnapshot.score
    });
  });

  router.get("/:accountId", (req, res) => {
    const { accountId } = req.params;
    const leaseIds = leases.filter((l) => l.tenantAccountId === accountId).map((l) => l.leaseId);
    const items = payments.filter((p) => leaseIds.includes(p.leaseId));
    return res.status(200).json({ items, total: items.length });
  });

  return router;
}
