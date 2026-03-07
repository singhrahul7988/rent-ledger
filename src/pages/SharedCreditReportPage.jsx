import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function formatUsd(value) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function maskAccount(accountId) {
  const value = String(accountId || "acc_unknown");
  if (value.length <= 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export default function SharedCreditReportPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();

  const accountId = searchParams.get("accountId") || "acc_unknown";
  const score = Number(searchParams.get("score") || 0);
  const tier = searchParams.get("tier") || "Building Credit";
  const ratio = Number(searchParams.get("ratio") || 0);
  const avgRent = Number(searchParams.get("avgRent") || 0);
  const records = Number(searchParams.get("records") || 0);
  const expiresAt = searchParams.get("exp") || "";

  const expiry = useMemo(() => (expiresAt ? new Date(expiresAt) : null), [expiresAt]);
  const isExpired = expiry ? Date.now() > expiry.getTime() : false;

  return (
    <main className="shared-report-page">
      <section className="shared-report-card">
        <p className="shared-report-eyebrow">Rent Ledger Share Link</p>
        <h1>Verified Credit Report</h1>
        <p className="shared-report-subtitle">
          Read-only credit snapshot for landlord or lender verification.
        </p>

        <div className="shared-report-meta">
          <div>
            <span>Reference</span>
            <strong>{token || "N/A"}</strong>
          </div>
          <div>
            <span>Tenant Account</span>
            <strong>{maskAccount(accountId)}</strong>
          </div>
          <div>
            <span>Link Status</span>
            <strong className={isExpired ? "is-expired" : "is-active"}>
              {isExpired ? "Expired" : "Active"}
            </strong>
          </div>
          <div>
            <span>Expires On</span>
            <strong>{expiry ? expiry.toLocaleString("en-US") : "N/A"}</strong>
          </div>
        </div>

        <div className="shared-report-metrics">
          <div>
            <span>Current Credit Score</span>
            <strong>{score}</strong>
            <small>{tier}</small>
          </div>
          <div>
            <span>On-Time Ratio</span>
            <strong>{ratio}%</strong>
            <small>{records} verified payments</small>
          </div>
          <div>
            <span>Average Monthly Rent</span>
            <strong>{formatUsd(avgRent)}</strong>
            <small>Across recorded payments</small>
          </div>
        </div>
      </section>
    </main>
  );
}
