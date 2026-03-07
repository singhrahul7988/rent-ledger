import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  buildScoreReportBlob,
  buildScoreReportData,
  scoreTier
} from "../../utils/scoreReportPdf";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function expiryToDays(value) {
  if (value === "24h") return 1;
  if (value === "7d") return 7;
  if (value === "14d") return 14;
  if (value === "21d") return 21;
  return 30;
}

function expiryLabel(value) {
  if (value === "24h") return "24 hours";
  if (value === "7d") return "7 days";
  if (value === "14d") return "14 days";
  if (value === "21d") return "21 days";
  return "30 days";
}

export default function CreditReportPage() {
  const { accountId, rentScore, payments } = useOutletContext();
  const [linkExpiration, setLinkExpiration] = useState("7d");
  const [accessScope, setAccessScope] = useState("landlord");
  const [allowDownload, setAllowDownload] = useState(true);
  const [oneTimeLink, setOneTimeLink] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [linkExpiresAt, setLinkExpiresAt] = useState("");
  const [oneTimeUsedAt, setOneTimeUsedAt] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copyState, setCopyState] = useState("Copy Link");
  const score = rentScore?.score || 150;
  const onTimeCount = payments.filter((record) => record.status === "ON_TIME").length;
  const lateCount = payments.filter((record) => record.status === "LATE").length;
  const onTimeRatio = payments.length ? Math.round((onTimeCount / payments.length) * 100) : 0;
  const avgRent = payments.length
    ? Math.round(payments.reduce((sum, record) => sum + record.amountUsd, 0) / payments.length)
    : 0;
  const factors = rentScore?.factors || {
    onTimePayments: onTimeCount,
    latePayments: lateCount,
    tenureMonths: payments.length,
    avgRentUsd: avgRent
  };

  const timeline = useMemo(() => {
    if (payments.length === 0) return [];
    const sorted = [...payments].sort(
      (a, b) => new Date(a.confirmedAt).getTime() - new Date(b.confirmedAt).getTime()
    );
    const first = sorted[0];
    const recent = sorted[sorted.length - 1];
    return [
      { title: "First Verified Payment", value: first.month },
      { title: "Most Recent Certificate", value: recent.month },
      { title: "Current Tier", value: scoreTier(score) }
    ];
  }, [payments, score]);

  const reliabilityMetrics = [
    { label: "On-Time Payment Ratio", value: `${onTimeRatio}%` },
    { label: "Average Monthly Rent", value: formatUsd(avgRent) },
    { label: "Verified Payment Records", value: String(payments.length) },
    { label: "Current RentScore", value: String(score) }
  ];

  const resolveShareBaseUrl = () => {
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "";
    if (origin) return origin.replace(/\/$/, "");

    const configured = (import.meta.env.VITE_PUBLIC_APP_URL || "").trim();
    if (configured) return configured.replace(/\/$/, "");

    return "https://rent-ledger-lilac.vercel.app";
  };

  const handleGenerateShareLink = async () => {
    setIsGeneratingLink(true);
    setCopyState("Copy Link");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 800);
    });

    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + expiryToDays(linkExpiration));

    const scopeCode = accessScope === "landlord" ? "ll" : "lr";
    const accountSuffix = String(accountId || "guest")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-6)
      .toLowerCase();
    const randomToken = Math.random().toString(36).slice(2, 7);
    const token = `${scopeCode}-${accountSuffix || "acct"}-${randomToken}`;
    const appBaseUrl = resolveShareBaseUrl();
    const params = new URLSearchParams({
      accountId: accountId || "",
      score: String(score),
      tier: scoreTier(score),
      ratio: String(onTimeRatio),
      avgRent: String(avgRent),
      records: String(payments.length),
      exp: expiryDate.toISOString(),
      dl: allowDownload ? "1" : "0",
      ot: oneTimeLink ? "1" : "0"
    });
    const generated = `${appBaseUrl}/shared-report/${token}?${params.toString()}`;

    setShareLink(generated);
    setLinkExpiresAt(expiryDate.toISOString());
    setOneTimeUsedAt("");
    setIsGeneratingLink(false);
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopyState("Copied");
      window.setTimeout(() => setCopyState("Copy Link"), 1400);
    } catch (_error) {
      setCopyState("Copy failed");
      window.setTimeout(() => setCopyState("Copy Link"), 1600);
    }
  };

  const handleExportPdf = () => {
    const generatedAt = new Date();
    const report = buildScoreReportData({
      accountId,
      score,
      pointsToNextTier: rentScore?.pointsToNextTier || 0,
      payments,
      factors,
      generatedAt
    });
    const pdfBlob = buildScoreReportBlob(report);
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const stamp = generatedAt.toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `rentledger-score-report-${stamp}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1500);
  };

  const oneTimeConsumed = oneTimeLink && Boolean(oneTimeUsedAt);

  const handleOpenLink = () => {
    if (!shareLink || oneTimeConsumed) return;
    window.open(shareLink, "_blank", "noopener,noreferrer");
    if (oneTimeLink) {
      setOneTimeUsedAt(new Date().toISOString());
    }
  };

  return (
    <>
      <section className="report-grid">
        <article className="panel-card report-summary">
          <div className="panel-header">
            <h3>Shareable Credit Report</h3>
          </div>
          <p className="panel-copy">
            This report summarizes verified rent behavior for landlord screening
            and lending qualification. Personal account address is masked by default.
          </p>

          <div className="report-score-row">
            <div className="report-score-wrap">
              <p className="report-label">Current RentScore</p>
              <strong className="report-score">{score}</strong>
            </div>
            <div className="report-actions">
              <button className="btn btn-primary btn-inline-loading" type="button" onClick={handleGenerateShareLink} disabled={isGeneratingLink}>
                {isGeneratingLink ? (
                  <>
                    <span className="mini-spinner" aria-hidden="true"></span>
                    Generating...
                  </>
                ) : (
                  "Generate Share Link"
                )}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleExportPdf}>
                Export PDF
              </button>
            </div>
          </div>

          <div className="report-share-output">
            {shareLink ? (
              <>
                <p className="report-share-label">Shareable Link</p>
                <p className="mono report-share-url">{shareLink}</p>
                <p className="report-share-expiry">
                  Expires on{" "}
                  {linkExpiresAt
                    ? new Date(linkExpiresAt).toLocaleString("en-US")
                    : `in ${expiryLabel(linkExpiration)}`}
                </p>
                <div className="report-share-actions">
                  <button className="btn btn-secondary small" type="button" onClick={handleCopyLink}>
                    {copyState}
                  </button>
                  <button
                    className="btn btn-ghost btn-link small"
                    type="button"
                    onClick={handleOpenLink}
                    disabled={oneTimeConsumed}
                  >
                    {oneTimeConsumed ? "Link Used" : "Open Link"}
                  </button>
                </div>
              </>
            ) : (
              <p className="report-share-placeholder">
                Generate a share link to create a time-bound URL for landlords or lenders.
              </p>
            )}
          </div>
        </article>

        <article className="panel-card share-config">
          <div className="panel-header">
            <h3>Share Settings</h3>
          </div>
          <div className="form-grid report-form-grid">
            <label>
              Link Expiration
              <select value={linkExpiration} onChange={(event) => setLinkExpiration(event.target.value)}>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="14d">14 days</option>
                <option value="21d">21 days</option>
                <option value="30d">30 days</option>
              </select>
            </label>
            <label>
              Access Scope
              <select value={accessScope} onChange={(event) => setAccessScope(event.target.value)}>
                <option value="landlord">Landlord verification</option>
                <option value="lender">Lending review</option>
              </select>
            </label>
            <label className="setting-check">
              <input
                type="checkbox"
                checked={allowDownload}
                onChange={(event) => setAllowDownload(event.target.checked)}
              />
              <span>Allow Download</span>
            </label>
            <label className="setting-check">
              <input
                type="checkbox"
                checked={oneTimeLink}
                onChange={(event) => setOneTimeLink(event.target.checked)}
              />
              <span>One-Time Link</span>
            </label>
          </div>
        </article>
      </section>

      <section className="report-grid report-lower-grid">
        <article className="panel-card report-metrics-card">
          <div className="panel-header">
            <h3>Reliability Snapshot</h3>
          </div>
          <div className="reliability-grid">
            {reliabilityMetrics.map((metric) => (
              <div className="reliability-card" key={metric.label}>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card report-timeline-card">
          <div className="panel-header">
            <h3>Progress Timeline</h3>
          </div>
          <ul className="timeline-list">
            {timeline.map((step) => (
              <li key={step.title}>
                <span className="timeline-dot"></span>
                <div>
                  <p>{step.title}</p>
                  <small>{step.value}</small>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </>
  );
}
