import "dotenv/config";
import express from "express";
import cors from "cors";
import { leasesRouter } from "./routes/leases.js";
import { paymentsRouter } from "./routes/payments.js";
import { rentScoreRouter } from "./routes/rentscore.js";
import { loansRouter } from "./routes/loans.js";
import { transactionsRouter } from "./routes/transactions.js";
import { tenantsRouter } from "./routes/tenants.js";
import { BlockchainService } from "./services/blockchainService.js";

const app = express();
const port = Number(process.env.PORT || 8080);
const blockchainService = new BlockchainService(process.env.BLOCKCHAIN_MODE);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "rentledger-backend",
    blockchainMode: blockchainService.getMode()
  });
});

app.use("/api/v1/leases", leasesRouter());
app.use("/api/v1/payments", paymentsRouter(blockchainService));
app.use("/api/v1/rentscore", rentScoreRouter());
app.use("/api/v1/loans", loansRouter(blockchainService));
app.use("/api/v1/transactions", transactionsRouter());
app.use("/api/v1/tenants", tenantsRouter());

app.listen(port, () => {
  console.log(`rentledger-backend listening on port ${port}`);
});
