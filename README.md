# RentLedger

RentLedger is a desktop-first web platform that converts verified rent payments into a RentScore (0-850) and unlocks fair-rate loan eligibility.

This repository contains:
- React + Vite frontend (`/src`)
- Express + TypeScript backend APIs (`/backend`)
- Solidity contracts + Hardhat tests (`/contracts`)

## Current status

- Frontend dashboard is wired end-to-end to backend APIs in mock mode.
- Smart contracts compile and tests pass.
- Testnet deployment scripts are included for live on-chain proof.

## Project structure

```text
.
├─ src/                  # frontend
├─ backend/              # backend API server
├─ contracts/            # smart contracts + hardhat
├─ docs/                 # PRD, UI spec, judge runbook
├─ .env.example          # frontend env template
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

## 2) End-to-end demo flow (frontend -> backend APIs)

1. Open `/signin` and use the demo account:
   - email: `creditcoin7@gmail.com`
   - password: `credit31`
2. Go to **Pay Rent** and click **Record Payment**.
3. Verify updates in:
   - Dashboard (score + payment certificate cards)
   - Payment History
   - Transactions
   - Loans eligibility

Frontend API client is in:
- `src/lib/apiClient.js`

## 3) API endpoints currently used

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

## 4) Deploy smart contracts to Creditcoin testnet

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

## 5) Get Creditcoin testnet tokens (manual step)

Use official docs:
- Faucet guide: https://docs.creditcoin.org/getting-started/testnet#3-get-testnet-tokens-from-faucet

Typical flow:
1. Join Creditcoin Discord.
2. Open the faucet channel.
3. Run faucet command with your wallet address.
4. Confirm balance on explorer.

## 6) Free deployment options (recommended)

## Frontend: Vercel (Hobby)

1. Import repo in Vercel.
2. Framework: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set env:
   - `VITE_API_BASE_URL=https://<your-backend-domain>`
   - `VITE_DEMO_ACCOUNT_ID=acc_01HQP7S1A9`

Vercel docs:
- https://vercel.com/docs/plans/hobby

## Backend: Render (free tier options)

1. Create a new Web Service from this repo.
2. Root directory: `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Env vars:
   - `PORT=8080`
   - `BLOCKCHAIN_MODE=mock`
   - `EXPLORER_BASE_URL=https://creditcoin-testnet.blockscout.com/tx/`

Render docs:
- https://render.com/docs/free

## 7) Manual setup checklist before submission

- Deploy contracts and save explorer links.
- Deploy backend and frontend URLs.
- Update hackathon submission form with:
  - repo URL
  - live demo URL
  - video URL
  - contract addresses + explorer proof

## Notes

- Backend blockchain mode defaults to `mock` for stable demo UX.
- For judge proof, use the contract testnet deployment + `demo:flow` tx links.
- Dashboard notifications surface key events (payment, loan, score and error alerts) for judge visibility.
