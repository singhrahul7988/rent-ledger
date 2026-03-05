# RentLedger Global PRD v2.0

## Document Control
- Product: RentLedger
- Document: Global Product Requirements Document
- Version: v2.0
- Date: March 6, 2026
- Status: Approved for implementation
- Scope: Desktop-first web dashboard (minimum 1280px viewport)
- Supersedes: Prior regional PRD v1.0

## 1. Executive Summary
RentLedger is a global credit-building platform that converts verified rent payments into a portable on-chain credit profile. Each verified payment is recorded through an automated payment system and represented as a tamper-resistant Payment Certificate. Payment Certificates accumulate into a RentScore (0-850). RentScore drives transparent eligibility for micro-loans without requiring a traditional bank credit history.

The product is international-first, USD-default in examples, and designed for a premium desktop dashboard experience that communicates trust, clarity, and measurable financial progress.

## 2. Product Vision and Outcomes
### Vision
Every renter who pays on time should be able to prove reliability and unlock fair access to credit.

### North Star Outcome
Increase the number of credit-invisible renters who cross RentScore 600 and become eligible for lower-cost loans.

### Success Metrics (MVP)
- Active renter accounts (30-day): >= 5,000
- First verified payment completion rate: >= 70%
- Users with RentScore >= 450: >= 2,000
- Users with RentScore >= 600: >= 800
- Loan request conversion from eligible users: >= 20%
- Escrow transaction success rate: >= 99.5%

## 3. Users and Personas
### Primary Persona: Credit-Invisible Renter
- Name: Sarah Chen, 29, Product Operations Analyst, Singapore
- Goal: Build recognized credit from $1,850 monthly rent and qualify for a $3,000 emergency loan
- Behavior: Pays digitally, checks finances weekly, wants clear and simple UI

### Secondary Persona: Verification-Oriented Landlord
- Name: Marcus Williams, 47, Landlord, Toronto
- Goal: Verify consistent payment behavior before lease approval
- Behavior: Uses web tools monthly, values evidence over references

### Additional Global Persona
- Name: Aditya Sharma, 31, Contractor, Dubai
- Goal: Use payment history across borders when moving rentals
- Behavior: Needs portable proof independent of local bureau systems

## 4. In Scope and Out of Scope
### In Scope (v2.0)
- Desktop web app only (not mobile app)
- Core 7 screens:
  - Dashboard
  - Pay Rent
  - Payment History
  - My RentScore
  - Credit Report
  - Loans
  - Transactions
- Landlord verification via secure share link
- Mock payment webhook endpoint for demos
- RentScore computation off-chain with on-chain snapshot

### Out of Scope (v2.0)
- Native iOS/Android apps
- Live payment rail integrations for all countries
- Tax optimization modules
- Marketplace listings
- Multi-chain deployment

## 5. Product Principles
- Credit-first, blockchain-subtle: users come for credit outcomes, not chain mechanics.
- Every action should increase trust through clear evidence and auditable records.
- Locked states must show progress needed, not dead ends.
- UI language must remain plain-English and consumer-safe.
- RentScore is always visible in high-value contexts.

## 6. Terminology and Content Rules
### Required UI Terms
- My Account (not Wallet)
- Processing fee (not Gas fee)
- Automated payment system (not Smart contract)
- Payment Record or Payment Certificate (UI-facing term instead of NFT)
- Recording your payment on blockchain (instead of Mint)

### Allowed Technical Terms (only in advanced detail)
- Blockchain
- Transaction hash
- Contract address

### Banned User-Facing Terms
- DeFi slang
- Yield farming
- Degens
- Ape
- Web3-native jargon without explanation

## 7. Core User Flows
### Flow A: Onboard and Connect Account
1. User opens dashboard and connects My Account.
2. System validates network and account format.
3. User creates lease profile with landlord, currency, and monthly amount.
4. Dashboard displays baseline RentScore and first payment CTA.

### Flow B: Pay Rent and Record Payment Certificate
1. User opens Pay Rent.
2. User confirms lease, amount, due date, and processing fee.
3. User submits payment to automated payment system.
4. Funds are released to landlord per lease rule.
5. Payment Certificate is recorded; transaction hash is available.
6. Dashboard shows celebratory success state and score delta.

### Flow C: Score Growth to Loan Eligibility
1. User opens My RentScore to view tier and factors.
2. System recalculates score from payment history and penalties.
3. Loans screen updates locked or eligible tiers.
4. If eligible, user requests a loan and receives repayment schedule.

### Flow D: Landlord Verification
1. Renter generates a secure share link from Credit Report.
2. Landlord views read-only report with payment reliability summary.
3. Landlord sees score band, trend, and verification timestamp.

