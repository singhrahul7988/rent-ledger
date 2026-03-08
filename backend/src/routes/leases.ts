import { Router } from "express";
import { z } from "zod";
import { createLeaseRecord, listLeasesByAccount } from "../lib/persistence.js";

const createLeaseSchema = z.object({
  tenantAccountId: z.string().min(3),
  landlordName: z.string().min(2),
  landlordAccountAddress: z.string().min(6),
  monthlyRentUsd: z.number().positive(),
  currency: z.literal("USD"),
  dueDay: z.number().min(1).max(28),
  startDate: z.string().min(10)
});

export function leasesRouter() {
  const router = Router();

  router.get("/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const items = await listLeasesByAccount(accountId);
      return res.status(200).json({ items, total: items.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch leases";
      return res.status(500).json({ error: message });
    }
  });

  router.post("/", async (req, res) => {
    const parsed = createLeaseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid lease payload", issues: parsed.error.flatten() });
    }

    const lease = {
      leaseId: `lease_${Math.random().toString(36).slice(2, 7)}`,
      tenantAccountId: parsed.data.tenantAccountId,
      landlordName: parsed.data.landlordName,
      landlordAccountAddress: parsed.data.landlordAccountAddress,
      monthlyRentUsd: parsed.data.monthlyRentUsd,
      dueDay: parsed.data.dueDay,
      startDate: parsed.data.startDate,
      status: "ACTIVE" as const
    };

    try {
      await createLeaseRecord(lease);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create lease";
      return res.status(500).json({ error: message });
    }

    return res.status(201).json({
      leaseId: lease.leaseId,
      status: lease.status,
      createdAt: new Date().toISOString()
    });
  });

  return router;
}
