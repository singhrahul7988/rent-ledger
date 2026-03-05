// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract PaymentRecordNFT is ERC721, Ownable {
    struct PaymentRecord {
        bytes32 paymentRecordId;
        bytes32 leaseId;
        uint256 amountUsdCents;
        uint8 statusCode; // 1 = ON_TIME, 2 = LATE
        uint64 timestamp;
        bytes32 txRef;
    }

    uint256 public nextTokenId;
    mapping(uint256 => PaymentRecord) private recordsByTokenId;
    mapping(address => uint256[]) private tenantTokenIds;

    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed tenant,
        bytes32 indexed paymentRecordId,
        bytes32 leaseId,
        uint256 amountUsdCents,
        uint8 statusCode
    );

    error Soulbound();

    constructor() ERC721("RentLedger Payment Certificate", "RLPC") {}

    function mintCertificate(
        address tenant,
        bytes32 paymentRecordId,
        bytes32 leaseId,
        uint256 amountUsdCents,
        uint8 statusCode,
        bytes32 txRef
    ) external onlyOwner returns (uint256 tokenId) {
        require(tenant != address(0), "tenant required");
        require(amountUsdCents > 0, "amount required");
        require(statusCode == 1 || statusCode == 2, "invalid status");

        nextTokenId += 1;
        tokenId = nextTokenId;

        _safeMint(tenant, tokenId);

        recordsByTokenId[tokenId] = PaymentRecord({
            paymentRecordId: paymentRecordId,
            leaseId: leaseId,
            amountUsdCents: amountUsdCents,
            statusCode: statusCode,
            timestamp: uint64(block.timestamp),
            txRef: txRef
        });

        tenantTokenIds[tenant].push(tokenId);

        emit CertificateIssued(
            tokenId,
            tenant,
            paymentRecordId,
            leaseId,
            amountUsdCents,
            statusCode
        );
    }

    function getPaymentTokenIds(address tenant) external view returns (uint256[] memory) {
        return tenantTokenIds[tenant];
    }

    function getPaymentRecord(
        uint256 tokenId
    ) external view returns (PaymentRecord memory) {
        require(_exists(tokenId), "token not found");
        return recordsByTokenId[tokenId];
    }

    function getPaymentRecordFields(
        uint256 tokenId
    )
        external
        view
        returns (
            bytes32 paymentRecordId,
            bytes32 leaseId,
            uint256 amountUsdCents,
            uint8 statusCode,
            uint64 timestamp,
            bytes32 txRef
        )
    {
        require(_exists(tokenId), "token not found");
        PaymentRecord memory record = recordsByTokenId[tokenId];
        return (
            record.paymentRecordId,
            record.leaseId,
            record.amountUsdCents,
            record.statusCode,
            record.timestamp,
            record.txRef
        );
    }

    function getScoreInputs(
        uint256 tokenId
    ) external view returns (uint256 amountUsdCents, uint8 statusCode, uint64 timestamp) {
        require(_exists(tokenId), "token not found");
        PaymentRecord memory record = recordsByTokenId[tokenId];
        return (record.amountUsdCents, record.statusCode, record.timestamp);
    }

    function approve(address, uint256) public pure override {
        revert Soulbound();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert Soulbound();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        if (from != address(0) && to != address(0)) {
            revert Soulbound();
        }
    }
}
