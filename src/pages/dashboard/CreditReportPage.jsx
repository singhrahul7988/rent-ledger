import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function scoreTier(score) {
  if (score >= 700) return "Credit Trusted";
  if (score >= 600) return "Credit Established";
  if (score >= 450) return "Credit Builder";
  if (score >= 300) return "Credit Starter";
  return "Building Credit";
}

function scoreTierClass(score) {
  if (score >= 700) return "trusted";
  if (score >= 600) return "established";
  if (score >= 450) return "builder";
  if (score >= 300) return "starter";
  return "building";
}

export default function CreditReportPage() {
  const { rentScore, payments } = useOutletContext();
  const score = rentScore?.score || 150;
  const onTimeCount = payments.filter((record) => record.status === "ON_TIME").length;
  const onTimeRatio = payments.length ? Math.round((onTimeCount / payments.length) * 100) : 0;
  const avgRent = payments.length
    ? Math.round(payments.reduce((sum, record) => sum + record.amountUsd, 0) / payments.length)
    : 0;

  const timeline = useMemo(() => {
    if (payments.length === 0) return [];
    const sorted = [...payments].sort(
      (a, b) => new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime()
    );
    const first = sorted[0];
    const recent = sorted[sorted.length - 1];
    return [
      { title: "First Verified Payment", value: first.month },
      { title: "Most Recent Certificate", value: recent.month },
      { title: "Current Tier", value: scoreTier(score) }
    ];
  }, [payments, score]);

  const reliabilityMetrics = [
    { label: "On-Time Payment Ratio", value: `${onTimeRatio}%` },
    { label: "Average Monthly Rent", value: formatUsd(avgRent) },
    { label: "Verified Payment Records", value: String(payments.length) },
    { label: "Current RentScore", value: String(score) }
  ];

  return (
    <>
      <section className="report-grid">
        <article className="panel-card report-summary">
          <div className="panel-header">
            <h3>Shareable Credit Report</h3>
          </div>
          <p className="panel-copy">
            This report summarizes verified rent behavior for landlord screening
            and lending qualification. Personal account address is masked by default.
          </p>

          <div className="report-score-row">
            <div>
              <p className="report-label">Current RentScore</p>
              <strong className="report-score">{score}</strong>
              <span className={`tier-tag ${scoreTierClass(score)}`}>{scoreTier(score)}</span>
            </div>
            <div className="report-actions">
              <button className="btn btn-primary" type="button">
                Generate Share Link
              </button>
              <button className="btn btn-secondary" type="button">
                Export PDF
              </button>
            </div>
          </div>
        </article>

        <article className="panel-card share-config">
          <div className="panel-header">
            <h3>Share Settings</h3>
          </div>
          <div className="form-grid report-form-grid">
            <label>
              Link Expiration
              <select defaultValue="7d">
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
              </select>
            </label>
            <label>
              Access Scope
              <select defaultValue="landlord">
                <option value="landlord">Landlord verification</option>
                <option value="lender">Lending review</option>
              </select>
            </label>
          </div>
          <p className="mono link-preview">https://rentledger.app/verify/sarah-chen-8h2x</p>
        </article>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Reliability Snapshot</h3>
          </div>
          <div className="reliability-grid">
            {reliabilityMetrics.map((metric) => (
              <div className="reliability-card" key={metric.label}>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Progress Timeline</h3>
          </div>
          <ul className="timeline-list">
            {timeline.map((step) => (
              <li key={step.title}>
                <span className="timeline-dot"></span>
                <div>
                  <p>{step.title}</p>
                  <small>{step.value}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
