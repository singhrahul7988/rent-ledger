import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

const tiers = [
  { id: 1, tier: "Tier 1 Starter", limit: 10000, apr: 18, unlockScore: 300, className: "tier-1" },
  { id: 2, tier: "Tier 2 Builder", limit: 30000, apr: 15, unlockScore: 450, className: "tier-2" },
  { id: 3, tier: "Tier 3 Established", limit: 75000, apr: 12, unlockScore: 600, className: "tier-3" },
  { id: 4, tier: "Tier 4 Trusted", limit: 150000, apr: 10, unlockScore: 700, className: "tier-4" }
];

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function addMonths(dateInput, months) {
  const date = new Date(dateInput);
  date.setMonth(date.getMonth() + months);
  return date;
}

export default function LoansPage() {
  const {
    rentScore,
    loans,
    requestingLoan,
    requestLoanAction,
    checkLoanEligibility
  } = useOutletContext();
  const [loanMessage, setLoanMessage] = useState("");
  const [loanError, setLoanError] = useState("");

  const score = rentScore?.score || 150;
  const activeLoan = loans[0] || null;

  const displayedTiers = useMemo(
    () =>
      tiers.map((tier) => {
        let status = score >= tier.unlockScore ? "ELIGIBLE" : "LOCKED";
        if (activeLoan && Number(activeLoan.tier) === tier.id && activeLoan.status === "ACTIVE") {
          status = "ACTIVE";
        }
        const pointsLeft = status === "LOCKED" ? tier.unlockScore - score : 0;
        return {
          ...tier,
          status,
          pointsLeft
        };
      }),
    [score, activeLoan]
  );

  const repaymentSchedule = useMemo(() => {
    if (!activeLoan) return [];
    return Array.from({ length: 6 }).map((_, index) => ({
      installment: `${index + 1}`,
      dueDate: addMonths(activeLoan.nextInstallmentDate, index).toLocaleDateString("en-US"),
      amount: formatUsd(Math.ceil(activeLoan.principalUsd / 6)),
      status: index === 0 ? "DUE" : "LOCKED"
    }));
  }, [activeLoan]);

  const handleRequestLoan = async (tier) => {
    setLoanError("");
    setLoanMessage("");

    try {
      const eligibility = await checkLoanEligibility(tier.id);
      if (!eligibility.eligible) {
        setLoanError(`Not eligible for ${tier.tier} yet. Score required: ${tier.unlockScore}.`);
        return;
      }

      const requestedAmount = Math.min(tier.limit, 2200);
      const response = await requestLoanAction({
        tier: tier.id,
        amountUsd: requestedAmount
      });
      setLoanMessage(
        `Loan ${response.loanId} requested successfully. Next installment due ${new Date(
          response.nextInstallmentDate
        ).toLocaleDateString("en-US")}.`
      );
    } catch (error) {
      setLoanError(error instanceof Error ? error.message : "Unable to request loan.");
    }
  };

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
          {displayedTiers.map((tier) => (
            <article className={`loan-tier-card ${tier.className}`} key={tier.tier}>
              <div className="loan-tier-head">
                <span className={`status-tag ${tier.status.toLowerCase()}`}>{tier.status}</span>
                <span className="tier-lock-text">{tier.status === "LOCKED" ? "LOCKED" : "UNLOCKED"}</span>
              </div>
              <h4>{tier.tier}</h4>
              <p>
                {formatUsd(tier.limit)} - {tier.apr}% APR
              </p>
              <small>Unlocks at score {tier.unlockScore}</small>
              {tier.pointsLeft ? <em>{tier.pointsLeft} points needed to unlock</em> : null}
              <button
                className={`btn ${tier.status === "LOCKED" ? "btn-secondary" : "btn-primary"} small full-width`}
                type="button"
                disabled={tier.status === "LOCKED" || requestingLoan}
                onClick={() => handleRequestLoan(tier)}
              >
                {requestingLoan ? "Submitting..." : tier.status === "ACTIVE" ? "Manage Loan" : "Request Loan"}
              </button>
            </article>
          ))}
        </div>
        {loanMessage ? <p className="action-success">{loanMessage}</p> : null}
        {loanError ? <p className="action-error">{loanError}</p> : null}
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Active Loan Summary</h3>
            <span className={`status-tag ${activeLoan ? "active" : "locked"}`}>
              {activeLoan ? activeLoan.status : "NO ACTIVE LOAN"}
            </span>
          </div>
          <div className="summary-rows">
            <p>
              <span>Loan ID</span>
              <strong>{activeLoan ? activeLoan.loanId : "--"}</strong>
            </p>
            <p>
              <span>Principal</span>
              <strong>{activeLoan ? formatUsd(activeLoan.principalUsd) : "--"}</strong>
            </p>
            <p>
              <span>APR</span>
              <strong>{activeLoan ? `${activeLoan.apr}%` : "--"}</strong>
            </p>
            <p>
              <span>Next Due Date</span>
              <strong>
                {activeLoan ? new Date(activeLoan.nextInstallmentDate).toLocaleDateString("en-US") : "--"}
              </strong>
            </p>
            <p className="total">
              <span>Installment Amount</span>
              <strong>
                {activeLoan ? formatUsd(Math.ceil(activeLoan.principalUsd / 6)) : "--"}
              </strong>
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" disabled={!activeLoan}>
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
              <p>RentLedger best current tier</p>
              <strong>{score >= 700 ? "10% APR" : score >= 600 ? "12% APR" : score >= 450 ? "15% APR" : "18% APR"}</strong>
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
            {repaymentSchedule.length === 0 ? (
              <tr>
                <td colSpan={4}>No active loan yet. Request an eligible tier to generate schedule.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </>
  );
}
