import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function scoreToTier(score) {
  if (score >= 700) return { label: "Credit Trusted", css: "trusted" };
  if (score >= 600) return { label: "Credit Established", css: "established" };
  if (score >= 450) return { label: "Credit Builder", css: "builder" };
  if (score >= 300) return { label: "Credit Starter", css: "starter" };
  return { label: "Building Credit", css: "building" };
}

function scoreToLoanTier(score) {
  if (score >= 700) return { tier: "Tier 4", max: "$20,000", apr: "10%" };
  if (score >= 600) return { tier: "Tier 3", max: "$15,000", apr: "12%" };
  if (score >= 450) return { tier: "Tier 2", max: "$10,000", apr: "15%" };
  if (score >= 300) return { tier: "Tier 1", max: "$5,000", apr: "18%" };
  return { tier: "Locked", max: "$0", apr: "-" };
}

function paymentStatusText(status) {
  return status === "ON_TIME" ? "ON TIME" : "LATE";
}

function txStatusTone(status) {
  if (status === "SUCCESS") return "success";
  if (status === "PENDING") return "eligible";
  return "locked";
}

function txLabel(eventType) {
  return eventType
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function shortHash(hash) {
  const value = String(hash || "");
  if (!value) return "--";
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

export default function DashboardOverviewPage() {
  const { loading, rentScore, payments, transactions } = useOutletContext();
  const [copiedHash, setCopiedHash] = useState("");

  const score = rentScore?.score || 150;
  const tier = scoreToTier(score);
  const gaugeProgress = Number(((score / 850) * 75).toFixed(2));
  const onTimePayments = payments.filter((payment) => payment.status === "ON_TIME").length;
  const totalRentUsd = payments.reduce((sum, payment) => sum + payment.amountUsd, 0);
  const loanTier = scoreToLoanTier(score);

  const recentPayments = payments.slice(0, 4);
  const recentTransactions = transactions.slice(0, 6);

  const copyTxHash = async (hash) => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      window.setTimeout(() => setCopiedHash(""), 1400);
    } catch (_error) {
      setCopiedHash("");
    }
  };

  return (
    <>
      <section className="dashboard-hero-card">
        <div className="dashboard-hero-left">
          <h2>Your RentScore</h2>
          <p>
            {loading
              ? "Loading your latest payment and score activity..."
              : (
                <>
                  Current score: {score}. Keep on-time payments flowing
                  <br />
                  to move into the next tier faster.
                </>
              )}
          </p>
          <div className="hero-actions">
            <Link to="/dashboard/pay-rent" className="btn btn-primary btn-link">
              Pay Rent
            </Link>
            <Link to="/dashboard/credit-report" className="btn btn-secondary btn-link">
              View Credit Report
            </Link>
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
                style={{ "--score-progress": gaugeProgress }}
              />
            </svg>
            <div className="gauge-center">
              <strong>{score}</strong>
              <span>RentScore</span>
            </div>
          </div>
          <span className={`tier-tag ${tier.css}`}>{tier.label}</span>
        </div>
      </section>

      <section className="dashboard-stats">
        <article className="metric-card">
          <p>On-Time Payments</p>
          <strong>{onTimePayments}</strong>
          <span className="metric-trend positive">{payments.length} total payments</span>
        </article>
        <article className="metric-card">
          <p>Total Rent Recorded</p>
          <strong>{formatUsd(totalRentUsd)}</strong>
          <span className="metric-trend neutral">Across {payments.length || 0} records</span>
        </article>
        <article className="metric-card">
          <p>Loan Eligibility</p>
          <strong>{loanTier.tier}</strong>
          <span className="metric-trend positive">
            {loanTier.max} at {loanTier.apr} APR
          </span>
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
            {recentPayments.length > 0 ? (
              recentPayments.map((record) => (
                <div className="certificate-item" key={record.paymentRecordId}>
                  <p>{record.month}</p>
                  <div className="certificate-meta-row">
                    <strong>{formatUsd(record.amountUsd)}</strong>
                    <span
                      className={`status-tag ${record.status === "ON_TIME" ? "on-time" : "late"}`}
                    >
                      {paymentStatusText(record.status)}
                    </span>
                  </div>
                  <div className="certificate-tx-row">
                    <span className="tx-line" title={record.txHash}>
                      ref {shortHash(record.txHash)}
                    </span>
                    <button
                      className="btn btn-ghost tiny"
                      type="button"
                      onClick={() => copyTxHash(record.txHash)}
                    >
                      {copiedHash === record.txHash ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="panel-copy">No certificates yet. Record your first rent payment to mint one.</p>
            )}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Loan Progress</h3>
          </div>

          <div className="progress-list loan-progress-scroll">
            <div className="progress-row">
              <div>
                <p>Tier 1 Starter</p>
                <small>Unlock score: 300</small>
              </div>
              <span className={`status-tag ${score >= 300 ? "eligible" : "locked"}`}>
                {score >= 300 ? "ELIGIBLE" : "LOCKED"}
              </span>
            </div>

            <div className="progress-row">
              <div>
                <p>Tier 2 Builder</p>
                <small>Unlock score: 450</small>
              </div>
              <span className={`status-tag ${score >= 450 ? "eligible" : "locked"}`}>
                {score >= 450 ? "ELIGIBLE" : "LOCKED"}
              </span>
            </div>

            <div className="progress-row">
              <div>
                <p>Tier 3 Established</p>
                <small>Unlock score: 600</small>
              </div>
              <span className={`status-tag ${score >= 600 ? "active" : "locked"}`}>
                {score >= 600 ? "ACTIVE" : "LOCKED"}
              </span>
            </div>

            <div className="progress-row">
              <div>
                <p>Tier 4 Trusted</p>
                <small>Unlock score: 700</small>
              </div>
              <span className={`status-tag ${score >= 700 ? "active" : "locked"}`}>
                {score >= 700 ? "UNLOCKED" : "LOCKED"}
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Recent Transactions</h3>
          <Link to="/dashboard/transactions" className="btn btn-ghost small btn-link">
            View All
          </Link>
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
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <tr key={tx.eventId}>
                  <td>{txLabel(tx.eventType)}</td>
                  <td>{new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td>
                    <span className={`status-tag ${txStatusTone(tx.status)}`}>{tx.status}</span>
                  </td>
                  <td className="mono">{tx.txHash}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No transaction activity yet. Complete your first payment to see entries.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}
