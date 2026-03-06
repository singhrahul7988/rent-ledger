import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

function formatUsd(value) {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function scoreTier(score) {
  if (score >= 700) return "Credit Trusted";
  if (score >= 600) return "Credit Established";
  if (score >= 450) return "Credit Builder";
  if (score >= 300) return "Credit Starter";
  return "Building Credit";
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

function scopeLabel(value) {
  return value === "landlord" ? "Landlord verification" : "Lending review";
}

function escapePdfText(value) {
  return String(value || "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function buildPdfBlob(lines) {
  const encoder = new TextEncoder();
  const lineHeight = 18;
  const startY = 760;

  const content = lines
    .slice(0, 40)
    .map((line, index) => {
      const y = startY - index * lineHeight;
      return `BT\n/F1 12 Tf\n1 0 0 1 40 ${y} Tm\n(${escapePdfText(line)}) Tj\nET`;
    })
    .join("\n");

  const byteLength = encoder.encode(content).length;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${byteLength} >>\nstream\n${content}\nendstream\nendobj\n`
  ];

  const header = "%PDF-1.4\n%----\n";
  const chunks = [header];
  const offsets = [0];
  let currentOffset = encoder.encode(header).length;

  objects.forEach((objectText) => {
    offsets.push(currentOffset);
    chunks.push(objectText);
    currentOffset += encoder.encode(objectText).length;
  });

  const xrefStart = currentOffset;
  const xrefLines = ["xref", "0 6", "0000000000 65535 f "];
  for (let index = 1; index <= 5; index += 1) {
    xrefLines.push(`${String(offsets[index]).padStart(10, "0")} 00000 n `);
  }

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(`${xrefLines.join("\n")}\n`);
  chunks.push(trailer);

  return new Blob(chunks, { type: "application/pdf" });
}

export default function CreditReportPage() {
  const { accountId, rentScore, payments } = useOutletContext();
  const [linkExpiration, setLinkExpiration] = useState("7d");
  const [accessScope, setAccessScope] = useState("landlord");
  const [allowDownload, setAllowDownload] = useState(true);
  const [oneTimeLink, setOneTimeLink] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [linkCreatedAt, setLinkCreatedAt] = useState("");
  const [linkExpiresAt, setLinkExpiresAt] = useState("");
  const [oneTimeUsedAt, setOneTimeUsedAt] = useState("");
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [copyState, setCopyState] = useState("Copy Link");
  const score = rentScore?.score || 150;
  const onTimeCount = payments.filter((record) => record.status === "ON_TIME").length;
  const onTimeRatio = payments.length ? Math.round((onTimeCount / payments.length) * 100) : 0;
  const avgRent = payments.length
    ? Math.round(payments.reduce((sum, record) => sum + record.amountUsd, 0) / payments.length)
    : 0;

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
    const generated = `https://rentledger.app/verify/${scopeCode}-${accountSuffix || "acct"}-${randomToken}?dl=${
      allowDownload ? "1" : "0"
    }&ot=${oneTimeLink ? "1" : "0"}`;

    setShareLink(generated);
    setLinkCreatedAt(now.toISOString());
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
    const lines = [
      "RentLedger Shareable Credit Report",
      "",
      `Generated: ${generatedAt.toLocaleString("en-US")}`,
      `Account ID: ${accountId || "N/A"}`,
      "",
      "Current Snapshot",
      `Current RentScore: ${score}`,
      `Tier: ${scoreTier(score)}`,
      `Points to next tier: ${rentScore?.pointsToNextTier || 0}`,
      "",
      "Reliability Metrics",
      `On-Time Payment Ratio: ${onTimeRatio}%`,
      `Average Monthly Rent (USD): ${avgRent}`,
      `Verified Payment Records: ${payments.length}`,
      "",
      "Share Settings",
      `Access Scope: ${scopeLabel(accessScope)}`,
      `Link Expiration: ${expiryLabel(linkExpiration)}`,
      `Allow Download: ${allowDownload ? "Yes" : "No"}`,
      `One-Time Link: ${oneTimeLink ? "Yes" : "No"}`,
      `One-Time Link Used: ${oneTimeUsedAt ? "Yes" : "No"}`,
      `Active Share Link: ${shareLink || "Not generated yet"}`
    ];

    const pdfBlob = buildPdfBlob(lines);
    const blobUrl = window.URL.createObjectURL(pdfBlob);
    const stamp = generatedAt.toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `rentledger-credit-report-${stamp}.pdf`;
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
                <div className="report-share-meta">
                  <span>{scopeLabel(accessScope)}</span>
                  <span>{allowDownload ? "Download allowed" : "Download blocked"}</span>
                  <span>{oneTimeLink ? "One-time link" : "Reusable link"}</span>
                  <span>Created {new Date(linkCreatedAt).toLocaleDateString("en-US")}</span>
                  <span>Expires {new Date(linkExpiresAt).toLocaleDateString("en-US")}</span>
                </div>
                {oneTimeConsumed ? (
                  <p className="report-share-once-note">
                    This one-time link was opened on{" "}
                    {new Date(oneTimeUsedAt).toLocaleString("en-US")} and is now inactive.
                  </p>
                ) : null}
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
