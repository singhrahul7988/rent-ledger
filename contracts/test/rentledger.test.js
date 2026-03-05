import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("RentLedger contracts", function () {
  async function deployAll() {
    const [deployer, tenant, landlord] = await ethers.getSigners();

    const LeaseRegistry = await ethers.getContractFactory("LeaseRegistry");
    const leaseRegistry = await LeaseRegistry.deploy();

    const PaymentRecordNFT = await ethers.getContractFactory("PaymentRecordNFT");
    const paymentRecordNFT = await PaymentRecordNFT.deploy();

    const EscrowContract = await ethers.getContractFactory("EscrowContract");
    const escrow = await EscrowContract.deploy(
      await leaseRegistry.getAddress(),
      await paymentRecordNFT.getAddress()
    );

    await paymentRecordNFT.transferOwnership(await escrow.getAddress());

    const RentScoreReader = await ethers.getContractFactory("RentScoreReader");
    const scoreReader = await RentScoreReader.deploy(
      await paymentRecordNFT.getAddress()
    );

    const LoanGateway = await ethers.getContractFactory("LoanGateway");
    const loanGateway = await LoanGateway.deploy(await scoreReader.getAddress());

    return {
      deployer,
      tenant,
      landlord,
      leaseRegistry,
      paymentRecordNFT,
      escrow,
      scoreReader,
      loanGateway
    };
  }

  it("registers lease, records payment certificates, calculates score, and requests loan", async function () {
    const {
      tenant,
      landlord,
      leaseRegistry,
      escrow,
      paymentRecordNFT,
      scoreReader,
      loanGateway
    } = await deployAll();

    const registerTx = await leaseRegistry.registerLease(
      tenant.address,
      landlord.address,
      185000,
      5
    );
    const registerReceipt = await registerTx.wait();
    const leaseEvent = registerReceipt.logs.find((l) =>
      l.fragment && l.fragment.name === "LeaseRegistered"
    );
    const leaseId = leaseEvent.args.leaseId;

    for (let i = 0; i < 7; i++) {
      const txRef = ethers.id(`payment-${i}`);
      await escrow
        .connect(tenant)
        .depositRent(leaseId, 185000, 1, txRef, { value: ethers.parseEther("0.01") });
    }

    const tokenIds = await paymentRecordNFT.getPaymentTokenIds(tenant.address);
    expect(tokenIds.length).to.equal(7);

    const score = await scoreReader.getScore(tenant.address);
    expect(Number(score)).to.be.gte(450);

    const requestTx = await loanGateway.connect(tenant).requestLoan(2, 2000000);
    const requestReceipt = await requestTx.wait();
    const requested = requestReceipt.logs.find((l) => l.fragment?.name === "LoanRequested");
    expect(requested).to.not.equal(undefined);

    const loanId = requested.args.loanId;
    const loan = await loanGateway.getLoanStatus(loanId);
    expect(loan.borrower).to.equal(tenant.address);
    expect(loan.status).to.equal(1n); // ACTIVE
  });

  it("keeps payment certificates soulbound", async function () {
    const { tenant, landlord, leaseRegistry, escrow, paymentRecordNFT } = await deployAll();

    const tx = await leaseRegistry.registerLease(tenant.address, landlord.address, 150000, 10);
    const receipt = await tx.wait();
    const leaseId = receipt.logs.find((l) => l.fragment?.name === "LeaseRegistered").args.leaseId;

    await escrow.connect(tenant).depositRent(leaseId, 150000, 1, ethers.id("single"));
    let reverted = false;
    try {
      await paymentRecordNFT
        .connect(tenant)
        .transferFrom(tenant.address, landlord.address, 1);
    } catch (_err) {
      reverted = true;
    }
    expect(reverted).to.equal(true);
  });
});
