import { Link } from "react-router-dom";
import { paymentCertificates, transactions } from "../../data/dashboardData";

export default function DashboardOverviewPage() {
  return (
    <>
      <section className="dashboard-hero-card">
        <div className="dashboard-hero-left">
          <h2>Your RentScore</h2>
          <p>
            You moved into Credit Established after your latest on-time payment.
            Keep your streak to unlock Tier 4.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard/pay-rent" className="btn btn-primary btn-link">
              Pay Rent
            </Link>
            <button className="btn btn-secondary" type="button">
              View Credit Report
            </button>
          </div>
        </div>

        <div className="dashboard-score">
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
          <span className="tier-tag established">Credit Established</span>
        </div>
      </section>

      <section className="dashboard-stats">
        <article className="metric-card">
          <p>On-Time Payments</p>
          <strong>14</strong>
          <span className="metric-trend positive">+2 this quarter</span>
        </article>
        <article className="metric-card">
          <p>Total Rent Recorded</p>
          <strong>$24,700</strong>
          <span className="metric-trend neutral">Across 13 months</span>
        </article>
        <article className="metric-card">
          <p>Loan Eligibility</p>
          <strong>Tier 3</strong>
          <span className="metric-trend positive">Up to $75,000 at 12% APR</span>
        </article>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Recent Payment Certificates</h3>
            <Link to="/dashboard/payment-history" className="btn btn-ghost small btn-link">
              Payment History
            </Link>
          </div>

          <div className="certificate-grid">
            {paymentCertificates.slice(0, 4).map((record) => (
              <div className="certificate-item" key={`${record.month}-${record.hash}`}>
                <div className="certificate-top">
                  <span className="chain-mini" aria-hidden="true">
                    #
                  </span>
                  <span className={`status-tag ${record.status === "ON TIME" ? "on-time" : "late"}`}>
                    {record.status}
                  </span>
                </div>
                <p>{record.month}</p>
                <strong>{record.amount}</strong>
                <span className="tx-line">ref {record.hash}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Loan Progress</h3>
          </div>

          <div className="progress-list">
            <div className="progress-row">
              <div>
                <p>Tier 2 Builder</p>
                <small>Unlocked</small>
              </div>
              <span className="status-tag eligible">ELIGIBLE</span>
            </div>

            <div className="progress-row">
              <div>
                <p>Tier 3 Established</p>
                <small>Current maximum: $75,000</small>
              </div>
              <span className="status-tag active">ACTIVE</span>
            </div>

            <div className="progress-row">
              <div>
                <p>Tier 4 Trusted</p>
                <small>Need 88 points to unlock</small>
              </div>
              <span className="status-tag locked">LOCKED</span>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Recent Transactions</h3>
          <button className="btn btn-ghost small" type="button">
            View All
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Status</th>
              <th>Network Reference</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={`${tx.type}-${tx.ref}`}>
                <td>{tx.type}</td>
                <td>{tx.date}</td>
                <td>
                  <span className="status-tag active">{tx.status}</span>
                </td>
                <td className="mono">{tx.ref}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