## 8. Functional Requirements
### FR-1 Dashboard
- Show hero RentScore gauge with tier label and trend.
- Show three stat cards: On-time payments, Total rent recorded, Loan eligibility.
- Show recent Payment Certificate cards (last 6).
- Show CTA hierarchy: Pay Rent (primary), View Credit Report (secondary).

### FR-2 Pay Rent
- Lease selector with monthly amount and due date.
- Payment breakdown: Rent, processing fee, total.
- Confirmation modal with success animation and payment certificate summary.
- Error handling for insufficient balance, network mismatch, transaction timeout.

### FR-3 Payment History
- Table of all payment records with date, amount, status, tx hash, action.
- Filter by status, year, lease.
- Export CSV.
- Each row links to certificate detail drawer.

### FR-4 My RentScore
- Full gauge and score tier explanation.
- Score factors panel: count, consistency, amount tier, tenure, late penalties.
- 12-month score trend chart.
- What improves your score panel with next milestones.

### FR-5 Credit Report
- Shareable summary for landlord or lending partner.
- Includes score snapshot, payment reliability ratio, average monthly rent, tenure.
- Generate secure link with expiration controls.

### FR-6 Loans
- Four tier cards with eligibility criteria and offer terms.
- Locked tiers show required score gap and estimated time to unlock.
- Eligible tiers support request flow.
- Active loan card shows principal, APR, next due date, and repayment status.

### FR-7 Transactions
- Unified ledger for payment, certificate, score snapshot, loan events.
- Status pills, explorer links, copy hash behavior.
- Filter by event type and date range.

## 9. RentScore Specification
### Scale and Tier Mapping
- 0-299: Building Credit (red)
- 300-449: Credit Starter (amber)
- 450-599: Credit Builder (orange)
- 600-699: Credit Established (green)
- 700-850: Credit Trusted (navy)

### Score Formula (MVP)
```
base = 150
on_time_points = min(on_time_count * 30, 300)
consistency_bonus = 50 if last_6_all_on_time else 0
amount_points = 50 if avg_rent >= 1500
             = 30 if avg_rent >= 800
             = 10 otherwise
tenure_points = 50 if tenure_months >= 12
             = 25 if tenure_months >= 6
             = 0 otherwise
late_penalty = late_count * 15
score = clamp(base + on_time_points + consistency_bonus + amount_points + tenure_points - late_penalty, 0, 850)
```

### Eligibility Defaults
- Tier 1 loan minimum score: 450
- Tier 2 loan minimum score: 550
- Tier 3 loan minimum score: 650
- Tier 4 loan minimum score: 725

## 10. REST API Contracts
### POST /api/v1/leases
Create a lease relationship.

Request:
```json
{
  "tenantAccountId": "acc_01HQP7S1A9",
  "landlordName": "Marcus Williams",
  "landlordAccountAddress": "0x9D82...A11F",
  "monthlyRentUsd": 1850,
  "currency": "USD",
  "dueDay": 5,
  "startDate": "2026-03-01"
}
```
Response 201:
```json
{
  "leaseId": "lease_7f31",
  "status": "ACTIVE",
  "createdAt": "2026-03-06T08:15:00Z"
}
```

### POST /api/v1/payments/initiate
Start payment transaction.

Request:
```json
{
  "leaseId": "lease_7f31",
  "payerAccountId": "acc_01HQP7S1A9",
  "amountUsd": 1850,
  "processingFeeUsd": 4.5,
  "dueDate": "2026-04-05"
}
```
Response 202:
```json
{
  "paymentIntentId": "pay_91A1",
  "status": "PENDING_ONCHAIN",
  "estimatedConfirmationSeconds": 25
}
```

### POST /api/v1/payments/webhook/mock
Mock callback for demo environment.

Request:
```json
{
  "paymentIntentId": "pay_91A1",
  "networkStatus": "CONFIRMED",
  "txHash": "0x7f29ab81c8d4b8a7c4d9f0b1e2f1c2c877b4f1021b0d8f9a5aeb117cbad9012d",
  "confirmedAt": "2026-03-06T08:16:02Z"
}
```
Response 200:
```json
{
  "paymentRecordId": "pr_4481",
  "certificateTokenId": "1024",
  "scoreDelta": 18,
  "newScore": 612
}
```

### GET /api/v1/rentscore/:accountId
Response 200:
```json
{
  "accountId": "acc_01HQP7S1A9",
  "score": 612,
  "tier": "CREDIT_ESTABLISHED",
  "asOf": "2026-03-06T08:16:05Z",
  "factors": {
    "onTimePayments": 12,
    "latePayments": 1,
    "tenureMonths": 13,
    "avgRentUsd": 1825
  },
  "nextTierTarget": 700,
  "pointsToNextTier": 88
}
```

