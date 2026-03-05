import { activeLoan, loanTiers, repaymentSchedule } from "../../data/dashboardData";

function lockIconForStatus(status) {
  if (status === "ELIGIBLE" || status === "ACTIVE") return "UNLOCKED";
  return "LOCKED";
}

export default function LoansPage() {
  return (
    <>
      <section className="table-card">
        <div className="panel-header">
          <h3>Loan Tiers</h3>
          <button className="btn btn-ghost small" type="button">
            Compare Terms
          </button>
        </div>
        <div className="loan-tier-grid">
          {loanTiers.map((tier) => (
            <article className={`loan-tier-card ${tier.className}`} key={tier.tier}>
              <div className="loan-tier-head">
                <span className={`status-tag ${tier.status.toLowerCase()}`}>{tier.status}</span>
                <span className="tier-lock-text">{lockIconForStatus(tier.status)}</span>
              </div>
              <h4>{tier.tier}</h4>
              <p>
                {tier.limit} - {tier.apr} APR
              </p>
              <small>Unlocks at score {tier.unlockScore}</small>
              {tier.pointsLeft ? <em>{tier.pointsLeft} points needed to unlock</em> : null}
              <button
                className={`btn ${tier.status === "LOCKED" ? "btn-secondary" : "btn-primary"} small full-width`}
                type="button"
                disabled={tier.status === "LOCKED"}
              >
                {tier.status === "ACTIVE" ? "Manage Loan" : "Request Loan"}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Active Loan Summary</h3>
            <span className="status-tag active">{activeLoan.status}</span>
          </div>
          <div className="summary-rows">
            <p>
              <span>Loan ID</span>
              <strong>{activeLoan.loanId}</strong>
            </p>
            <p>
              <span>Principal</span>
              <strong>{activeLoan.principal}</strong>
            </p>
            <p>
              <span>APR</span>
              <strong>{activeLoan.apr}</strong>
            </p>
            <p>
              <span>Next Due Date</span>
              <strong>{activeLoan.nextDueDate}</strong>
            </p>
            <p className="total">
              <span>Installment Amount</span>
              <strong>{activeLoan.installment}</strong>
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Repay Installment
            </button>
            <button className="btn btn-secondary" type="button">
              View Loan Terms
            </button>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>APR Comparison</h3>
          </div>
          <div className="apr-comparison">
            <div>
              <p>RentLedger Tier 3</p>
              <strong>12% APR</strong>
            </div>
            <div>
              <p>Traditional unsecured loan</p>
              <strong>22% APR</strong>
            </div>
            <div>
              <p>Informal lender range</p>
              <strong className="bad-apr">36-120% APR</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Repayment Schedule</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Installment</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {repaymentSchedule.map((item) => (
              <tr key={item.installment}>
                <td>{item.installment}</td>
                <td>{item.dueDate}</td>
                <td>{item.amount}</td>
                <td>
                  <span className={`status-tag ${item.status === "DUE" ? "eligible" : "locked"}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
