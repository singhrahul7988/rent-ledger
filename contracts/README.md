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
npx hardhat run scripts/deploy.js --network ctcTestnet
```
