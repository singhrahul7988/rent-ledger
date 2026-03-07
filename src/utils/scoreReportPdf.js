export function scoreTier(score) {
  if (score >= 700) return "Credit Trusted";
  if (score >= 600) return "Credit Established";
  if (score >= 450) return "Credit Builder";
  if (score >= 300) return "Credit Starter";
  return "Building Credit";
}

function escapePdfText(value) {
  return String(value || "")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatUsdWhole(value) {
  return `$${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0
  })}`;
}

export function buildScoreReportData({
  accountId,
  score,
  pointsToNextTier = 0,
  payments = [],
  factors = {},
  generatedAt = new Date()
}) {
  const paymentCount = payments.length;
  const onTimeCount = payments.filter((item) => item.status === "ON_TIME").length;
  const lateCount = payments.filter((item) => item.status === "LATE").length;
  const avgRent = paymentCount
    ? Math.round(payments.reduce((sum, record) => sum + Number(record.amountUsd || 0), 0) / paymentCount)
    : Math.round(factors.avgRentUsd || 0);
  const totalRent = Math.round(
    payments.reduce((sum, record) => sum + Number(record.amountUsd || 0), 0)
  );
  const latestConfirmed = [...payments]
    .sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime())[0]
    ?.confirmedAt;
  const onTimeRatio = paymentCount ? Math.round((onTimeCount / paymentCount) * 100) : 0;

  const mergedFactors = {
    onTimePayments:
      Number.isFinite(factors.onTimePayments) && factors.onTimePayments >= 0
        ? factors.onTimePayments
        : onTimeCount,
    latePayments:
      Number.isFinite(factors.latePayments) && factors.latePayments >= 0
        ? factors.latePayments
        : lateCount,
    tenureMonths:
      Number.isFinite(factors.tenureMonths) && factors.tenureMonths >= 0
        ? factors.tenureMonths
        : paymentCount,
    avgRentUsd:
      Number.isFinite(factors.avgRentUsd) && factors.avgRentUsd >= 0
        ? factors.avgRentUsd
        : avgRent
  };

  return {
    generatedAtText: generatedAt.toLocaleString("en-US"),
    reportDate: generatedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }),
    accountIdText: accountId || "N/A",
    score,
    tier: scoreTier(score),
    pointsToNextTier,
    paymentCount,
    onTimeCount,
    lateCount,
    onTimeRatio,
    avgRent,
    totalRent,
    lastPaymentDate: latestConfirmed
      ? new Date(latestConfirmed).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric"
        })
      : "No payments yet",
    factorSummary: [
      {
        label: "Payment Count (+30 per payment)",
        value: `+${Math.min(mergedFactors.onTimePayments * 30, 300)}`
      },
      {
        label: "Consistency Bonus (+50 for 6-month streak)",
        value: mergedFactors.onTimePayments >= 6 ? "+50" : "+0"
      },
      {
        label: "Rental Amount Tier",
        value:
          mergedFactors.avgRentUsd >= 1000
            ? "+50"
            : mergedFactors.avgRentUsd >= 500
            ? "+30"
            : "+10"
      },
      {
        label: "Tenure Bonus",
        value:
          mergedFactors.tenureMonths >= 12
            ? "+50"
            : mergedFactors.tenureMonths >= 6
            ? "+25"
            : "+0"
      },
      {
        label: "Late Payment Penalty",
        value: `-${mergedFactors.latePayments * 15}`,
        isPenalty: true
      }
    ]
  };
}

