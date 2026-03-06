import { randomUUID } from "crypto";
import { Contract, JsonRpcProvider, Wallet, ethers } from "ethers";

type BlockchainMode = "mock" | "live";

type LiveConfig = {
  provider: JsonRpcProvider;
  signer: Wallet;
  leaseRegistry: Contract;
  escrow: Contract;
  paymentRecordNFT: Contract;
  defaultLandlordAddress: string;
  defaultNativeValueEth: string;
};

const leaseRegistryAbi = [
  "event LeaseRegistered(bytes32 indexed leaseId,address indexed tenant,address indexed landlord,uint256 monthlyRentUsdCents,uint8 dueDay)",
  "function registerLease(address tenant,address landlord,uint256 monthlyRentUsdCents,uint8 dueDay) returns (bytes32)"
];

const escrowAbi = [
  "event RentDeposited(bytes32 indexed leaseId,address indexed tenant,uint256 amountUsdCents,bytes32 paymentRecordId)",
  "function depositRent(bytes32 leaseId,uint256 amountUsdCents,uint8 statusCode,bytes32 txRef) payable returns (bytes32 paymentRecordId,uint256 tokenId)"
];

const paymentRecordNftAbi = [
  "event CertificateIssued(uint256 indexed tokenId,address indexed tenant,bytes32 indexed paymentRecordId,bytes32 leaseId,uint256 amountUsdCents,uint8 statusCode)"
];

function toUsdCents(amountUsd: number): bigint {
  const safe = Number.isFinite(amountUsd) ? amountUsd : 0;
  return BigInt(Math.round(Math.max(0, safe) * 100));
}

function toSafeDueDay(dueDay: number): number {
  const candidate = Math.round(Number(dueDay || 5));
  if (candidate < 1) return 1;
  if (candidate > 28) return 28;
  return candidate;
}

function firstSetEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (value && value.trim()) return value.trim();
  }
  return "";
}

export class BlockchainService {
  private readonly mode: BlockchainMode;
  private readonly liveConfig: LiveConfig | null;

  constructor(mode: string | undefined) {
    this.mode = mode === "live" ? "live" : "mock";
    this.liveConfig = this.mode === "live" ? this.createLiveConfig() : null;
  }

  getMode(): BlockchainMode {
    return this.mode;
  }

  private createLiveConfig(): LiveConfig {
    const rpcUrl = firstSetEnv("CTC_RPC_URL");
    const privateKey = firstSetEnv("BACKEND_WALLET_PRIVATE_KEY", "DEPLOYER_PRIVATE_KEY");
    const escrowAddress = firstSetEnv("ESCROW_CONTRACT_ADDRESS");
    const leaseRegistryAddress = firstSetEnv("LEASE_REGISTRY_ADDRESS");
    const paymentRecordNftAddress = firstSetEnv("PAYMENT_RECORD_NFT_ADDRESS");
    const defaultLandlordAddress = firstSetEnv("DEMO_LANDLORD_ADDRESS");
    const defaultNativeValueEth = firstSetEnv("DEMO_NATIVE_VALUE") || "0.0001";

    if (!rpcUrl || !privateKey || !escrowAddress || !leaseRegistryAddress || !paymentRecordNftAddress) {
      throw new Error(
        "live blockchain mode missing env vars: CTC_RPC_URL, BACKEND_WALLET_PRIVATE_KEY|DEPLOYER_PRIVATE_KEY, LEASE_REGISTRY_ADDRESS, ESCROW_CONTRACT_ADDRESS, PAYMENT_RECORD_NFT_ADDRESS"
      );
    }

    if (!ethers.isAddress(escrowAddress) || !ethers.isAddress(leaseRegistryAddress) || !ethers.isAddress(paymentRecordNftAddress)) {
      throw new Error("live blockchain mode contract address format is invalid");
    }

    const provider = new JsonRpcProvider(rpcUrl);
    const signer = new Wallet(privateKey, provider);
    const leaseRegistry = new Contract(leaseRegistryAddress, leaseRegistryAbi, signer);
    const escrow = new Contract(escrowAddress, escrowAbi, signer);
    const paymentRecordNFT = new Contract(paymentRecordNftAddress, paymentRecordNftAbi, signer);

    const fallbackLandlord = ethers.isAddress(defaultLandlordAddress) ? defaultLandlordAddress : signer.address;

    return {
      provider,
      signer,
      leaseRegistry,
      escrow,
      paymentRecordNFT,
      defaultLandlordAddress: fallbackLandlord,
      defaultNativeValueEth,
    };
  }

  private requireLiveConfig(): LiveConfig {
    if (!this.liveConfig) {
      throw new Error("live blockchain mode not configured yet");
    }
    return this.liveConfig;
  }

