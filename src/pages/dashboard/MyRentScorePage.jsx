const scoreFactors = [
  { name: "Payment Count", detail: "+30 per payment", progress: 84, points: "+360" },
  {
    name: "Consistency Bonus",
    detail: "+50 for 6 months streak",
    progress: 70,
    points: "+50"
  },
  {
    name: "Rental Amount Tier",
    detail: "+50 for $1,000+/month",
    progress: 76,
    points: "+50"
  },
  { name: "Tenure Bonus", detail: "+50 for 12+ months", progress: 58, points: "+50" },
  { name: "Late Payment Penalty", detail: "-15 per late", progress: 18, points: "-15", penalty: true }
];

const history = [
  { month: "Apr 2025", score: 150 },
  { month: "Jul 2025", score: 300 },
  { month: "Oct 2025", score: 442 },
  { month: "Jan 2026", score: 487 },
  { month: "Mar 2026", score: 612 }
];

const milestones = [
  "Keep 3 more on-time payments to add 90 points.",
  "Maintain your current lease until June 2026 for an additional tenure bonus.",
  "Avoid late payments to protect your current tier."
];

export default function MyRentScorePage() {
  return (
    <>
      <section className="rentscore-grid">
        <article className="panel-card rentscore-hero">
          <h3>Current RentScore</h3>
          <div className="rentscore-hero-body">
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
                  style={{ "--score-progress": 53.99 }}
                />
              </svg>
              <div className="gauge-center">
                <strong>612</strong>
                <span>RentScore</span>
              </div>
            </div>
            <div className="rentscore-summary">
              <span className="tier-tag established">Credit Established</span>
              <p>
                You are 88 points away from <strong>Credit Trusted</strong>. Your
                profile now qualifies for Tier 3 loan offers.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" type="button">
                  Improve My Score
                </button>
                <button className="btn btn-secondary" type="button">
                  Download Score Report
                </button>
              </div>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Score Trend (Last 12 Months)</h3>
          </div>
          <div className="trend-chart">
            {history.map((point) => (
              <div className="trend-col" key={point.month}>
                <div className="trend-bar-wrap">
                  <i
                    className="trend-bar"
                    style={{ height: `${Math.max(14, Math.round((point.score / 850) * 180))}px` }}
                  ></i>
                </div>
                <strong>{point.score}</strong>
                <span>{point.month}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Score Factors</h3>
          </div>
          <ul className="factor-breakdown-list">
            {scoreFactors.map((factor) => (
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
            {milestones.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
