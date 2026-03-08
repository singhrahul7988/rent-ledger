import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import {
  getLeases,
  getPayments,
  getRentScore,
  getTransactions,
  resolveTenantQuery
} from "../lib/apiClient";

const EXPLORER_TX_BASE =
  (import.meta.env.VITE_EXPLORER_TX_BASE_URL || "https://creditcoin-testnet.blockscout.com/tx/").replace(
    /\/$/,
    ""
  );

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function shortHash(hash) {
  const value = String(hash || "");
  if (!value) return "--";
  if (value.length <= 18) return value;
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function formatTier(tier) {
  const value = String(tier || "BUILDING_CREDIT")
    .toLowerCase()
    .replace(/_/g, " ");
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function VerifyTenantPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const metrics = useMemo(() => {
    if (!result) return null;
    const payments = result.payments || [];
    const onTimePayments = payments.filter((payment) => payment.status === "ON_TIME").length;
    const latePayments = payments.filter((payment) => payment.status === "LATE").length;
    const totalRentRecorded = payments.reduce((sum, payment) => sum + Number(payment.amountUsd || 0), 0);
    const onTimeRatio = payments.length > 0 ? Math.round((onTimePayments / payments.length) * 100) : 0;

    return {
      onTimePayments,
      latePayments,
      totalRentRecorded,
      onTimeRatio
    };
  }, [result]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setError("Enter tenant account ID (acc_...) or transaction hash (0x + 64 hex).");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const resolved = await resolveTenantQuery(normalizedQuery);
      const accountId = resolved.accountId;

      const [leasesRes, paymentsRes, scoreRes, transactionsRes] = await Promise.allSettled([
        getLeases(accountId),
        getPayments(accountId),
        getRentScore(accountId),
        getTransactions(accountId)
      ]);

      const leases = leasesRes.status === "fulfilled" ? leasesRes.value.items || [] : [];
      const payments = paymentsRes.status === "fulfilled" ? paymentsRes.value.items || [] : [];
      const score =
        scoreRes.status === "fulfilled"
          ? scoreRes.value
          : {
              score: 0,
              tier: "BUILDING_CREDIT",
              pointsToNextTier: 0
            };
      const transactions =
        transactionsRes.status === "fulfilled" ? transactionsRes.value.items || [] : [];

      setResult({
        accountId,
        matchedBy: resolved.matchedBy,
        score,
        leases,
        payments,
        transactions
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unable to verify tenant right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const paymentRows = result?.payments?.slice(0, 8) || [];

  return (
    <div className="verify-tenant-page">
      <header className="pricing-topbar">
        <div className="container pricing-topbar-inner">
          <Brand />
          <div className="pricing-topbar-actions">
            <Link to="/" className="btn btn-ghost btn-link">
              Back to Home
            </Link>
            <Link to="/signin" className="btn btn-primary btn-link">
              Start Building Credit
            </Link>
          </div>
        </div>
      </header>

      <main className="container verify-tenant-main">
        <section className="verify-hero-card">
          <p className="section-label">LANDLORD VERIFICATION</p>
          <h1>Verify a tenant in seconds</h1>
          <p className="verify-subtext">
            Check verified payment history and credit behavior without logging in. Use tenant account
            ID or a transaction hash from Creditcoin explorer.
          </p>

          <form className="verify-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Enter acc_... or 0x transaction hash"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify Tenant"}
            </button>
          </form>
          <p className="verify-hint">
            Accepted: tenant account ID (`acc_...`) or payment transaction hash (`0x...` 64 hex).
          </p>
          {error ? <p className="action-error">{error}</p> : null}
        </section>

        {result ? (
          <section className="verify-results">
            <div className="verify-headline">
              <div>
                <h2>Tenant Insights</h2>
                <p>
                  Account <strong>{result.accountId}</strong> verified via{" "}
                  <strong>{result.matchedBy === "transactionHash" ? "transaction hash" : "account ID"}</strong>.
                </p>
              </div>
              <span
                className={`verify-status-pill ${
                  (metrics?.onTimePayments || 0) > 0 ? "success" : "warning"
                }`}
              >
                {(metrics?.onTimePayments || 0) > 0 ? "Verified Activity" : "No Payment Activity Yet"}
              </span>
            </div>

            <div className="verify-metric-grid">
              <article className="verify-metric-card">
                <p>Current RentScore</p>
                <strong>{result.score?.score || 0}</strong>
                <span>{formatTier(result.score?.tier)}</span>
              </article>
              <article className="verify-metric-card">
                <p>On-Time Ratio</p>
                <strong>{metrics?.onTimeRatio || 0}%</strong>
                <span>
                  {metrics?.onTimePayments || 0} on-time / {result.payments.length} total
                </span>
              </article>
              <article className="verify-metric-card">
                <p>Total Rent Recorded</p>
                <strong>{formatUsd(metrics?.totalRentRecorded || 0)}</strong>
                <span>{result.payments.length} verified transactions</span>
              </article>
              <article className="verify-metric-card">
                <p>Active Leases</p>
                <strong>{result.leases.length}</strong>
                <span>{metrics?.latePayments || 0} late records</span>
              </article>
            </div>

            <article className="verify-table-card">
              <div className="panel-header">
                <h3>Verified Payment History</h3>
              </div>
              {paymentRows.length > 0 ? (
                <div className="verify-table-wrap">
                  <table className="verify-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Confirmed On</th>
                        <th>Network Proof</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRows.map((row) => (
                        <tr key={row.paymentRecordId}>
                          <td>{row.month}</td>
                          <td>{formatUsd(row.amountUsd)}</td>
                          <td>
                            <span
                              className={`status-tag ${
                                row.status === "ON_TIME" ? "on-time" : "late"
                              }`}
                            >
                              {row.status === "ON_TIME" ? "ON TIME" : "LATE"}
                            </span>
                          </td>
                          <td>{new Date(row.confirmedAt).toLocaleDateString("en-US")}</td>
                          <td>
                            <a
                              className="verify-proof-link"
                              href={`${EXPLORER_TX_BASE}/${row.txHash}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {shortHash(row.txHash)}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="panel-copy">
                  No verified payments found yet for this tenant account.
                </p>
              )}
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}
