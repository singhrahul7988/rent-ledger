const reliabilityMetrics = [
  { label: "On-Time Payment Ratio", value: "93%" },
  { label: "Average Monthly Rent", value: "$1,833" },
  { label: "Longest On-Time Streak", value: "5 months" },
  { label: "Verified Payment Records", value: "14" }
];

const reportTimeline = [
  { title: "First Verified Payment", value: "April 2025" },
  { title: "Reached Credit Builder", value: "October 2025" },
  { title: "Reached Credit Established", value: "March 2026" }
];

export default function CreditReportPage() {
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
              <strong className="report-score">612</strong>
              <span className="tier-tag established">Credit Established</span>
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
            {reportTimeline.map((step) => (
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