  async recordPaymentOnChain(params: {
    leaseId: string;
    amountUsd: number;
    statusCode: 1 | 2;
    dueDay: number;
    monthlyRentUsd: number;
    landlordAccountAddress?: string;
    onchainLeaseId?: string;
  }): Promise<{
    txHash: string;
    tokenId: string;
    paymentRecordId: string;
    onchainLeaseId?: string;
    leaseRegistrationTxHash?: string;
  }> {
    if (this.mode === "mock") {
      return {
        txHash: `0x${randomUUID().replace(/-/g, "").slice(0, 16)}...${randomUUID()
          .replace(/-/g, "")
          .slice(0, 4)}`,
        tokenId: Math.floor(Math.random() * 9000 + 1000).toString(),
        paymentRecordId: `pr_${randomUUID().slice(0, 8)}`,
      };
    }

    const live = this.requireLiveConfig();
    const landlordAddress = ethers.isAddress(params.landlordAccountAddress || "")
      ? String(params.landlordAccountAddress)
      : live.defaultLandlordAddress;

    let leaseRegistrationTxHash = "";
    let onchainLeaseId = params.onchainLeaseId || "";

    if (!/^0x[0-9a-fA-F]{64}$/.test(onchainLeaseId)) {
      const registerTx = await live.leaseRegistry.registerLease(
        live.signer.address,
        landlordAddress,
        toUsdCents(params.monthlyRentUsd || params.amountUsd),
        toSafeDueDay(params.dueDay)
      );
      const registerReceipt = await registerTx.wait();
      if (!registerReceipt) {
        throw new Error("Lease registration tx was not confirmed");
      }
      leaseRegistrationTxHash = registerTx.hash;

      let registerLog: { topics: ReadonlyArray<string>; data: string } | null = null;
      for (const log of registerReceipt.logs as Array<{ topics: ReadonlyArray<string>; data: string }>) {
        try {
          const parsed = live.leaseRegistry.interface.parseLog(log);
          if (parsed?.name === "LeaseRegistered") {
            registerLog = log;
            break;
          }
        } catch (_error) {
          // no-op
        }
      }
      if (!registerLog) {
        throw new Error("LeaseRegistered event not found");
      }

      const parsed = live.leaseRegistry.interface.parseLog(registerLog);
      onchainLeaseId = String(parsed?.args?.leaseId || "");
      if (!/^0x[0-9a-fA-F]{64}$/.test(onchainLeaseId)) {
        throw new Error("Invalid leaseId returned from chain");
      }
    }

    const txRef = ethers.id(`api-payment-${params.leaseId}-${Date.now()}`);
    const paymentTx = await live.escrow.depositRent(
      onchainLeaseId,
      toUsdCents(params.amountUsd),
      params.statusCode,
      txRef,
      {
        value: ethers.parseEther(live.defaultNativeValueEth)
      }
    );
    const paymentReceipt = await paymentTx.wait();
    if (!paymentReceipt) {
      throw new Error("Payment tx was not confirmed");
    }

    let paymentRecordId = "";
    let tokenId = "";

    for (const log of paymentReceipt.logs) {
      try {
        const parsedEscrow = live.escrow.interface.parseLog(log);
        if (parsedEscrow?.name === "RentDeposited") {
          paymentRecordId = String(parsedEscrow.args.paymentRecordId);
        }
      } catch (_error) {
        // no-op
      }

      try {
        const parsedNft = live.paymentRecordNFT.interface.parseLog(log);
        if (parsedNft?.name === "CertificateIssued") {
          tokenId = String(parsedNft.args.tokenId);
        }
      } catch (_error) {
        // no-op
      }
    }

    if (!paymentRecordId) {
      paymentRecordId = `pr_live_${paymentTx.hash.slice(2, 10)}`;
    }
    if (!tokenId) {
      tokenId = `live_${paymentTx.hash.slice(2, 8)}`;
    }

    return {
      txHash: paymentTx.hash,
      tokenId,
      paymentRecordId,
      onchainLeaseId,
      leaseRegistrationTxHash: leaseRegistrationTxHash || undefined
    };
  }

  async requestLoanOnChain(params: {
    accountId: string;
    tier: 1 | 2 | 3 | 4;
    amountUsd: number;
  }): Promise<{ txHash: string; loanId: string }> {
    if (this.mode === "live") {
      throw new Error("live loan gateway integration not configured yet");
    }

    return {
      txHash: `0x${randomUUID().replace(/-/g, "").slice(0, 16)}...${randomUUID()
        .replace(/-/g, "")
        .slice(0, 4)}`,
      loanId: `loan_${randomUUID().slice(0, 8)}`,
    };
  }
}
