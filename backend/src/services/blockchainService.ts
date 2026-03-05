import { randomUUID } from "crypto";

type BlockchainMode = "mock" | "live";

export class BlockchainService {
  private readonly mode: BlockchainMode;

  constructor(mode: string | undefined) {
    this.mode = mode === "live" ? "live" : "mock";
  }

  getMode(): BlockchainMode {
    return this.mode;
  }

  async recordPaymentOnChain(params: {
    leaseId: string;
    amountUsd: number;
    statusCode: 1 | 2;
  }): Promise<{ txHash: string; tokenId: string; paymentRecordId: string }> {
    if (this.mode === "live") {
      // Hook ethers.js contract calls here when CTC RPC + keys are configured.
      throw new Error("live blockchain mode not configured yet");
    }

    return {
      txHash: `0x${randomUUID().replace(/-/g, "").slice(0, 16)}...${randomUUID()
        .replace(/-/g, "")
        .slice(0, 4)}`,
      tokenId: Math.floor(Math.random() * 9000 + 1000).toString(),
      paymentRecordId: `pr_${randomUUID().slice(0, 8)}`,
    };
  }

  async requestLoanOnChain(params: {
    accountId: string;
    tier: 1 | 2 | 3 | 4;
    amountUsd: number;
  }): Promise<{ txHash: string; loanId: string }> {
    if (this.mode === "live") {
      throw new Error("live blockchain mode not configured yet");
    }

    return {
      txHash: `0x${randomUUID().replace(/-/g, "").slice(0, 16)}...${randomUUID()
        .replace(/-/g, "")
        .slice(0, 4)}`,
      loanId: `loan_${randomUUID().slice(0, 8)}`,
    };
  }
}
