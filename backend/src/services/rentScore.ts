import type { PaymentRecord, RentScoreSnapshot } from "../types.js";

const tierConfig = [
  { min: 700, tier: "CREDIT_TRUSTED" as const },
  { min: 600, tier: "CREDIT_ESTABLISHED" as const },
  { min: 450, tier: "CREDIT_BUILDER" as const },
  { min: 300, tier: "CREDIT_STARTER" as const },
  { min: 0, tier: "BUILDING_CREDIT" as const }
];

const nextTierByTier: Record<RentScoreSnapshot["tier"], number> = {
  BUILDING_CREDIT: 300,
  CREDIT_STARTER: 450,
  CREDIT_BUILDER: 600,
  CREDIT_ESTABLISHED: 700,
  CREDIT_TRUSTED: 850
};

export function calculateRentScore(accountId: string, records: PaymentRecord[]): RentScoreSnapshot {
  const sorted = [...records].sort((a, b) => {
    return new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime();
  });

  if (sorted.length === 0) {
    return {
      accountId,
      score: 150,
      tier: "BUILDING_CREDIT",
      pointsToNextTier: 150,
      asOf: new Date().toISOString()
    };
  }

  const onTimeCount = sorted.filter((r) => r.status === "ON_TIME").length;
  const lateCount = sorted.filter((r) => r.status === "LATE").length;
  const lastSix = sorted.slice(-6);
  const consistencyBonus =
    lastSix.length === 6 && lastSix.every((r) => r.status === "ON_TIME") ? 50 : 0;

  const averageRent = sorted.reduce((sum, r) => sum + r.amountUsd, 0) / sorted.length;
  const amountPoints = averageRent >= 1000 ? 50 : averageRent >= 500 ? 30 : 10;

  const first = new Date(sorted[0].confirmedAt).getTime();
  const latest = new Date(sorted[sorted.length - 1].confirmedAt).getTime();
  const tenureMonths = Math.floor((latest - first) / (1000 * 60 * 60 * 24 * 30));
  const tenurePoints = tenureMonths >= 12 ? 50 : tenureMonths >= 6 ? 25 : 0;

  const onTimePoints = Math.min(onTimeCount * 30, 300);
  const latePenalty = lateCount * 15;

  let score = 150 + onTimePoints + consistencyBonus + amountPoints + tenurePoints - latePenalty;
  score = Math.max(0, Math.min(850, score));

  const tier = tierConfig.find((t) => score >= t.min)?.tier ?? "BUILDING_CREDIT";
  const nextTarget = nextTierByTier[tier];

  return {
    accountId,
    score,
    tier,
    pointsToNextTier: Math.max(0, nextTarget - score),
    asOf: new Date().toISOString()
  };
}

export function isTierEligible(score: number, tier: 1 | 2 | 3 | 4): boolean {
  const minScores: Record<1 | 2 | 3 | 4, number> = {
    1: 300,
    2: 450,
    3: 600,
    4: 700
  };
  return score >= minScores[tier];
}
