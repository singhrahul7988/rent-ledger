import { useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  buildScoreReportBlob,
  buildScoreReportData,
  scoreTier
} from "../../utils/scoreReportPdf";

function tierLabel(score) {
  return scoreTier(score);
}

function tierClass(score) {
  if (score >= 700) return "trusted";
  if (score >= 600) return "established";
  if (score >= 450) return "builder";
  if (score >= 300) return "starter";
  return "building";
}

function buildTrend(payments, finalScore) {
  const sorted = [...payments].sort(
    (a, b) => new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime()
  );
  if (sorted.length === 0) {
    return [{ month: "Current", score: finalScore }];
  }

  let runningScore = 150;
  const points = sorted.slice(-5).map((payment) => {
    runningScore += payment.status === "ON_TIME" ? 30 : -15;
    runningScore = Math.max(0, Math.min(finalScore, runningScore));
    return {
      month: new Date(payment.confirmedAt).toLocaleDateString("en-US", {
        month: "short"
      }),
      score: runningScore
    };
  });

  points[points.length - 1] = {
    ...points[points.length - 1],
    month: "Current",
    score: finalScore
  };

  return points;
}

export default function MyRentScorePage() {
  const navigate = useNavigate();
  const { accountId, rentScore, payments } = useOutletContext();
  const score = rentScore?.score || 150;
  const gaugeProgress = Number(((score / 850) * 75).toFixed(2));
  const trend = useMemo(() => buildTrend(payments, score), [payments, score]);
  const factors = rentScore?.factors || {
    onTimePayments: 0,
    latePayments: 0,
    tenureMonths: 0,
    avgRentUsd: 0
  };

  const factorItems = [
    {
      name: "Payment Count",
      detail: "+30 per payment",
      progress: Math.min(100, Math.round((factors.onTimePayments * 30 * 100) / 300)),
      points: `+${Math.min(factors.onTimePayments * 30, 300)}`
    },
    {
      name: "Consistency Bonus",
      detail: "+50 for 6 months streak",
      progress: Math.min(100, Math.round((factors.onTimePayments / 6) * 100)),
      points: factors.onTimePayments >= 6 ? "+50" : "+0"
    },
    {
      name: "Rental Amount Tier",
      detail: "+50 for $1,000+/month",
      progress: factors.avgRentUsd >= 1000 ? 100 : factors.avgRentUsd >= 500 ? 65 : 35,
      points: factors.avgRentUsd >= 1000 ? "+50" : factors.avgRentUsd >= 500 ? "+30" : "+10"
    },
    {
      name: "Tenure Bonus",
      detail: "+50 for 12+ months",
      progress: Math.min(100, Math.round((factors.tenureMonths / 12) * 100)),
      points: factors.tenureMonths >= 12 ? "+50" : factors.tenureMonths >= 6 ? "+25" : "+0"
    },
    {
      name: "Late Payment Penalty",
      detail: "-15 per late",
      progress: Math.min(100, factors.latePayments * 15),
      points: `-${factors.latePayments * 15}`,
      penalty: true
    }
  ];

  const milestoneItems = [
    `Keep ${Math.max(1, Math.ceil((rentScore?.pointsToNextTier || 0) / 30))} more on-time payments to reach the next tier.`,
    `Current average rent tracked: $${Math.round(factors.avgRentUsd || 0)}.`,
    "Avoid late payments to protect your current tier."
  ];

  const handleDownloadScoreReport = () => {
    const generatedAt = new Date();
    const report = buildScoreReportData({
      accountId,
      score,
      pointsToNextTier: rentScore?.pointsToNextTier || 0,
      payments,
      factors,
      generatedAt
    });
    const blob = buildScoreReportBlob(report);
    const url = window.URL.createObjectURL(blob);
    const stamp = generatedAt.toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rentledger-score-report-${stamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="rentscore-page">
      <section className="rentscore-grid">
        <article className="panel-card rentscore-hero">
          <h3>Current RentScore</h3>
          <div className="rentscore-hero-body">
            <div className="rentscore-gauge-column">
              <div className="score-gauge-large">
                <svg viewBox="0 0 220 220" aria-hidden="true">
                  <circle
                    cx="110"
                    cy="110"
                    r="86"
                    className="gauge-track dashboard-gauge-track"
                    pathLength="100"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r="86"
                    className="gauge-progress dashboard-gauge-progress"
                    pathLength="100"
                    style={{ "--score-progress": gaugeProgress }}
                  />
                </svg>
                <div className="gauge-center">
                  <strong>{score}</strong>
                </div>
              </div>
              <span className={`tier-tag ${tierClass(score)} rentscore-tier-under-gauge`}>{tierLabel(score)}</span>
            </div>
            <div className="rentscore-summary">
              <p>
                You are {rentScore?.pointsToNextTier || 0} points away from the next
                tier. Keep monthly rent on time to accelerate eligibility.
              </p>
              <div className="hero-actions">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => navigate("/dashboard/pay-rent")}
                >
                  Improve My Score
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleDownloadScoreReport}
                >
                  Download Score Report
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="panel-card rentscore-trend-card">
          <div className="panel-header">
            <h3>Score Trend (Recent Records)</h3>
          </div>
          <div className="trend-chart">
            {trend.map((point, index) => (
              <div className="trend-col" key={`${point.month}-${point.score}`}>
                <div className="trend-bar-wrap">
                  <i
                    className="trend-bar"
                    style={{
                      height: `${
                        index === 0
                          ? Math.max(12, Math.round(Math.max(14, Math.round((point.score / 850) * 180)) * 0.5))
                          : Math.max(14, Math.round((point.score / 850) * 180))
                      }px`
                    }}
                  ></i>
                </div>
                <strong>{point.score}</strong>
                <span>{point.month}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-columns rentscore-lower-grid">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Score Factors</h3>
          </div>
          <ul className="factor-breakdown-list">
            {factorItems.map((factor) => (
              <li key={factor.name}>
                <div className="factor-head">
                  <div>
                    <p>{factor.name}</p>
                    <span>{factor.detail}</span>
                  </div>
                  <strong className={factor.penalty ? "negative" : "positive"}>{factor.points}</strong>
                </div>
                <div className={`bar${factor.penalty ? " penalty" : ""}`}>
                  <i style={{ width: `${factor.progress}%` }}></i>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Recommended Next Steps</h3>
          </div>
          <ul className="milestone-list">
            {milestoneItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
