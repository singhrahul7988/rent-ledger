import { Router } from "express";
import {
  listLeasesByAccount,
  listPaymentsByAccount,
  resolveTenantAccountByTxHash
} from "../lib/persistence.js";

function normalize(value: string) {
  return String(value || "").trim();
}

export function tenantsRouter() {
  const router = Router();

  router.get("/resolve", async (req, res) => {
    try {
      const raw = normalize(String(req.query.query || ""));
      if (!raw) {
        return res.status(400).json({
          error: "Provide a tenant account ID or transaction hash in query param `query`."
        });
      }

      const lower = raw.toLowerCase();

      if (/^acc_[a-z0-9]+$/i.test(raw)) {
        const [leaseItems, paymentItems] = await Promise.all([
          listLeasesByAccount(raw),
          listPaymentsByAccount(raw)
        ]);
        const hasLease = leaseItems.length > 0;
        const hasPayment = paymentItems.length > 0;

        if (!hasLease && !hasPayment) {
          return res.status(404).json({ error: "Tenant account not found." });
        }

        return res.status(200).json({
          accountId: raw,
          matchedBy: "accountId"
        });
      }

      if (/^0x[a-f0-9]{64}$/i.test(raw)) {
        const resolved = await resolveTenantAccountByTxHash(lower);
        if (!resolved) {
          return res.status(404).json({ error: "Transaction hash not found." });
        }

        return res.status(200).json({
          accountId: resolved.accountId,
          matchedBy: "transactionHash",
          txHash: resolved.txHash
        });
      }

      return res.status(400).json({
        error: "Unsupported format. Use account ID (acc_...) or transaction hash (0x + 64 hex)."
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resolve tenant";
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
