# RentLedger Judge Demo Runbook

## 1. Objective
Deliver a reliable 6-8 minute live demo that proves RentLedger can turn rent payments into verifiable credit progression and loan eligibility.

## 2. Demo Duration and Structure
- Total target: 7 minutes
- Segment A (1:00): Context and problem
- Segment B (2:30): Payment flow and certificate creation
- Segment C (2:00): RentScore update and eligibility
- Segment D (1:30): Loan request and transaction proof

## 3. Environment Setup
- Frontend running with desktop viewport >= 1440px
- Demo account preloaded with history
- Mock webhook endpoint available
- Explorer links configured for testnet tx display

## 4. Demo Account Seed Data
### Account
- Name: Sarah Chen
- Account ID: acc_01HQP7S1A9
- Account address: 0x8f21A9C3d4f4E1009F9e9e9f2c4f8D29d3A1B113
- Network badge: CTC Testnet

### Active Lease
- Lease ID: lease_7f31
- Landlord: Marcus Williams
- Monthly rent: $1,850
- Due day: 5
- Start date: March 1, 2025

### Payment History Before Demo
| Month | Amount | Status | Tx Hash |
|---|---:|---|---|
| October 2025 | $1,800 | ON TIME | 0x19ad2f2a91c01b7a654f3aa1329ed8c9a9b1123fe51a40d38a6b1122ce9a9ab1 |
| November 2025 | $1,800 | ON TIME | 0x61bcfe21cae47a73b6e8216f0a99e6b987b31f47242e1911b274c9de82ae3da2 |
| December 2025 | $1,850 | LATE | 0xae3c1164bc00fd18ef9ba4f467b3159d8c1b1e76f51376d4f41af2110a1291f4 |
| January 2026 | $1,850 | ON TIME | 0x29d7ab76c42191b2ef93dca40e91227f8ce3b77ea3f44ebdf4552d92257a40ce |
| February 2026 | $1,850 | ON TIME | 0x17f9aa11c2f9d611a78b0e301f4f80ac9fe6ef1f41e9cd3ef0d7811e11236f2e |

### Score Before Demo
- RentScore: 594
- Tier: Credit Builder
- Tier 3 threshold: 600

## 5. Primary Live Demo Script (Minute-by-Minute)
## 0:00-1:00 Intro (Dashboard)
Narration:
- "RentLedger helps renters turn verified rent payments into a credit profile that lenders can trust."
- "This account starts at RentScore 594, just below the next tier."

Actions:
1. Open Dashboard.
2. Point to hero RentScore gauge and recent certificates.
3. Highlight next milestone panel: 6 points to Credit Established.

Expected visual proof:
- Score shown as 594
- Tier badge: Credit Builder

## 1:00-3:30 Pay Rent (Pay Rent Screen)
Narration:
- "Now we complete this month payment through the automated payment system."
- "The payment is recorded and linked to a verifiable on-chain transaction."

Actions:
1. Navigate to Pay Rent.
2. Confirm lease `lease_7f31` and amount breakdown.
3. Click `Pay $1,854.50`.
4. Trigger mock webhook confirmation.
5. Wait for success state.

Expected visual proof:
- Success state with check animation
- Payment Certificate ID appears: `PR-4481`
- Tx hash appears: `0x7f29ab81c8d4...bad9012d`

## 3:30-5:30 RentScore Update (My RentScore + Payment History)
Narration:
- "That single on-time payment is now reflected in credit progression."
- "The score moved from 594 to 612, crossing into Credit Established."

Actions:
1. Open My RentScore.
2. Show updated gauge: 612.
3. Open Payment History and show March 2026 row.
4. Copy tx hash and open explorer link.

Expected visual proof:
- Score delta: +18
- March 2026 payment status: ON TIME
- Explorer link opens matching transaction

## 5:30-7:00 Loan Unlock (Loans + Transactions)
Narration:
- "Now that the threshold is crossed, new loan options unlock immediately."
- "Eligibility is driven by transparent score rules."

Actions:
1. Open Loans screen.
2. Show Tier 3 transitioned from LOCKED to ELIGIBLE.
3. Request a Tier 2 loan for $2,200.
4. Open Transactions screen to show `LOAN_REQUESTED` and `LOAN_ACTIVATED` events.

Expected visual proof:
- Eligibility card with min score satisfied
- Active loan card created
- Ledger events visible with timestamps and hashes

## 6. Mandatory Proof Checkpoints
1. Payment confirmation transaction hash is visible and copyable.
2. Payment Certificate is generated with unique ID.
3. RentScore increases and tier label updates.
4. Loan eligibility check aligns with score threshold rules.
5. Transaction ledger includes payment and loan events.

## 7. Backup Fallback Track (If Live Payment Fails)
Use seeded post-payment account snapshot: `acc_backup_612`.

### Backup Snapshot
- Precomputed score: 612
- Payment Certificate: PR-4481
- Payment tx: 0x7f29ab81c8d4b8a7c4d9f0b1e2f1c2c877b4f1021b0d8f9a5aeb117cbad9012d
- Loan activation tx: 0xb61a71fe1b4f3d2f0a11c0419ef9dd53e8bcfa33e8d9070dbb4e9df2f9d8a330

### Fallback Narrative
- "Live network confirmation can be variable on testnet, so here is the same flow from a confirmed seeded state."
- Walk Dashboard -> Payment History -> My RentScore -> Loans -> Transactions.
- Confirm all checkpoints with seeded evidence.

## 8. Judge Q&A Support Notes
### Q1: How is this different from simple payment tracking?
Answer:
- Payment records are tamper-resistant and portable.
- Score progression ties directly to objective payment behavior.
- Eligibility rules are deterministic and auditable.

### Q2: Why should renters trust this?
Answer:
- They receive verifiable payment evidence every month.
- Score factors are transparent on the My RentScore page.
- Credit progression and loan unlock requirements are explicit.

### Q3: What if user has no prior credit file?
Answer:
- Product is designed for credit-invisible users.
- Base score starts at 150 and grows with verified behavior.

## 9. Demo Operator Checklist
Before going live:
- [ ] Browser zoom 100%
- [ ] Viewport >= 1440px
- [ ] Account `acc_01HQP7S1A9` loaded
- [ ] Mock webhook endpoint responsive
- [ ] Explorer tabs pre-opened but hidden
- [ ] Backup account snapshot ready

During demo:
- [ ] Keep flow order exact: Dashboard -> Pay Rent -> My RentScore -> Payment History -> Loans -> Transactions
- [ ] Verbally call out score change numbers
- [ ] Show at least one copy hash interaction

After demo:
- [ ] Share one screenshot of before and after score
- [ ] Share one screenshot of loan eligibility transition

## 10. Pass Criteria for Internal Rehearsal
A rehearsal is considered pass only if:
- Full script completes in <= 8:00.
- All 5 proof checkpoints are demonstrated.
- No terminology violations appear in spoken script or UI.
- Fallback track is executable in <= 3:00.
