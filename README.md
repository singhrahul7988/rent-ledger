# RentLedger

RentLedger is a desktop-first web platform that converts verified rent payments into a RentScore (0-850) and unlocks fair-rate loan eligibility.

This repository contains:
- React + Vite frontend (`/src`)
- Express + TypeScript backend APIs (`/backend`)
- Solidity contracts + Hardhat tests (`/contracts`)

## Current status

- Frontend dashboard is wired end-to-end to backend APIs.
- Backend supports:
  - `mock` mode (stable demo, no real chain write)
  - `live` mode (real on-chain payment writes from dashboard)
- Smart contracts compile and tests pass.
- Testnet deployment scripts are included for live on-chain proof.

## Project structure

```text
.
|- src/                  # frontend
|- backend/              # backend API server
|- contracts/            # smart contracts + hardhat
|- docs/                 # PRD, UI spec, judge runbook
|- .env.example          # frontend env template
```

## 1) Local setup

Open 3 terminals.

### A. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs on `http://localhost:8080`.
Default mode is `mock` unless you set `BLOCKCHAIN_MODE=live`.

Quick check:
```bash
curl http://localhost:8080/health
```
You should see `"blockchainMode":"mock"` or `"blockchainMode":"live"`.

### B. Frontend

```bash
cd .
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

### C. Contracts (optional local verification)

```bash
cd contracts
npm install
npm run test
```

## 2) Switch backend to live mode (real on-chain dashboard payments)

Use this when you want **Pay Rent from UI** to create real testnet transactions.

1. Make sure contracts are deployed first (see section 5).
2. In `backend/.env`, set:

```env
BLOCKCHAIN_MODE=live
CTC_RPC_URL=<your_ctc_testnet_rpc>
BACKEND_WALLET_PRIVATE_KEY=<test_wallet_private_key>
LEASE_REGISTRY_ADDRESS=<deployed_lease_registry>
ESCROW_CONTRACT_ADDRESS=<deployed_escrow_contract>
PAYMENT_RECORD_NFT_ADDRESS=<deployed_payment_record_nft>
DEMO_LANDLORD_ADDRESS=<fallback_landlord_wallet_optional>
DEMO_NATIVE_VALUE=0.0001
EXPLORER_BASE_URL=https://creditcoin-testnet.blockscout.com/tx/
```

3. Restart backend:
```bash
cd backend
npm run dev
```
4. Verify mode:
```bash
curl http://localhost:8080/health
```
Expected: `"blockchainMode":"live"`.

## 3) End-to-end app flow (frontend -> backend APIs)

1. Open `/signin` and use the demo account:
   - email: `creditcoin7@gmail.com`
   - password: `credit31`
2. Go to **Pay Rent** and fill:
   - Lease Name
   - Landlord Name
   - Landlord Wallet Address (`0x...`)
   - Rent Amount
3. Click **Record Payment**.
4. Verify updates in:
   - Dashboard (score + payment certificate cards)
   - Payment History
   - Transactions
   - Loans eligibility
5. Verify blockchain tx:
   - Open **Transactions** page
   - Click explorer link on the event row
   - Or open directly:
     - `https://creditcoin-testnet.blockscout.com/tx/<txHash>`

Notes:
- In `mock` mode, tx hashes are simulated.
- In `live` mode, tx hashes are real testnet tx hashes.

Frontend API client is in:
- `src/lib/apiClient.js`

## 4) API endpoints currently used

Base: `/api/v1`

- `GET /leases/:accountId`
- `POST /leases`
- `POST /payments/initiate`
- `POST /payments/webhook/mock`
- `GET /payments/:accountId`
- `GET /rentscore/:accountId`
- `GET /loans/:accountId`
- `POST /loans/eligibility`
- `POST /loans/request`
- `GET /transactions/:accountId`

## 5) Deploy smart contracts to Creditcoin testnet

### Prerequisites

- A wallet private key for deployment (test wallet only)
- CTC testnet RPC details and chain info from Creditcoin docs:
  - https://docs.creditcoin.org/network-information

### Deploy

```bash
cd contracts
cp .env.example .env
# fill CTC_RPC_URL + DEPLOYER_PRIVATE_KEY
npm install
npm run deploy:testnet
```

Copy printed addresses into `contracts/.env`:
- `LEASE_REGISTRY_ADDRESS`
- `ESCROW_CONTRACT_ADDRESS`
- `PAYMENT_RECORD_NFT_ADDRESS`
- `RENTSCORE_READER_ADDRESS`
- `LOAN_GATEWAY_ADDRESS`

### Generate live on-chain proof transactions

```bash
cd contracts
npm run demo:flow
```

This script registers a lease and records a rent payment on-chain, then prints explorer links.

## 6) Get Creditcoin testnet tokens (manual step)

Use official docs:
- Faucet guide: https://docs.creditcoin.org/getting-started/testnet#3-get-testnet-tokens-from-faucet

Typical flow:
1. Join Creditcoin Discord.
2. Open the faucet channel.
3. Run faucet command with your wallet address.
4. Confirm balance on explorer.

## 7) Free deployment options (recommended)

### Frontend: Vercel (Hobby)

1. Import repo in Vercel.
2. Framework: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
   - `VITE_DEMO_ACCOUNT_ID=acc_01HQP7S1A9`

Vercel docs:
- https://vercel.com/docs/plans/hobby

### Backend: Render (free tier options)

1. Create a new Web Service from this repo.
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Env vars:
   - `PORT=8080`
   - `BLOCKCHAIN_MODE=live` (or `mock` for fallback demo mode)
   - `CTC_RPC_URL`
   - `BACKEND_WALLET_PRIVATE_KEY`
   - `LEASE_REGISTRY_ADDRESS`
   - `ESCROW_CONTRACT_ADDRESS`
   - `PAYMENT_RECORD_NFT_ADDRESS`
   - `DEMO_LANDLORD_ADDRESS` (optional)
   - `DEMO_NATIVE_VALUE=0.0001`
   - `EXPLORER_BASE_URL=https://creditcoin-testnet.blockscout.com/tx/`

Render docs:
- https://render.com/docs/free

## 8) Manual setup checklist before submission

- Deploy contracts and save explorer links.
- Deploy backend and frontend URLs.
- Update hackathon submission form with:
  - repo URL
  - live demo URL
  - video URL
- contract addresses + explorer proof

## Notes

- Backend defaults to `mock` unless `BLOCKCHAIN_MODE=live`.
- For judge proof, use the contract testnet deployment + `demo:flow` tx links.
- Dashboard notifications surface key events (payment, loan, score and error alerts) for judge visibility.

