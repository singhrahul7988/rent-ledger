# RentLedger Backend

Express + TypeScript backend for RentLedger API contracts.

## Setup
```bash
cd backend
npm install
```

## Run (development)
```bash
npm run dev
```

## Build
```bash
npm run build
```

## Environment
Copy `.env.example` to `.env`.

`BLOCKCHAIN_MODE=mock` is enabled by default so APIs are usable without live chain credentials.

## API base
`/api/v1`

## Implemented routes
- `POST /leases`
- `POST /payments/initiate`
- `POST /payments/webhook/mock`
- `GET /payments/:accountId`
- `GET /rentscore/:accountId`
- `POST /loans/eligibility`
- `POST /loans/request`
- `GET /transactions/:accountId`
