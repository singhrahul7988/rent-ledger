# RentLedger Contracts

## Included contracts
- `LeaseRegistry.sol`
- `PaymentRecordNFT.sol` (soulbound payment certificates)
- `EscrowContract.sol`
- `RentScoreReader.sol`
- `LoanGateway.sol`

## Setup
```bash
cd contracts
npm install
```

## Compile
```bash
npm run compile
```

## Test
```bash
npm run test
```

## Deploy to CTC testnet
1. Copy `.env.example` to `.env` and fill values.
2. Run:
```bash
npm run deploy:testnet
```

## Run a live demo flow on testnet
After deployment, set contract addresses in `.env`:
- `LEASE_REGISTRY_ADDRESS`
- `ESCROW_CONTRACT_ADDRESS`

Then run:
```bash
npm run demo:flow
```

This script:
1. registers a demo lease
2. deposits rent through escrow
3. prints explorer links for both transactions