### GET /api/v1/payments/:accountId
Response 200:
```json
{
  "items": [
    {
      "paymentRecordId": "pr_4481",
      "month": "March 2026",
      "amountUsd": 1850,
      "status": "ON_TIME",
      "txHash": "0x7f29ab...012d",
      "certificateTokenId": "1024"
    }
  ],
  "total": 13
}
```

### POST /api/v1/loans/eligibility
Request:
```json
{
  "accountId": "acc_01HQP7S1A9",
  "requestedTier": "TIER_2"
}
```
Response 200:
```json
{
  "eligible": true,
  "score": 612,
  "requiredScore": 550,
  "maxAmountUsd": 2500,
  "apr": 18.0,
  "tenorMonths": 6
}
```

### POST /api/v1/loans/request
Request:
```json
{
  "accountId": "acc_01HQP7S1A9",
  "tier": "TIER_2",
  "amountUsd": 2200
}
```
Response 201:
```json
{
  "loanId": "loan_82P1",
  "status": "ACTIVE",
  "principalUsd": 2200,
  "apr": 18.0,
  "nextInstallmentDate": "2026-04-10"
}
```

### GET /api/v1/transactions/:accountId
Response 200:
```json
{
  "items": [
    {
      "eventId": "evt_1191",
      "eventType": "PAYMENT_CONFIRMED",
      "status": "SUCCESS",
      "timestamp": "2026-03-06T08:16:02Z",
      "txHash": "0x7f29ab...012d",
      "explorerUrl": "https://explorer.creditcoin.network/tx/0x7f29ab81c8d4..."
    }
  ],
  "total": 47
}
```

## 11. Smart Contract Interface Contracts
All contracts are specified for EVM-compatible Creditcoin testnet.

### EscrowContract
Functions:
- `depositRent(bytes32 leaseId, uint256 amountUsdCents)`
- `releaseFunds(bytes32 leaseId, bytes32 paymentIntentId)`
- `getLease(bytes32 leaseId)`

Events:
- `event RentDeposited(bytes32 indexed leaseId, address indexed tenant, uint256 amountUsdCents, bytes32 paymentIntentId)`
- `event FundsReleased(bytes32 indexed leaseId, address indexed landlord, uint256 amountUsdCents, bytes32 paymentIntentId)`

### PaymentRecordNFT (UI: Payment Certificate)
Functions:
- `mintCertificate(address tenant, bytes32 paymentRecordId, uint256 amountUsdCents, uint8 statusCode)`
- `getPaymentHistory(address tenant)`
- `tokenURI(uint256 tokenId)`

Events:
- `event CertificateIssued(uint256 indexed tokenId, address indexed tenant, bytes32 indexed paymentRecordId, uint256 amountUsdCents, uint8 statusCode)`

### RentScoreReader
Functions:
- `getScore(address tenant)`
- `getPaymentCount(address tenant)`
- `isEligible(address tenant, uint8 loanTier)`

Events:
- `event ScoreSnapshotStored(address indexed tenant, uint16 score, bytes32 snapshotId)`

### LoanGateway
Functions:
- `requestLoan(uint8 tier, uint256 amountUsdCents)`
- `repayLoan(bytes32 loanId, uint256 amountUsdCents)`
- `getLoanStatus(bytes32 loanId)`

Events:
- `event LoanRequested(bytes32 indexed loanId, address indexed tenant, uint8 tier, uint256 amountUsdCents)`
- `event LoanActivated(bytes32 indexed loanId, address indexed tenant, uint256 principalUsdCents, uint16 aprBps)`
- `event LoanRepaid(bytes32 indexed loanId, address indexed tenant, uint256 amountUsdCents)`

### LeaseRegistry
Functions:
- `registerLease(address tenant, address landlord, uint256 monthlyRentUsdCents, uint8 dueDay)`
- `getLease(bytes32 leaseId)`

Events:
- `event LeaseRegistered(bytes32 indexed leaseId, address indexed tenant, address indexed landlord, uint256 monthlyRentUsdCents, uint8 dueDay)`

