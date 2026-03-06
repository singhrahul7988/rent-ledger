import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";

const DRAFT_STORAGE_PREFIX = "rentledger.payrent.draft";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseCurrencyInput(value) {
  const normalized = String(value || "")
    .replace(/,/g, "")
    .replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
}

function toWholeDollarInput(value) {
  const wholeDollars = Math.round(parseCurrencyInput(value));
  return `${wholeDollars}.00`;
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
}

function formatLeaseOption(lease) {
  if (!lease) return "--";
  return `${lease.leaseId} - Due day ${lease.dueDay}`;
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
  const { accountId, leases, payments, paying, submitRentPayment } = useOutletContext();
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [leaseName, setLeaseName] = useState("");
  const [landlordName, setLandlordName] = useState("");
  const [landlordAccountAddress, setLandlordAccountAddress] = useState("");
  const [rentAmountInput, setRentAmountInput] = useState("");
  const [notes, setNotes] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [error, setError] = useState("");
  const [draftReady, setDraftReady] = useState(false);
  const [hasInitialisedDefaults, setHasInitialisedDefaults] = useState(false);

  const draftStorageKey = useMemo(
    () => `${DRAFT_STORAGE_PREFIX}.${accountId || "guest"}`,
    [accountId]
  );

  useEffect(() => {
    setDraftReady(false);
    let hasStoredDraft = false;

    try {
      const stored = window.sessionStorage.getItem(draftStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSelectedLeaseId(typeof parsed.selectedLeaseId === "string" ? parsed.selectedLeaseId : "");
        setLeaseName(typeof parsed.leaseName === "string" ? parsed.leaseName : "");
        setLandlordName(typeof parsed.landlordName === "string" ? parsed.landlordName : "");
        setLandlordAccountAddress(typeof parsed.landlordAccountAddress === "string" ? parsed.landlordAccountAddress : "");
        setRentAmountInput(typeof parsed.rentAmountInput === "string" ? parsed.rentAmountInput : "");
        setNotes(typeof parsed.notes === "string" ? parsed.notes : "");
        hasStoredDraft = true;
      } else {
        setSelectedLeaseId("");
        setLeaseName("");
        setLandlordName("");
        setLandlordAccountAddress("");
        setRentAmountInput("");
        setNotes("");
      }
    } catch (_error) {
      setSelectedLeaseId("");
      setLeaseName("");
      setLandlordName("");
      setLandlordAccountAddress("");
      setRentAmountInput("");
      setNotes("");
    }

    setHasInitialisedDefaults(hasStoredDraft);
    setDraftReady(true);
  }, [draftStorageKey]);

  useEffect(() => {
    if (!draftReady) return;
    if (leases.length > 0 && !selectedLeaseId) {
      setSelectedLeaseId(leases[0].leaseId);
    }
  }, [draftReady, leases, selectedLeaseId]);

  const selectedLease = useMemo(
    () => leases.find((lease) => lease.leaseId === selectedLeaseId) || null,
    [leases, selectedLeaseId]
  );

  useEffect(() => {
    if (!draftReady || hasInitialisedDefaults || !selectedLease) {
      return;
    }

    setLeaseName(formatLeaseOption(selectedLease));
    setLandlordName(selectedLease.landlordName || "");
    setLandlordAccountAddress(selectedLease.landlordAccountAddress || "");
    setRentAmountInput(toWholeDollarInput(selectedLease.monthlyRentUsd));
    setNotes("Monthly rent payment.");
    setHasInitialisedDefaults(true);
  }, [draftReady, hasInitialisedDefaults, selectedLease]);

  useEffect(() => {
    if (!draftReady) return;

    const draftPayload = {
      selectedLeaseId,
      leaseName,
      landlordName,
      landlordAccountAddress,
      rentAmountInput,
      notes
    };

    try {
      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
    } catch (_error) {
      // Ignore storage failures and keep local state functional.
    }
  }, [
    draftReady,
    draftStorageKey,
    selectedLeaseId,
    leaseName,
    landlordName,
    landlordAccountAddress,
    rentAmountInput,
    notes
  ]);

  const rentAmountUsd = useMemo(
    () => Math.round(parseCurrencyInput(rentAmountInput)),
    [rentAmountInput]
  );
  const processingFee = 4.5;
  const total = Number((rentAmountUsd + processingFee).toFixed(2));
  const dueDate = selectedLease ? nextDueDateLabel(selectedLease.dueDay) : "--";
  const isOnTimeEligible = new Date().getDate() <= Number(selectedLease?.dueDay || 31);
  const scoreDelta = isOnTimeEligible ? 18 : 6;

  const handleAmountInputChange = (event) => {
    const next = event.target.value.replace(/,/g, "");
    if (next === "" || /^\d+(\.\d{0,2})?$/.test(next)) {
      setRentAmountInput(next);
    }
  };

  const handleAmountBlur = () => {
    if (!String(rentAmountInput || "").trim()) {
      setRentAmountInput("");
      return;
    }
    setRentAmountInput(toWholeDollarInput(rentAmountInput));
  };

  const handleResetForm = () => {
    setLeaseName("");
    setLandlordName("");
    setLandlordAccountAddress("");
    setRentAmountInput("");
    setNotes("");
    setResultMessage("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!selectedLease) {
      setError("Select a lease before recording payment.");
      return;
    }
    if (!leaseName.trim()) {
      setError("Enter a lease name.");
      return;
    }
    if (!landlordName.trim()) {
      setError("Enter landlord name.");
      return;
    }
    if (!isAddress(landlordAccountAddress)) {
      setError("Enter a valid landlord wallet address (0x + 40 hex chars).");
      return;
    }
    if (rentAmountUsd <= 0) {
      setError("Enter a valid rent amount in x.00 format.");
      return;
    }

    setError("");
    setResultMessage("");

    try {
      const dueDateIso = new Date().toISOString().slice(0, 10);
      const result = await submitRentPayment({
        leaseId: selectedLease.leaseId,
        amountUsd: rentAmountUsd,
        processingFeeUsd: processingFee,
        dueDate: dueDateIso,
        leaseName,
        landlordName,
        landlordAccountAddress,
        notes: `${notes} Lease: ${leaseName}. Landlord: ${landlordName}. Address: ${landlordAccountAddress}.`
      });

      setResultMessage(
        `Payment of ${formatUsd(total)} recorded. Certificate ${result.certificateTokenId} issued. New score: ${result.newScore}.`
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
              Lease ID
              <select value={selectedLeaseId} onChange={(event) => setSelectedLeaseId(event.target.value)}>
                {leases.map((lease) => (
                  <option key={lease.leaseId} value={lease.leaseId}>
                    {formatLeaseOption(lease)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Lease Name
              <input
                type="text"
                value={leaseName}
                onChange={(event) => setLeaseName(event.target.value)}
                placeholder="Enter lease name"
              />
            </label>
            <label>
              Landlord
              <input
                type="text"
                value={landlordName}
                onChange={(event) => setLandlordName(event.target.value)}
                placeholder="Enter landlord name"
              />
            </label>
            <label>
              Landlord Wallet Address
              <input
                type="text"
                value={landlordAccountAddress}
                onChange={(event) => setLandlordAccountAddress(event.target.value)}
                placeholder="0x..."
              />
            </label>
            <label>
              Rent Amount (USD)
              <input
                type="text"
                inputMode="decimal"
                value={rentAmountInput}
                onChange={handleAmountInputChange}
                onBlur={handleAmountBlur}
                placeholder="0.00"
              />
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
            <button className="btn btn-secondary" type="button" onClick={handleResetForm}>
              Reset Form
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
              <strong>{formatUsd(rentAmountUsd)}</strong>
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

          <div className={`status-tag ${isOnTimeEligible ? "on-time" : "late"}`}>
            {isOnTimeEligible ? "ON TIME ELIGIBLE" : "LATE RISK"}
          </div>
          <p className="summary-note">
            A Payment Certificate will be issued after confirmation. Your expected
            RentScore increase is <strong>+{scoreDelta}</strong>.
          </p>

          <div className="summary-actions-box">
            <Link to="/dashboard/payment-history" className="btn btn-ghost btn-link small full-width">
              View Previous Payments
            </Link>
          </div>
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
