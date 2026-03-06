# RentLedger Project Context Summary

Last updated: 2026-03-07

## 1) Current Project Snapshot

- Product: RentLedger (rent payment + RentScore + certificates + loan eligibility) for CTC hackathon.
- Stack:
  - Frontend: React + Vite
  - Backend: Express + TypeScript
  - Contracts: Hardhat + Solidity
- Current stage:
  - UI/UX pass is largely complete for demo.
  - Demo flow script has been run successfully by user.
  - Backend live bridge for payments is now implemented (config pending for full live run).

## 2) Major Decisions Made During This Chat Journey

1. Keep a hackathon-friendly, demo-first architecture:
- `mock` mode by default so UI works even without chain config.
- Separate upgrade path to `live` chain calls when env values are ready.

2. Use one shared demo account for judging (instead of open signup flow):
- Single login credentials hardcoded in frontend session module for demo consistency.
- Goal: judges can see one consolidated transaction history.

3. Move from static dashboard fixtures to API-driven dashboard:
- Frontend now pulls leases, payments, score, loans, transactions from backend APIs.
- "Request failed (404)" and "Failed to fetch" issues were addressed by wiring APIs and error handling.

4. Preserve fast demo momentum over deep production architecture:
- In-memory backend store retained for speed.
- Known tradeoff: data resets on backend restart.

5. Keep blockchain evidence central to submission:
- Deploy/test scripts and explorer-proof workflow preserved.
- Live bridge added so dashboard payment action can become actual on-chain write.

## 3) Major Implementations Completed

### A) Smart contracts + scripts
- Contracts implemented:
  - `LeaseRegistry.sol`
  - `EscrowContract.sol`
  - `PaymentRecordNFT.sol`
  - `RentScoreReader.sol`
  - `LoanGateway.sol`
- Scripts:
  - `contracts/scripts/deploy.js`
  - `contracts/scripts/demo-flow.js`
- Hardhat setup and command flow verified.

### B) Backend API and services
- API routes implemented:
  - `POST /api/v1/leases`
  - `GET /api/v1/leases/:accountId`
  - `POST /api/v1/payments/initiate`
  - `POST /api/v1/payments/webhook/mock`
  - `GET /api/v1/payments/:accountId`
  - `GET /api/v1/rentscore/:accountId`
  - `GET /api/v1/loans/:accountId`
  - `POST /api/v1/loans/eligibility`
  - `POST /api/v1/loans/request`
  - `GET /api/v1/transactions/:accountId`
- Added robust frontend-facing error messages for 404/timeouts.
- Added `ethers` dependency and live payment bridge logic:
  - live config loads RPC + private key + deployed contract addresses.
  - registers lease on-chain if no `onchainLeaseId` exists.
  - calls escrow `depositRent` on-chain.
  - parses tx logs for payment record/certificate.
- Landlord override support added:
  - API accepts `landlordAccountAddress` from UI.
  - valid input overrides fallback `DEMO_LANDLORD_ADDRESS`.

### C) Frontend dashboard + UX
- Added/updated dynamic profile menu with Sign Out in top-right.
- Added dynamic notifications panel:
  - first-payment reminder
  - score update notices
  - transaction-based notices with explorer links
- Pay Rent page made dynamic:
  - editable lease name, landlord, landlord wallet address, notes, rent amount.
  - amount handling and x.00 normalization.
  - reset behavior improved.
  - form state persisted in session storage so values remain when switching tabs.
- Credit Report page upgraded:
  - Generate share link with loading state.
  - link options: expiration (24h/7d/14d/21d/30d), access scope, allow download, one-time link.
  - generated link shown in report card.
  - copy/open behavior and one-time consumption behavior.
  - export PDF implemented (client-side PDF blob generation).
- My RentScore page updates:
  - Improve My Score routes user to Pay Rent.
  - Download Score Report now exports PDF.
  - trend/factor panels reworked per design feedback.
- Loans page updates:
  - removed duplicate static lock labeling.
  - "Repay Installment" -> "Pay Next Installment".
  - Loan Terms buttons added; smooth scroll to Loan Terms section.
  - APR comparison styling improved.