## 12. Type Definitions
```ts
export interface Account {
  accountId: string;
  fullName: string;
  accountAddress: string;
  network: "CTC_TESTNET" | "CTC_MAINNET";
  createdAt: string;
}

export interface Lease {
  leaseId: string;
  tenantAccountId: string;
  landlordName: string;
  landlordAccountAddress: string;
  monthlyRentUsd: number;
  dueDay: number;
  startDate: string;
  status: "ACTIVE" | "PAUSED" | "ENDED";
}

export interface PaymentRecord {
  paymentRecordId: string;
  leaseId: string;
  month: string;
  amountUsd: number;
  status: "ON_TIME" | "LATE";
  txHash: string;
  certificateTokenId: string;
  confirmedAt: string;
}

export interface RentScoreSnapshot {
  accountId: string;
  score: number;
  tier: "BUILDING_CREDIT" | "CREDIT_STARTER" | "CREDIT_BUILDER" | "CREDIT_ESTABLISHED" | "CREDIT_TRUSTED";
  pointsToNextTier: number;
  asOf: string;
}

export interface LoanOffer {
  tier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";
  minScore: number;
  maxAmountUsd: number;
  apr: number;
  tenorMonths: number;
  state: "LOCKED" | "ELIGIBLE" | "ACTIVE";
}

export interface Loan {
  loanId: string;
  accountId: string;
  tier: "TIER_1" | "TIER_2" | "TIER_3" | "TIER_4";
  principalUsd: number;
  apr: number;
  disbursedAt: string;
  nextInstallmentDate: string;
  status: "ACTIVE" | "PAID" | "DEFAULTED";
}

export interface TransactionEvent {
  eventId: string;
  eventType: "PAYMENT_CONFIRMED" | "CERTIFICATE_ISSUED" | "SCORE_SNAPSHOT" | "LOAN_REQUESTED" | "LOAN_REPAID";
  status: "SUCCESS" | "PENDING" | "FAILED";
  timestamp: string;
  txHash?: string;
  explorerUrl?: string;
}

export interface Notification {
  notificationId: string;
  accountId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
```

## 13. UI to Data Mapping Contracts
| Screen | Required Data | Source APIs | Required Contracts |
|---|---|---|---|
| Dashboard | score, tier, recent payments, eligibility summary | `GET /rentscore`, `GET /payments`, `POST /loans/eligibility` | RentScoreReader, PaymentRecordNFT |
| Pay Rent | active lease, fee calc, payment intent status | `POST /leases`, `POST /payments/initiate`, `POST /payments/webhook/mock` | EscrowContract, LeaseRegistry |
| Payment History | payment rows, certificate ids, tx links | `GET /payments`, `GET /transactions` | PaymentRecordNFT |
| My RentScore | score factors, trend points, tier map | `GET /rentscore` | RentScoreReader |
| Credit Report | summary metrics, share token metadata | `GET /rentscore`, `GET /payments` | RentScoreReader, PaymentRecordNFT |
| Loans | tier cards, eligibility, active loan details | `POST /loans/eligibility`, `POST /loans/request` | LoanGateway, RentScoreReader |
| Transactions | event ledger, tx hash, explorer links | `GET /transactions` | EscrowContract, PaymentRecordNFT, LoanGateway |

## 14. Acceptance Criteria
- AC-1: User can create a lease and complete payment flow end-to-end with confirmation.
- AC-2: Each confirmed payment creates a Payment Certificate and transaction hash record.
- AC-3: RentScore updates within 30 seconds of payment confirmation.
- AC-4: Loans screen accurately reflects lock/eligible/active states based on score.
- AC-5: Share-link credit report hides direct account address by default.
- AC-6: Every core screen displays realistic USD data and date values.
- AC-7: UI copy passes terminology compliance checks.

## 15. QA and Validation Test Suite
1. Terminology compliance test: no banned slang in user-facing text.
2. Visual token compliance test against UI spec tokens.
3. Layout width test at 1280, 1440, and 1600 px.
4. Data realism test: names, dates, USD amounts are non-placeholder.
5. RentScore vector tests across all five tiers and boundary values.
6. API schema test: no orphan UI field without contract source.
7. Demo reproducibility test: full path in <= 8 minutes.

## 16. Global Risks and Mitigations
- Testnet instability: maintain backup seeded transaction set and prerecorded backup segment.
- Country-specific legal variance: keep MVP testnet-only and avoid production lending claims.
- User trust barrier: emphasize readable payment evidence and clear score explanation.
- Data privacy concerns: default to masked account display and expiring share links.

## 17. Dependencies
- Creditcoin testnet availability
- EVM RPC access and explorer links
- Secure backend for score calculator and webhook simulation
- Frontend hosting for judge demo

## 18. Sign-off Checklist
- [ ] Global language complete, no country-only framing
- [ ] All required API and contract interfaces included
- [ ] Core 7 screens fully covered
- [ ] RentScore logic and tier thresholds defined
- [ ] Acceptance criteria and QA tests complete
- [ ] Demo runbook aligned with this PRD
