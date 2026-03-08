import { Router } from "express";
import { listTransactionsByAccount } from "../lib/persistence.js";

export function transactionsRouter() {
  const router = Router();

  router.get("/:accountId", async (req, res) => {
    try {
      const { accountId } = req.params;
      const items = await listTransactionsByAccount(accountId);
      return res.status(200).json({ items, total: items.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch transactions";
      return res.status(500).json({ error: message });
    }
  });

  return router;
}
