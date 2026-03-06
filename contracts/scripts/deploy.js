import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const LeaseRegistry = await ethers.getContractFactory("LeaseRegistry");
  const leaseRegistry = await LeaseRegistry.deploy();
  await leaseRegistry.waitForDeployment();

  const PaymentRecordNFT = await ethers.getContractFactory("PaymentRecordNFT");
  const paymentRecordNFT = await PaymentRecordNFT.deploy();
  await paymentRecordNFT.waitForDeployment();

  const EscrowContract = await ethers.getContractFactory("EscrowContract");
  const escrow = await EscrowContract.deploy(
    await leaseRegistry.getAddress(),
    await paymentRecordNFT.getAddress()
  );
  await escrow.waitForDeployment();

  await paymentRecordNFT.transferOwnership(await escrow.getAddress());

  const RentScoreReader = await ethers.getContractFactory("RentScoreReader");
  const scoreReader = await RentScoreReader.deploy(await paymentRecordNFT.getAddress());
  await scoreReader.waitForDeployment();

  const LoanGateway = await ethers.getContractFactory("LoanGateway");
  const loanGateway = await LoanGateway.deploy(await scoreReader.getAddress());
  await loanGateway.waitForDeployment();

  console.log("LeaseRegistry:", await leaseRegistry.getAddress());
  console.log("PaymentRecordNFT:", await paymentRecordNFT.getAddress());
  console.log("EscrowContract:", await escrow.getAddress());
  console.log("RentScoreReader:", await scoreReader.getAddress());
  console.log("LoanGateway:", await loanGateway.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
