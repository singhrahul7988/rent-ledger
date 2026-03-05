// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ILeaseRegistry {
    function getLease(
        bytes32 leaseId
    )
        external
        view
        returns (
            address tenant,
            address landlord,
            uint256 monthlyRentUsdCents,
            uint8 dueDay,
            uint64 startTimestamp,
            bool active
        );
}

interface IPaymentRecordMinter {
    function mintCertificate(
        address tenant,
        bytes32 paymentRecordId,
        bytes32 leaseId,
        uint256 amountUsdCents,
        uint8 statusCode,
        bytes32 txRef
    ) external returns (uint256 tokenId);
}

contract EscrowContract {
    ILeaseRegistry public immutable leaseRegistry;
    IPaymentRecordMinter public immutable paymentRecordNFT;

    event RentDeposited(
        bytes32 indexed leaseId,
        address indexed tenant,
        uint256 amountUsdCents,
        bytes32 paymentRecordId
    );

    event FundsReleased(
        bytes32 indexed leaseId,
        address indexed landlord,
        uint256 nativeAmount,
        bytes32 paymentRecordId
    );

    constructor(address leaseRegistryAddress, address paymentRecordNFTAddress) {
        require(leaseRegistryAddress != address(0), "lease registry required");
        require(paymentRecordNFTAddress != address(0), "payment nft required");
        leaseRegistry = ILeaseRegistry(leaseRegistryAddress);
        paymentRecordNFT = IPaymentRecordMinter(paymentRecordNFTAddress);
    }

    function depositRent(
        bytes32 leaseId,
        uint256 amountUsdCents,
        uint8 statusCode,
        bytes32 txRef
    ) external payable returns (bytes32 paymentRecordId, uint256 tokenId) {
        (
            address tenant,
            address landlord,
            uint256 monthlyRentUsdCents,
            ,
            ,
            bool active
        ) = leaseRegistry.getLease(leaseId);

        require(active, "inactive lease");
        require(msg.sender == tenant, "only tenant");
        require(amountUsdCents > 0, "amount required");
        require(statusCode == 1 || statusCode == 2, "invalid status");
        require(amountUsdCents <= monthlyRentUsdCents * 2, "amount out of range");

        paymentRecordId = keccak256(
            abi.encodePacked(
                leaseId,
                msg.sender,
                amountUsdCents,
                statusCode,
                txRef,
                block.timestamp
            )
        );

        emit RentDeposited(leaseId, msg.sender, amountUsdCents, paymentRecordId);

        if (msg.value > 0) {
            (bool sent, ) = payable(landlord).call{value: msg.value}("");
            require(sent, "native transfer failed");
        }

        tokenId = paymentRecordNFT.mintCertificate(
            msg.sender,
            paymentRecordId,
            leaseId,
            amountUsdCents,
            statusCode,
            txRef
        );

        emit FundsReleased(leaseId, landlord, msg.value, paymentRecordId);
    }

    function getLease(
        bytes32 leaseId
    )
        external
        view
        returns (
            address tenant,
            address landlord,
            uint256 monthlyRentUsdCents,
            uint8 dueDay,
            uint64 startTimestamp,
            bool active
        )
    {
        return leaseRegistry.getLease(leaseId);
    }
}
