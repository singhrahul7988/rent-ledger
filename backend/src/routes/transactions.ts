import { Router } from "express";
import { transactions } from "../data/store.js";

export function transactionsRouter() {
  const router = Router();

  router.get("/:accountId", (req, res) => {
    const { accountId } = req.params;
    const items = transactions.filter((tx) => tx.accountId === accountId);
    return res.status(200).json({ items, total: items.length });
  });

  return router;
}
