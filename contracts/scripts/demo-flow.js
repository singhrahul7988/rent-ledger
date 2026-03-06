import hre from "hardhat";
const { ethers } = hre;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function main() {
  const leaseRegistryAddress = requireEnv("LEASE_REGISTRY_ADDRESS");
  const escrowAddress = requireEnv("ESCROW_CONTRACT_ADDRESS");
  const explorerBase = process.env.EXPLORER_BASE_URL || "https://creditcoin-testnet.blockscout.com/tx/";

  const [tenantSigner] = await ethers.getSigners();
  const landlordAddress = process.env.DEMO_LANDLORD_ADDRESS || tenantSigner.address;
  const rentCents = Number(process.env.DEMO_RENT_CENTS || "185000");
  const dueDay = Number(process.env.DEMO_DUE_DAY || "5");
  const nativeValue = process.env.DEMO_NATIVE_VALUE || "0.0001";

  const leaseRegistry = await ethers.getContractAt("LeaseRegistry", leaseRegistryAddress);
  const escrow = await ethers.getContractAt("EscrowContract", escrowAddress);

  console.log("Tenant:", tenantSigner.address);
  console.log("Landlord:", landlordAddress);

  const registerTx = await leaseRegistry.registerLease(
    tenantSigner.address,
    landlordAddress,
    rentCents,
    dueDay
  );
  const registerReceipt = await registerTx.wait();
  const leaseEvent = registerReceipt.logs.find((log) => log.fragment?.name === "LeaseRegistered");
  if (!leaseEvent) {
    throw new Error("LeaseRegistered event not found");
  }
  const leaseId = leaseEvent.args.leaseId;
  console.log("Lease registered:", leaseId);
  console.log("Lease tx:", `${explorerBase}${registerTx.hash}`);

  const txRef = ethers.id(`demo-flow-${Date.now()}`);
  const paymentTx = await escrow
    .connect(tenantSigner)
    .depositRent(leaseId, rentCents, 1, txRef, {
      value: ethers.parseEther(nativeValue)
    });
  await paymentTx.wait();

  console.log("Payment tx:", `${explorerBase}${paymentTx.hash}`);
  console.log("Done. Use the tx links above as proof for your demo.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