export function buildScoreReportBlob(report) {
  const encoder = new TextEncoder();
  const commands = [];

  const drawText = (font, size, x, y, text, rgb = "0 0 0") => {
    commands.push(`${rgb} rg`);
    commands.push(`BT\n/${font} ${size} Tf\n1 0 0 1 ${x} ${y} Tm\n(${escapePdfText(text)}) Tj\nET`);
  };

  const drawFilledRect = (x, y, width, height, rgb) => {
    commands.push(`${rgb} rg`);
    commands.push(`${x} ${y} ${width} ${height} re f`);
  };

  const drawRectBorder = (x, y, width, height, rgb = "0.86 0.89 0.93", lineWidth = 1) => {
    commands.push(`${lineWidth} w`);
    commands.push(`${rgb} RG`);
    commands.push(`${x} ${y} ${width} ${height} re S`);
  };

  const drawLine = (x1, y1, x2, y2, rgb = "0.86 0.89 0.93", lineWidth = 1) => {
    commands.push(`${lineWidth} w`);
    commands.push(`${rgb} RG`);
    commands.push(`${x1} ${y1} m ${x2} ${y2} l S`);
  };

  drawFilledRect(34, 742, 544, 30, "0.11 0.23 0.36");
  drawText("F2", 16, 46, 752, "Rent Ledger Credit Score Report", "1 1 1");
  drawText("F1", 10, 46, 728, `Generated: ${report.generatedAtText}`, "0.18 0.22 0.29");
  drawText("F1", 10, 320, 728, `Account: ${report.accountIdText}`, "0.18 0.22 0.29");
  drawLine(34, 720, 578, 720);

  const cardY = 642;
  const cardH = 62;
  const cardW = 170;
  const cardGap = 17;
  const cardX = [34, 34 + cardW + cardGap, 34 + 2 * (cardW + cardGap)];

  cardX.forEach((x) => {
    drawFilledRect(x, cardY, cardW, cardH, "0.97 0.98 0.99");
    drawRectBorder(x, cardY, cardW, cardH);
  });

  drawText("F1", 10, cardX[0] + 12, cardY + 44, "Current Credit Score", "0.45 0.49 0.56");
  drawText("F2", 24, cardX[0] + 12, cardY + 18, String(report.score), "0.11 0.23 0.36");
  drawText("F1", 9, cardX[0] + 90, cardY + 22, report.tier, "0.10 0.48 0.29");

  drawText("F1", 10, cardX[1] + 12, cardY + 44, "Successful Transactions", "0.45 0.49 0.56");
  drawText("F2", 24, cardX[1] + 12, cardY + 18, String(report.onTimeCount), "0.10 0.48 0.29");
  drawText("F1", 9, cardX[1] + 74, cardY + 22, `${report.onTimeRatio}% on-time`, "0.10 0.48 0.29");

  drawText("F1", 10, cardX[2] + 12, cardY + 44, "Missed Payments", "0.45 0.49 0.56");
  drawText("F2", 24, cardX[2] + 12, cardY + 18, String(report.lateCount), "0.76 0.22 0.17");
  drawText("F1", 9, cardX[2] + 64, cardY + 22, "late / delayed", "0.76 0.22 0.17");

  drawText("F2", 13, 34, 618, "Payment Overview", "0.11 0.23 0.36");
  drawRectBorder(34, 410, 544, 196);

  const overviewRows = [
    ["Report Date", report.reportDate],
    ["Total Transactions", String(report.paymentCount)],
    ["Successful Payments", String(report.onTimeCount)],
    ["Missed Payments", String(report.lateCount)],
    ["Current Credit Score", String(report.score)],
    ["Points to Next Tier", String(report.pointsToNextTier)],
    ["Average Monthly Rent", formatUsdWhole(report.avgRent)],
    ["Total Rent Recorded", formatUsdWhole(report.totalRent)]
  ];

  const rowHeight = 24;
  overviewRows.forEach((row, index) => {
    const y = 606 - index * rowHeight;
    if (index > 0) {
      drawLine(34, y, 578, y, "0.92 0.93 0.95");
    }
    drawText("F1", 10, 44, y - 15, row[0], "0.28 0.31 0.38");
    drawText("F2", 10, 354, y - 15, row[1], "0.11 0.23 0.36");
  });

  drawText("F2", 13, 34, 388, "Score Factors", "0.11 0.23 0.36");
  drawRectBorder(34, 252, 544, 124);
  drawFilledRect(34, 252, 544, 124, "0.99 0.99 1");
  drawRectBorder(34, 252, 544, 124);

  report.factorSummary.forEach((item, index) => {
    const y = 356 - index * 20;
    drawText("F1", 10, 46, y, item.label, "0.28 0.31 0.38");
    drawText("F2", 10, 430, y, item.value, item.isPenalty ? "0.76 0.22 0.17" : "0.10 0.48 0.29");
  });

  drawLine(34, 232, 578, 232);
  drawText("F1", 9, 34, 216, `Last payment recorded: ${report.lastPaymentDate}`, "0.45 0.49 0.56");
  drawText("F1", 9, 34, 201, "Powered by Rent Ledger on Creditcoin Testnet", "0.45 0.49 0.56");
  drawText("F1", 9, 450, 201, "Page 1 of 1", "0.45 0.49 0.56");

  const content = commands.join("\n");
  const byteLength = encoder.encode(content).length;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n",
    `6 0 obj\n<< /Length ${byteLength} >>\nstream\n${content}\nendstream\nendobj\n`
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
  const xrefLines = ["xref", "0 7", "0000000000 65535 f "];
  for (let i = 1; i <= 6; i += 1) {
    xrefLines.push(`${String(offsets[i]).padStart(10, "0")} 00000 n `);
  }

  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  chunks.push(`${xrefLines.join("\n")}\n`);
  chunks.push(trailer);

  return new Blob(chunks, { type: "application/pdf" });
}
