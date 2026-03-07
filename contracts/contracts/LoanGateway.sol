// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IRentScoreReader {
    function getScore(address tenant) external view returns (uint16);
}

contract LoanGateway {
    enum LoanStatus {
        NONE,
        ACTIVE,
        PAID,
        DEFAULTED
    }

    struct Loan {
        bytes32 loanId;
        address borrower;
        uint8 tier;
        uint256 principalUsdCents;
        uint256 outstandingUsdCents;
        uint16 aprBps;
        uint64 createdAt;
        LoanStatus status;
    }

    IRentScoreReader public immutable rentScoreReader;

    mapping(bytes32 => Loan) public loans;
    mapping(address => bytes32[]) public borrowerLoanIds;

    event LoanRequested(
        bytes32 indexed loanId,
        address indexed borrower,
        uint8 tier,
        uint256 amountUsdCents
    );
    event LoanActivated(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 principalUsdCents,
        uint16 aprBps
    );
    event LoanRepaid(
        bytes32 indexed loanId,
        address indexed borrower,
        uint256 amountUsdCents,
        uint256 remainingUsdCents
    );

    constructor(address rentScoreReaderAddress) {
        require(rentScoreReaderAddress != address(0), "score reader required");
        rentScoreReader = IRentScoreReader(rentScoreReaderAddress);
    }

    function requestLoan(
        uint8 tier,
        uint256 amountUsdCents
    ) external returns (bytes32 loanId) {
        require(amountUsdCents > 0, "amount required");
        (uint16 minScore, uint256 maxAmountUsdCents, uint16 aprBps) = _tierConfig(
            tier
        );

        uint16 score = rentScoreReader.getScore(msg.sender);
        require(score >= minScore, "score too low");
        require(amountUsdCents <= maxAmountUsdCents, "amount exceeds tier");

        loanId = keccak256(
            abi.encodePacked(
                msg.sender,
                tier,
                amountUsdCents,
                block.timestamp,
                borrowerLoanIds[msg.sender].length
            )
        );

        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.NONE, "loan exists");

        loans[loanId] = Loan({
            loanId: loanId,
            borrower: msg.sender,
            tier: tier,
            principalUsdCents: amountUsdCents,
            outstandingUsdCents: amountUsdCents,
            aprBps: aprBps,
            createdAt: uint64(block.timestamp),
            status: LoanStatus.ACTIVE
        });

        borrowerLoanIds[msg.sender].push(loanId);

        emit LoanRequested(loanId, msg.sender, tier, amountUsdCents);
        emit LoanActivated(loanId, msg.sender, amountUsdCents, aprBps);
    }

    function repayLoan(bytes32 loanId, uint256 amountUsdCents) external {
        require(amountUsdCents > 0, "amount required");
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.ACTIVE, "loan inactive");
        require(loan.borrower == msg.sender, "only borrower");

        if (amountUsdCents >= loan.outstandingUsdCents) {
            loan.outstandingUsdCents = 0;
            loan.status = LoanStatus.PAID;
        } else {
            loan.outstandingUsdCents -= amountUsdCents;
        }

        emit LoanRepaid(loanId, msg.sender, amountUsdCents, loan.outstandingUsdCents);
    }

    function getLoanStatus(
        bytes32 loanId
    )
        external
        view
        returns (
            address borrower,
            uint8 tier,
            uint256 principalUsdCents,
            uint256 outstandingUsdCents,
            uint16 aprBps,
            uint64 createdAt,
            LoanStatus status
        )
    {
        Loan memory loan = loans[loanId];
        return (
            loan.borrower,
            loan.tier,
            loan.principalUsdCents,
            loan.outstandingUsdCents,
            loan.aprBps,
            loan.createdAt,
            loan.status
        );
    }

    function _tierConfig(
        uint8 tier
    ) internal pure returns (uint16 minScore, uint256 maxAmountUsdCents, uint16 aprBps) {
        if (tier == 1) return (300, 5000 * 100, 1800);
        if (tier == 2) return (450, 10000 * 100, 1500);
        if (tier == 3) return (600, 15000 * 100, 1200);
        if (tier == 4) return (700, 20000 * 100, 1000);
        revert("invalid tier");
    }
}
