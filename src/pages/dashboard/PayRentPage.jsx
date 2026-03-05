import { Link } from "react-router-dom";
import { activeLease, paymentCertificates } from "../../data/dashboardData";

function formatUsd(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function PayRentPage() {
  const total = activeLease.monthlyRent + activeLease.processingFee;

  return (
    <>
      <section className="pay-banner">
        <p>
          Next payment due on <strong>{activeLease.dueDate}</strong>. Complete payment
          through the automated payment system to keep your streak active.
        </p>
      </section>

      <section className="pay-grid">
        <article className="panel-card pay-form-card">
          <div className="panel-header">
            <h3>Rent Payment Details</h3>
          </div>

          <div className="form-grid">
            <label>
              Lease
              <select defaultValue={activeLease.id}>
                <option value={activeLease.id}>{activeLease.propertyLabel}</option>
              </select>
            </label>
            <label>
              Landlord
              <input type="text" defaultValue={activeLease.landlord} readOnly />
            </label>
            <label>
              Rent Amount (USD)
              <input type="text" defaultValue={formatUsd(activeLease.monthlyRent)} readOnly />
            </label>
            <label>
              Processing Fee (USD)
              <input type="text" defaultValue={formatUsd(activeLease.processingFee)} readOnly />
            </label>
            <label className="full">
              Notes for this payment
              <textarea
                defaultValue="March payment for Unit 12B."
                rows={4}
                aria-label="Payment notes"
              ></textarea>
            </label>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Record Payment {formatUsd(total)}
            </button>
            <button className="btn btn-secondary" type="button">
              Save for Later
            </button>
          </div>
        </article>

        <aside className="panel-card pay-summary-card">
          <h3>Payment Summary</h3>
          <div className="summary-rows">
            <p>
              <span>Monthly Rent</span>
              <strong>{formatUsd(activeLease.monthlyRent)}</strong>
            </p>
            <p>
              <span>Processing Fee</span>
              <strong>{formatUsd(activeLease.processingFee)}</strong>
            </p>
            <p className="total">
              <span>Total</span>
              <strong>{formatUsd(total)}</strong>
            </p>
          </div>

          <div className="status-tag on-time">ON TIME ELIGIBLE</div>
          <p className="summary-note">
            A Payment Certificate will be issued after confirmation. Your expected
            RentScore increase is <strong>+18</strong>.
          </p>

          <Link to="/dashboard/payment-history" className="btn btn-ghost btn-link small full-width">
            View Previous Payments
          </Link>
        </aside>
      </section>

      <section className="table-card">
        <div className="panel-header">
          <h3>Recent Payment Certificates</h3>
          <Link to="/dashboard/payment-history" className="btn btn-ghost small btn-link">
            Open Full History
          </Link>
        </div>
        <div className="certificate-grid">
          {paymentCertificates.slice(0, 4).map((record) => (
            <div className="certificate-item" key={record.certificateId}>
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
      </section>
    </>
  );
}
