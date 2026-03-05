export const paymentCertificates = [
  {
    month: "March 2026",
    amount: "$1,850",
    amountValue: 1850,
    status: "ON TIME",
    hash: "0x7f29ab...012d",
    certificateId: "PR-4481",
    method: "Bank Transfer",
    paidOn: "March 5, 2026"
  },
  {
    month: "February 2026",
    amount: "$1,850",
    amountValue: 1850,
    status: "ON TIME",
    hash: "0x17f9aa...6f2e",
    certificateId: "PR-4402",
    method: "Bank Transfer",
    paidOn: "February 5, 2026"
  },
  {
    month: "January 2026",
    amount: "$1,850",
    amountValue: 1850,
    status: "ON TIME",
    hash: "0x29d7ab...40ce",
    certificateId: "PR-4328",
    method: "Bank Transfer",
    paidOn: "January 5, 2026"
  },
  {
    month: "December 2025",
    amount: "$1,850",
    amountValue: 1850,
    status: "LATE",
    hash: "0xae3c11...91f4",
    certificateId: "PR-4249",
    method: "Bank Transfer",
    paidOn: "December 9, 2025"
  },
  {
    month: "November 2025",
    amount: "$1,800",
    amountValue: 1800,
    status: "ON TIME",
    hash: "0x61bcfe...3da2",
    certificateId: "PR-4176",
    method: "Card Debit",
    paidOn: "November 5, 2025"
  },
  {
    month: "October 2025",
    amount: "$1,800",
    amountValue: 1800,
    status: "ON TIME",
    hash: "0x19ad2f...9ab1",
    certificateId: "PR-4093",
    method: "Card Debit",
    paidOn: "October 5, 2025"
  }
];

export const transactions = [
  {
    type: "Payment Confirmed",
    date: "Mar 5, 2026",
    time: "08:16 UTC",
    status: "SUCCESS",
    ref: "0x7f29ab...012d",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x7f29ab012d"
  },
  {
    type: "Payment Certificate Issued",
    date: "Mar 5, 2026",
    time: "08:16 UTC",
    status: "SUCCESS",
    ref: "0x1e81ce...99a2",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x1e81ce99a2"
  },
  {
    type: "RentScore Snapshot",
    date: "Mar 5, 2026",
    time: "08:17 UTC",
    status: "SUCCESS",
    ref: "0x86aa1d...1ca3",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x86aa1d1ca3"
  },
  {
    type: "Loan Eligibility Updated",
    date: "Mar 5, 2026",
    time: "08:17 UTC",
    status: "SUCCESS",
    ref: "0x9f7811...4a57",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x9f78114a57"
  },
  {
    type: "Loan Requested",
    date: "Mar 5, 2026",
    time: "08:18 UTC",
    status: "PENDING",
    ref: "0x2f821a...91bc",
    explorerUrl: "https://explorer.creditcoin.network/tx/0x2f821a91bc"
  },
  {
    type: "Loan Activated",
    date: "Mar 5, 2026",
    time: "08:19 UTC",
    status: "SUCCESS",
    ref: "0xb61a71...a330",
    explorerUrl: "https://explorer.creditcoin.network/tx/0xb61a71a330"
  }
];

export const activeLease = {
  id: "lease_7f31",
  propertyLabel: "Central Heights - Unit 12B",
  landlord: "Marcus Williams",
  dueDate: "April 5, 2026",
  monthlyRent: 1850,
  processingFee: 4.5
};

export const loanTiers = [
  {
    tier: "Tier 1 Starter",
    limit: "$10,000",
    apr: "18%",
    unlockScore: 300,
    status: "ELIGIBLE",
    className: "tier-1"
  },
  {
    tier: "Tier 2 Builder",
    limit: "$30,000",
    apr: "15%",
    unlockScore: 450,
    status: "ELIGIBLE",
    className: "tier-2"
  },
  {
    tier: "Tier 3 Established",
    limit: "$75,000",
    apr: "12%",
    unlockScore: 600,
    status: "ACTIVE",
    className: "tier-3"
  },
  {
    tier: "Tier 4 Trusted",
    limit: "$150,000",
    apr: "10%",
    unlockScore: 700,
    status: "LOCKED",
    className: "tier-4",
    pointsLeft: 88
  }
];

export const activeLoan = {
  loanId: "loan_82P1",
  principal: "$22,000",
  apr: "12%",
  nextDueDate: "April 10, 2026",
  installment: "$2,028",
  status: "ACTIVE"
};

export const repaymentSchedule = [
  { installment: "1", dueDate: "Apr 10, 2026", amount: "$2,028", status: "DUE" },
  { installment: "2", dueDate: "May 10, 2026", amount: "$2,028", status: "LOCKED" },
  { installment: "3", dueDate: "Jun 10, 2026", amount: "$2,028", status: "LOCKED" },
  { installment: "4", dueDate: "Jul 10, 2026", amount: "$2,028", status: "LOCKED" },
  { installment: "5", dueDate: "Aug 10, 2026", amount: "$2,028", status: "LOCKED" },
  { installment: "6", dueDate: "Sep 10, 2026", amount: "$2,028", status: "LOCKED" }
];
