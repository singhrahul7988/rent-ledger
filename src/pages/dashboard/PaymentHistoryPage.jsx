import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function explorerUrlFromHash(txHash) {
  return `https://explorer.creditcoin.network/tx/${txHash.replace("...", "")}`;
}

function monthToYear(monthLabel) {
  const parsed = new Date(monthLabel);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : String(parsed.getFullYear());
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
  const { payments } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [copiedHash, setCopiedHash] = useState("");

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
            <button className="btn btn-secondary small" type="button">
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
            {filteredPayments.map((record) => (
              <tr key={record.paymentRecordId}>
                <td>{record.month}</td>
                <td>{formatUsd(record.amountUsd)}</td>
                <td>
                  <span className={`status-tag ${record.status === "ON_TIME" ? "on-time" : "late"}`}>
                    {record.status === "ON_TIME" ? "ON TIME" : "LATE"}
                  </span>
                </td>
                <td>{record.paymentRecordId.toUpperCase()}</td>
                <td>Automated Transfer</td>
                <td>{new Date(record.confirmedAt).toLocaleDateString("en-US")}</td>
                <td className="mono">{record.txHash}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-ghost small" type="button" onClick={() => copyHash(record.txHash)}>
                      {copiedHash === record.txHash ? "Copied" : "Copy"}
                    </button>
                    <a
                      className="btn btn-ghost small btn-link"
                      href={explorerUrlFromHash(record.txHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Explorer
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="dashboard-columns">
        <article className="panel-card">
          <div className="panel-header">
            <h3>Payment Reliability</h3>
          </div>
          <div className="progress-list">
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
            Share a read-only payment history with landlords or lending partners.
            Account address is masked by default.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button">
              Generate Share Link
            </button>
          </div>
          <p className="mono link-preview">https://rentledger.app/verify/sarah-chen-8h2x</p>
        </article>
      </section>
    </>
  );
}