- Settings page updates:
  - notification preferences now interactive.
  - Save Preferences persists to local storage and restores correctly.
- Visual refinements implemented across dashboard:
  - profile/notification overlap handling and spacing fixes.
  - card and section alignment refinements.
  - side-nav heading colors updated.
  - icon updates for settings and loans.
  - status color coding for connected services/system status.
  - branding text corrected to "Creditcoin".

### D) Auth/demo account behavior
- Sign-in flow now enforces a single demo account.
- Demo credentials rendered in sign-in helper box for judges.
- Session user persisted via local storage.

## 4) What Demo Mode vs Live Mode Means (Important)

### Demo/mock mode (`BLOCKCHAIN_MODE=mock`)
- Dashboard payment API does not perform real chain transaction.
- Backend returns simulated tx IDs / records for smooth demo UX.
- Fast and stable for UI demo.

### Live mode (`BLOCKCHAIN_MODE=live`)
- Dashboard payment API performs real contract writes on CTC testnet.
- Requires valid RPC, wallet key, and deployed contract addresses.
- Returns real tx hash/log-derived IDs.

### Why confusion happened
- `contracts/scripts/demo-flow.js` can still create real on-chain transactions even if backend is in mock mode.
- So "demo flow worked" can be true while dashboard API payments are still mock.

## 5) Build/Test Status (Latest)

- Frontend build: PASS (`npm run build`)
- Backend build: PASS (`cd backend && npm run build`)
- Root/backend `npm run test`: no test script currently for those packages.
- Contract tests/scripts exist under `contracts` and were part of earlier validation flow.

## 6) Environment + Secrets Status

- `.env.example` files exist for root/backend/contracts.
- Backend currently has template file `backend/.env.example`; create `backend/.env` manually before live mode.
- Sensitive files should remain gitignored; `.env` must never be committed.
- Note: demo login credentials are intentionally hardcoded for hackathon demo convenience and must be changed before real production usage.

## 7) Known Limitations / Pending Work

1. Backend store is in-memory:
- leases/payments/transactions reset on restart.

2. Payment confirmation endpoint naming:
- route name is still `/payments/webhook/mock` though it can trigger live chain path when live mode is enabled.

3. Loan live chain integration:
- payment live path implemented.
- loan live gateway path still not implemented.

4. Security hardening pending:
- demo credentials exposed in UI.
- no robust auth provider / token auth yet.

5. Automated test coverage:
- frontend/backend test scripts are minimal/not yet formalized outside contracts package.

## 8) Live Bridge Go-Live Checklist (Next)

1. Create `backend/.env` from `backend/.env.example`.
2. Fill values:
- `BLOCKCHAIN_MODE=live`
- `CTC_RPC_URL`
- `BACKEND_WALLET_PRIVATE_KEY` (or `DEPLOYER_PRIVATE_KEY`)
- `LEASE_REGISTRY_ADDRESS`
- `ESCROW_CONTRACT_ADDRESS`
- `PAYMENT_RECORD_NFT_ADDRESS`
- Optional fallback: `DEMO_LANDLORD_ADDRESS`
- Optional tx value tuning: `DEMO_NATIVE_VALUE`
3. Fund backend wallet with CTC testnet faucet tokens.
4. Run backend + frontend.
5. Submit payment from Pay Rent page with explicit `Landlord Wallet Address`.
6. Verify tx hash on explorer and capture proof links for submission.

## 9) Practical FAQ Notes for Next Session

- "Does Pay Rent in UI write on-chain now?"
  - Yes, if backend is `live` and env is correctly configured.
  - No, if backend is `mock`.

- "Do I need landlord address in form?"
  - Recommended yes. It is now supported and overrides fallback landlord.

- "Do I pay real money?"
  - No for hackathon flow. Use faucet-provided testnet funds.

- "Can judges see blockchain proof?"
  - Yes, via tx hashes and explorer links generated from live transactions / demo flow.

## 10) Priority Next Actions

1. Create and fill `backend/.env` for live mode.
2. Run one end-to-end live payment from UI and verify explorer link.
3. Capture final addresses + tx links in README/submission notes.
4. Keep mock fallback available for demo reliability in case of RPC instability.
