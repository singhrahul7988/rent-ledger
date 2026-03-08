import { Router } from "express";
import { z } from "zod";
import { BlockchainService } from "../services/blockchainService.js";
import { calculateRentScore } from "../services/rentScore.js";
import type { PaymentRecord, TransactionEvent } from "../types.js";
import {
  createPaymentRecord,
  createTransactionRecord,
  getLeaseById,
  listPaymentsByAccount,
  updateLeaseRecord
} from "../lib/persistence.js";

const initiateSchema = z.object({
  leaseId: z.string().min(4),
  payerAccountId: z.string().min(3),
  amountUsd: z.number().positive(),
  processingFeeUsd: z.number().min(0),
  dueDate: z.string().min(8),
  leaseName: z.string().min(2).optional(),
  landlordName: z.string().min(2).optional(),
  landlordAccountAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  notes: z.string().max(600).optional()
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
  leaseName?: string;
  landlordName?: string;
  landlordAccountAddress?: string;
  amountUsd: number;
  monthlyRentUsd: number;
  dueDay: number;
  onchainLeaseId?: string;
  processingFeeUsd: number;
  dueDate: string;
  notes?: string;
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

  router.post("/initiate", async (req, res) => {
    const parsed = initiateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payment payload", issues: parsed.error.flatten() });
    }

    let lease = null;
    try {
      lease = await getLeaseById(parsed.data.leaseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch lease";
      return res.status(500).json({ error: message });
    }

    if (!lease) {
      return res.status(404).json({ error: "Lease not found" });
    }

    const paymentIntentId = `pay_${Math.random().toString(36).slice(2, 7)}`;
    const leasePatch: Parameters<typeof updateLeaseRecord>[1] = {};
    if (parsed.data.landlordName) leasePatch.landlordName = parsed.data.landlordName.trim();
    if (parsed.data.landlordAccountAddress) {
      leasePatch.landlordAccountAddress = parsed.data.landlordAccountAddress;
    }
    if (parsed.data.amountUsd > 0) leasePatch.monthlyRentUsd = parsed.data.amountUsd;

    if (Object.keys(leasePatch).length > 0) {
      try {
        await updateLeaseRecord(lease.leaseId, leasePatch);
        lease = {
          ...lease,
          ...leasePatch
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to update lease details";
        return res.status(500).json({ error: message });
      }
    }

    paymentIntents.push({
      paymentIntentId,
      leaseId: parsed.data.leaseId,
      payerAccountId: parsed.data.payerAccountId,
      leaseName: parsed.data.leaseName,
      landlordName: parsed.data.landlordName || lease.landlordName,
      landlordAccountAddress: parsed.data.landlordAccountAddress || lease.landlordAccountAddress,
      amountUsd: parsed.data.amountUsd,
      monthlyRentUsd: lease.monthlyRentUsd,
      dueDay: lease.dueDay,
      onchainLeaseId: lease.onchainLeaseId,
      processingFeeUsd: parsed.data.processingFeeUsd,
      dueDate: parsed.data.dueDate,
      notes: parsed.data.notes,
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

    try {
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
        statusCode: 1,
        dueDay: intent.dueDay,
        monthlyRentUsd: intent.monthlyRentUsd,
        landlordAccountAddress: intent.landlordAccountAddress,
        onchainLeaseId: intent.onchainLeaseId
      });

      intent.status = "CONFIRMED";
      const confirmedAt = parsed.data.confirmedAt || new Date().toISOString();

      const monthLabel = new Date(confirmedAt).toLocaleString("en-US", {
        month: "long",
        year: "numeric"
      });

      const paymentRecord: PaymentRecord = {
        paymentRecordId: onchain.paymentRecordId,
        leaseId: intent.leaseId,
        month: monthLabel,
        amountUsd: intent.amountUsd,
        status: "ON_TIME",
        txHash: parsed.data.txHash || onchain.txHash,
        certificateTokenId: onchain.tokenId,
        confirmedAt
      };
      await createPaymentRecord(paymentRecord);

      const lease = await getLeaseById(intent.leaseId);
      if (lease && onchain.onchainLeaseId) {
        await updateLeaseRecord(lease.leaseId, { onchainLeaseId: onchain.onchainLeaseId });
      }

      const targetAccountId = lease?.tenantAccountId || intent.payerAccountId;
      const accountPayments = await listPaymentsByAccount(targetAccountId);
      const scoreSnapshot = calculateRentScore(targetAccountId, accountPayments);

      const tx: TransactionEvent = {
        eventId: `evt_${Math.random().toString(36).slice(2, 8)}`,
        accountId: targetAccountId,
        eventType: "PAYMENT_CONFIRMED",
        status: "SUCCESS",
        timestamp: confirmedAt,
        txHash: parsed.data.txHash || onchain.txHash,
        explorerUrl: toExplorerUrl(parsed.data.txHash || onchain.txHash)
      };
      await createTransactionRecord(tx);

      return res.status(200).json({
        paymentRecordId: onchain.paymentRecordId,
        certificateTokenId: onchain.tokenId,
        scoreDelta: 18,
        newScore: scoreSnapshot.score
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to confirm payment";
      return res.status(500).json({ error: message });
    }
  });

  router.get("/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const items = await listPaymentsByAccount(accountId);
      return res.status(200).json({ items, total: items.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch payments";
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
