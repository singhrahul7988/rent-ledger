import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD"
  });
}

function nextDueDateLabel(dueDay) {
  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth(), dueDay || 5);
  if (due < now) {
    due.setMonth(due.getMonth() + 1);
  }
  return due.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function PayRentPage() {
  const { leases, payments, paying, submitRentPayment } = useOutletContext();
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [notes, setNotes] = useState("Monthly rent payment.");
  const [resultMessage, setResultMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (leases.length > 0 && !selectedLeaseId) {
      setSelectedLeaseId(leases[0].leaseId);
    }
  }, [leases, selectedLeaseId]);

  const selectedLease = useMemo(
    () => leases.find((lease) => lease.leaseId === selectedLeaseId) || null,
    [leases, selectedLeaseId]
  );

  const processingFee = 4.5;
  const total = (selectedLease?.monthlyRentUsd || 0) + processingFee;
  const dueDate = selectedLease ? nextDueDateLabel(selectedLease.dueDay) : "--";

  const handleSubmit = async () => {
    if (!selectedLease) return;
    setError("");
    setResultMessage("");

    try {
      const dueDateIso = new Date().toISOString().slice(0, 10);
      const result = await submitRentPayment({
        leaseId: selectedLease.leaseId,
        amountUsd: selectedLease.monthlyRentUsd,
        processingFeeUsd: processingFee,
        dueDate: dueDateIso,
        notes
      });

      setResultMessage(
        `Payment recorded. Certificate ${result.certificateTokenId} issued. New score: ${result.newScore}.`
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to record payment.");
    }
  };

  return (
    <>
      <section className="pay-banner">
        <p>
          Next payment due on <strong>{dueDate}</strong>. Complete payment
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
              <select value={selectedLeaseId} onChange={(event) => setSelectedLeaseId(event.target.value)}>
                {leases.map((lease) => (
                  <option key={lease.leaseId} value={lease.leaseId}>
                    {lease.leaseId} - Due day {lease.dueDay}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Landlord
              <input type="text" defaultValue={selectedLease?.landlordName || "--"} readOnly />
            </label>
            <label>
              Rent Amount (USD)
              <input type="text" value={formatUsd(selectedLease?.monthlyRentUsd || 0)} readOnly />
            </label>
            <label>
              Processing Fee (USD)
              <input type="text" value={formatUsd(processingFee)} readOnly />
            </label>
            <label className="full">
              Notes for this payment
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                aria-label="Payment notes"
              ></textarea>
            </label>
          </div>

          <div className="hero-actions">
            <button className="btn btn-primary" type="button" disabled={paying || !selectedLease} onClick={handleSubmit}>
              {paying ? "Recording..." : `Record Payment ${formatUsd(total)}`}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setNotes("Monthly rent payment.")}>
              Reset Notes
            </button>
          </div>
          {resultMessage ? <p className="action-success">{resultMessage}</p> : null}
          {error ? <p className="action-error">{error}</p> : null}
        </article>

        <aside className="panel-card pay-summary-card">
          <h3>Payment Summary</h3>
          <div className="summary-rows">
            <p>
              <span>Monthly Rent</span>
              <strong>{formatUsd(selectedLease?.monthlyRentUsd || 0)}</strong>
            </p>
            <p>
              <span>Processing Fee</span>
              <strong>{formatUsd(processingFee)}</strong>
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
          {payments.length > 0 ? (
            payments.slice(0, 4).map((record) => (
              <div className="certificate-item" key={record.paymentRecordId}>
                <div className="certificate-top">
                  <span className="chain-mini" aria-hidden="true">
                    #
                  </span>
                  <span className={`status-tag ${record.status === "ON_TIME" ? "on-time" : "late"}`}>
                    {record.status === "ON_TIME" ? "ON TIME" : "LATE"}
                  </span>
                </div>
                <p>{record.month}</p>
                <strong>{formatUsd(record.amountUsd)}</strong>
                <span className="tx-line">ref {record.txHash}</span>
              </div>
            ))
          ) : (
            <p className="panel-copy">No certificates yet. Complete your first rent payment above.</p>
          )}
        </div>
      </section>
    </>
  );
}
