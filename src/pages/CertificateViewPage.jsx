import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Brand from "../components/Brand";
import { getPayments } from "../lib/apiClient";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  });
}

function shortHash(hash) {
  const value = String(hash || "");
  if (!value) return "--";
  if (value.length <= 18) return value;
  return `${value.slice(0, 12)}...${value.slice(-8)}`;
}

function explorerUrl(hash) {
  const txHash = String(hash || "");
  if (!txHash || txHash.includes("...")) return "";
  const base = (import.meta.env.VITE_EXPLORER_BASE_URL || "https://creditcoin-testnet.blockscout.com/tx/").replace(/\/$/, "");
  return `${base}/${txHash}`;
}

function maskAccount(accountId) {
  const safe = String(accountId || "");
  if (!safe) return "masked-account";
  if (safe.length <= 10) return safe;
  return `${safe.slice(0, 6)}...${safe.slice(-4)}`;
}

export default function CertificateViewPage() {
  const { paymentRecordId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("accountId") || "";
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!accountId) {
        setError("Invalid certificate link: missing account reference.");
        setLoading(false);
        return;
      }

      try {
        const response = await getPayments(accountId);
        const matched = (response?.items || []).find(
          (item) => String(item.paymentRecordId) === String(paymentRecordId)
        );

        if (!matched) {
          throw new Error("Certificate not found for this account.");
        }

        if (!cancelled) {
          setRecord(matched);
          setError("");
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load certificate.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [accountId, paymentRecordId]);

  const issuedOn = useMemo(() => {
    if (!record?.confirmedAt) return "--";
    return new Date(record.confirmedAt).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [record]);

  const statusTone = record?.status === "ON_TIME" ? "on-time" : "late";
  const txExplorerUrl = record ? explorerUrl(record.txHash) : "";

  return (
    <div className="certificate-view-page">
      <header className="certificate-topbar">
        <div className="container certificate-topbar-inner">
          <Brand />
          <div className="certificate-topbar-actions">
            <Link to="/dashboard/payment-history" className="btn btn-secondary btn-link">
              Back to Payment History
            </Link>
            <button className="btn btn-primary" type="button" onClick={() => window.print()}>
              Print Certificate
            </button>
          </div>
        </div>
      </header>

      <main className="container certificate-main">
        <section className="certificate-shell">
          <div className="certificate-border">
            {loading ? (
              <p className="panel-copy">Loading certificate...</p>
            ) : error ? (
              <p className="action-error">{error}</p>
            ) : (
              <>
                <div className="certificate-heading">
                  <p className="certificate-eyebrow">Rent Ledger Verified Certificate</p>
                  <h1>Rent Payment Certificate</h1>
                  <p className="certificate-subtitle">
                    This document certifies that a rent payment was recorded through Rent Ledger
                    and confirmed on Creditcoin testnet.
                  </p>
                </div>

                <div className="certificate-metadata-grid">
                  <div className="certificate-meta-card meta-certificate-id">
                    <span>Certificate ID</span>
                    <strong>{record.paymentRecordId.toUpperCase()}</strong>
                  </div>
                  <div className="certificate-meta-card meta-tenant">
                    <span>Tenant Account</span>
                    <strong>{maskAccount(accountId)}</strong>
                  </div>
                  <div className="certificate-meta-card meta-issued">
                    <span>Issued On</span>
                    <strong>{issuedOn}</strong>
                  </div>
                  <div className="certificate-meta-card meta-status">
                    <span>Status</span>
                    <strong>
                      <span className={`status-tag ${statusTone}`}>
                        {record.status === "ON_TIME" ? "ON TIME" : "LATE"}
                      </span>
                    </strong>
                  </div>
                </div>

                <div className="certificate-amount">
                  <p>Verified Amount</p>
                  <strong>{formatUsd(record.amountUsd)}</strong>
                  <span>{record.month}</span>
                </div>

                <div className="certificate-chain-proof">
                  <p>Blockchain Proof</p>
                  <strong className="mono" title={record.txHash}>
                    {shortHash(record.txHash)}
                  </strong>
                  {txExplorerUrl ? (
                    <a className="btn btn-ghost btn-link small certificate-explorer-link" href={txExplorerUrl} target="_blank" rel="noreferrer">
                      <span>View on Explorer</span>
                      <span className="certificate-explorer-url mono"> ({txExplorerUrl})</span>
                    </a>
                  ) : null}
                </div>

                <div className="certificate-signoff">
                  <div>
                    <p>Authorized By</p>
                    <strong>Rent Ledger Verification Engine</strong>
                  </div>
                  <div>
                    <p>Network</p>
                    <strong>Creditcoin Testnet</strong>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
