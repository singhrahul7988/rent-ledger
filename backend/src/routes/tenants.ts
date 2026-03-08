import { Router } from "express";
import { leases, payments } from "../data/store.js";

function normalize(value: string) {
  return String(value || "").trim();
}

export function tenantsRouter() {
  const router = Router();

  router.get("/resolve", (req, res) => {
    const raw = normalize(String(req.query.query || ""));
    if (!raw) {
      return res.status(400).json({
        error: "Provide a tenant account ID or transaction hash in query param `query`."
      });
    }

    const lower = raw.toLowerCase();

    if (/^acc_[a-z0-9]+$/i.test(raw)) {
      const hasLease = leases.some((lease) => lease.tenantAccountId === raw);
      const hasPayment = payments.some((payment) =>
        leases.some((lease) => lease.leaseId === payment.leaseId && lease.tenantAccountId === raw)
      );

      if (!hasLease && !hasPayment) {
        return res.status(404).json({ error: "Tenant account not found." });
      }

      return res.status(200).json({
        accountId: raw,
        matchedBy: "accountId"
      });
    }

    if (/^0x[a-f0-9]{64}$/i.test(raw)) {
      const matchedPayment = payments.find((payment) => String(payment.txHash).toLowerCase() === lower);
      if (!matchedPayment) {
        return res.status(404).json({ error: "Transaction hash not found." });
      }

      const lease = leases.find((item) => item.leaseId === matchedPayment.leaseId);
      if (!lease) {
        return res.status(404).json({ error: "Unable to resolve tenant for this transaction." });
      }

      return res.status(200).json({
        accountId: lease.tenantAccountId,
        matchedBy: "transactionHash",
        txHash: matchedPayment.txHash
      });
    }

    return res.status(400).json({
      error: "Unsupported format. Use account ID (acc_...) or transaction hash (0x + 64 hex)."
    });
  });

  return router;
}
