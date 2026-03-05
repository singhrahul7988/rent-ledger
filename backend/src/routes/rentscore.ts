import { Router } from "express";
import { leases, payments } from "../data/store.js";
import { calculateRentScore } from "../services/rentScore.js";

export function rentScoreRouter() {
  const router = Router();

  router.get("/:accountId", (req, res) => {
    const { accountId } = req.params;
    const leaseIds = leases.filter((l) => l.tenantAccountId === accountId).map((l) => l.leaseId);
    const accountPayments = payments.filter((p) => leaseIds.includes(p.leaseId));
    const snapshot = calculateRentScore(accountId, accountPayments);

    return res.status(200).json({
      accountId,
      score: snapshot.score,
      tier: snapshot.tier,
      asOf: snapshot.asOf,
      factors: {
        onTimePayments: accountPayments.filter((p) => p.status === "ON_TIME").length,
        latePayments: accountPayments.filter((p) => p.status === "LATE").length,
        tenureMonths: 13,
        avgRentUsd:
          accountPayments.length > 0
            ? Number(
                (
                  accountPayments.reduce((acc, p) => acc + p.amountUsd, 0) /
                  accountPayments.length
                ).toFixed(2)
              )
            : 0
      },
      nextTierTarget: snapshot.score < 300 ? 300 : snapshot.score < 450 ? 450 : snapshot.score < 600 ? 600 : snapshot.score < 700 ? 700 : 850,
      pointsToNextTier: snapshot.pointsToNextTier
    });
  });

  return router;
}
