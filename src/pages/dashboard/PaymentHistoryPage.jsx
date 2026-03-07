import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function explorerUrlFromHash(txHash) {
  if (!txHash || txHash.includes("...")) return "";
  return `https://creditcoin-testnet.blockscout.com/tx/${txHash}`;
}

function monthToYear(monthLabel) {
  const parsed = new Date(monthLabel);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : String(parsed.getFullYear());
}

function shortenIdentifier(value, leading = 8, trailing = 6) {
  if (!value) return "";
  if (value.length <= leading + trailing + 3) return value;
  return `${value.slice(0, leading)}...${value.slice(-trailing)}`;
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function longestOnTimeStreak(records) {
  const sorted = [...records].sort(
    (a, b) => new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime()
  );
  let longest = 0;
  let current = 0;

  sorted.forEach((record) => {
    if (record.status === "ON_TIME") {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  });

  return longest;
}

export default function PaymentHistoryPage() {
  const { accountId, payments } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [copiedHash, setCopiedHash] = useState("");
  const [certificateLink, setCertificateLink] = useState("");
  const [certificateMessage, setCertificateMessage] = useState("");
  const [selectedCertificateId, setSelectedCertificateId] = useState("");

  const years = useMemo(() => {
    const result = new Set(payments.map((payment) => monthToYear(payment.month)));
    return ["all", ...Array.from(result).sort((a, b) => Number(b) - Number(a))];
  }, [payments]);

  const filteredPayments = useMemo(
    () =>
      payments.filter((record) => {
        const statusMatch =
          statusFilter === "all" ||
          (statusFilter === "on-time" && record.status === "ON_TIME") ||
          (statusFilter === "late" && record.status === "LATE");
        const yearMatch = yearFilter === "all" || monthToYear(record.month) === yearFilter;
        return statusMatch && yearMatch;
      }),
    [payments, statusFilter, yearFilter]
  );
  const selectedCertificateRecord = useMemo(
    () =>
      payments.find((payment) => payment.paymentRecordId === selectedCertificateId) ||
      payments[0] ||
      null,
    [payments, selectedCertificateId]
  );

  useEffect(() => {
    if (!payments.length) {
      setSelectedCertificateId("");
      return;
    }
    if (!selectedCertificateId || !payments.some((payment) => payment.paymentRecordId === selectedCertificateId)) {
      setSelectedCertificateId(payments[0].paymentRecordId);
    }
  }, [payments, selectedCertificateId]);

  const onTimeCount = payments.filter((record) => record.status === "ON_TIME").length;
  const onTimeRatio = payments.length ? Math.round((onTimeCount / payments.length) * 100) : 0;
  const averageRent =
    payments.length > 0
      ? Math.round(payments.reduce((sum, record) => sum + record.amountUsd, 0) / payments.length)
      : 0;
  const longestStreak = longestOnTimeStreak(payments);

  const copyHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(""), 1800);
    } catch (_error) {
      setCopiedHash("");
    }
  };

  const copyCertificateLink = async () => {
    if (!certificateLink) return;
    try {
      await navigator.clipboard.writeText(certificateLink);
      setCertificateMessage("Certificate link copied.");
      window.setTimeout(() => setCertificateMessage(""), 1500);
    } catch (_error) {
      setCertificateMessage("Unable to copy certificate link.");
      window.setTimeout(() => setCertificateMessage(""), 1500);
    }
  };

  const handleGenerateCertificateLink = () => {
    if (!selectedCertificateRecord) {
      setCertificateMessage("No payment records available to generate certificate.");
      window.setTimeout(() => setCertificateMessage(""), 1800);
      return;
    }

    const record = selectedCertificateRecord;
    const appBaseUrl = (import.meta.env.VITE_APP_BASE_URL || window.location.origin).replace(/\/$/, "");
    const nextLink = `${appBaseUrl}/certificate/${encodeURIComponent(record.paymentRecordId)}?accountId=${encodeURIComponent(
      accountId || "acc_01HQP7S1A9"
    )}`;
    setCertificateLink(nextLink);
    setCertificateMessage(
      `Certificate link generated for ${shortenIdentifier(record.paymentRecordId.toUpperCase(), 10, 8)}.`
    );
    window.setTimeout(() => setCertificateMessage(""), 1500);
  };

  const handleExportCsv = () => {
    if (!filteredPayments.length) return;

    const header = [
      "Month",
      "Amount (USD)",
      "Status",
      "Payment Method",
      "Date (ISO)",
      "Certificate ID",
      "Transaction Hash",
      "Explorer URL"
    ];

    const rows = filteredPayments.map((record) => {
      const isoDate = new Date(record.confirmedAt).toISOString().slice(0, 10);
      return [
        record.month,
        Number(record.amountUsd || 0).toFixed(2),
        record.status === "ON_TIME" ? "ON TIME" : "LATE",
        "Automated Transfer",
        isoDate,
        record.paymentRecordId.toUpperCase(),
        record.txHash,
        explorerUrlFromHash(record.txHash)
      ];
    });

    const csvContent = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
    const today = new Date().toISOString().slice(0, 10);
    const fileName = `rentledger_payment_history_${today}.csv`;

    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <>
      <section className="table-card payment-history-table-card">
        <div className="panel-header">
          <h3>Payment History</h3>
          <div className="table-actions">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All Status</option>
              <option value="on-time">On Time</option>
              <option value="late">Late</option>
            </select>
            <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "All Years" : year}
                </option>
              ))}
            </select>
            <button
              className="btn btn-secondary payment-history-export-btn"
              type="button"
              onClick={handleExportCsv}
              disabled={!filteredPayments.length}
            >
              Export CSV
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Certificate</th>
              <th>Payment Method</th>
              <th>Date</th>
              <th>Network Reference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((record) => {
                const explorerUrl = explorerUrlFromHash(record.txHash);
                return (
                  <tr key={record.paymentRecordId}>
                    <td>{record.month}</td>
                    <td>{formatUsd(record.amountUsd)}</td>
                    <td>
                      <span className={`status-tag ${record.status === "ON_TIME" ? "on-time" : "late"}`}>
                        {record.status === "ON_TIME" ? "ON TIME" : "LATE"}
                      </span>
                    </td>
                    <td title={record.paymentRecordId.toUpperCase()}>
                      {shortenIdentifier(record.paymentRecordId.toUpperCase(), 10, 8)}
                    </td>
                    <td>Automated Transfer</td>
                    <td>{new Date(record.confirmedAt).toLocaleDateString("en-US")}</td>
                    <td className="mono">{record.txHash}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-ghost small" type="button" onClick={() => copyHash(record.txHash)}>
                          {copiedHash === record.txHash ? "Copied" : "Copy"}
                        </button>
                        {explorerUrl ? (
                          <a
                            className="btn btn-ghost small btn-link"
                            href={explorerUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Explorer
                          </a>
                        ) : (
                          <button className="btn btn-ghost small" type="button" disabled>
                            Explorer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8}>No payments yet. Record your first rent payment to start history.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="dashboard-columns payment-history-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Payment Reliability</h3>
          </div>
          <div className="progress-list payment-reliability-list">
            <div className="progress-row">
              <div>
                <p>On-Time Ratio</p>
                <small>
                  {onTimeCount} of {payments.length} payments on time
                </small>
              </div>
              <span className="status-tag active">{onTimeRatio}%</span>
            </div>
            <div className="progress-row">
              <div>
                <p>Average Monthly Rent</p>
                <small>Based on recorded payments</small>
              </div>
              <span className="status-tag eligible">{formatUsd(averageRent)}</span>
            </div>
            <div className="progress-row">
              <div>
                <p>Longest Streak</p>
                <small>Consecutive on-time payments</small>
              </div>
              <span className="status-tag on-time">{longestStreak} months</span>
            </div>
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-header">
            <h3>Certificate Access</h3>
          </div>
          <p className="panel-copy">
            Generate a verifiable certificate URL that opens a professional payment
            certificate page outside the dashboard.
          </p>
          <div className="certificate-select-row">
            <label htmlFor="certificate-transaction">Certificate Transaction</label>
            <select
              id="certificate-transaction"
              value={selectedCertificateId}
              onChange={(event) => setSelectedCertificateId(event.target.value)}
              disabled={!payments.length}
            >
              {payments.length ? (
                payments.map((record) => (
                  <option key={record.paymentRecordId} value={record.paymentRecordId}>
                    {record.month} | {formatUsd(record.amountUsd)} |{" "}
                    {shortenIdentifier(record.paymentRecordId.toUpperCase(), 8, 6)}
                  </option>
                ))
              ) : (
                <option value="">No transactions available</option>
              )}
            </select>
          </div>
          <div className="hero-actions certificate-access-actions">
            <button className="btn btn-primary" type="button" onClick={handleGenerateCertificateLink}>
              Generate Certificate Link
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={copyCertificateLink}
              disabled={!certificateLink}
            >
              Copy Link
            </button>
            {certificateLink ? (
              <a className="btn btn-ghost btn-link" href={certificateLink} target="_blank" rel="noreferrer">
                Open Certificate
              </a>
            ) : null}
          </div>
          {certificateMessage ? <p className="action-success">{certificateMessage}</p> : null}
          {selectedCertificateRecord ? (
            <p className="certificate-selected-id">
              Selected certificate ID:{" "}
              <span className="mono">
                {shortenIdentifier(selectedCertificateRecord.paymentRecordId.toUpperCase(), 12, 10)}
              </span>
            </p>
          ) : null}
          <p className="mono link-preview">
            {certificateLink || "Generate a link to preview the selected payment certificate."}
          </p>
        </article>
      </section>
    </>
  );
}
