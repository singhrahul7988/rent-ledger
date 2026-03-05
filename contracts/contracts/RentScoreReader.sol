// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPaymentRecordNFT {
    function getPaymentTokenIds(address tenant) external view returns (uint256[] memory);

    function getScoreInputs(
        uint256 tokenId
    ) external view returns (uint256 amountUsdCents, uint8 statusCode, uint64 timestamp);
}

contract RentScoreReader {
    IPaymentRecordNFT public immutable paymentRecordNFT;

    event ScoreSnapshotStored(
        address indexed tenant,
        uint16 score,
        bytes32 snapshotId
    );

    constructor(address paymentRecordNFTAddress) {
        require(paymentRecordNFTAddress != address(0), "payment nft required");
        paymentRecordNFT = IPaymentRecordNFT(paymentRecordNFTAddress);
    }

    function getPaymentCount(address tenant) external view returns (uint256) {
        return paymentRecordNFT.getPaymentTokenIds(tenant).length;
    }

    function getScore(address tenant) public view returns (uint16) {
        uint256[] memory tokenIds = paymentRecordNFT.getPaymentTokenIds(tenant);
        if (tokenIds.length == 0) {
            return 150;
        }

        uint256 onTimeCount = 0;
        uint256 lateCount = 0;
        uint256 amountSum = 0;
        uint64 firstTimestamp = type(uint64).max;
        uint64 latestTimestamp = 0;

        uint256 start = tokenIds.length > 6 ? tokenIds.length - 6 : 0;
        uint256 recentOnTimeCount = 0;

        for (uint256 i = 0; i < tokenIds.length; i++) {
            (uint256 amountUsdCents, uint8 statusCode, uint64 paymentTs) = paymentRecordNFT
                .getScoreInputs(tokenIds[i]);

            amountSum += amountUsdCents;

            if (statusCode == 1) {
                onTimeCount += 1;
            } else if (statusCode == 2) {
                lateCount += 1;
            }

            if (paymentTs < firstTimestamp) firstTimestamp = paymentTs;
            if (paymentTs > latestTimestamp) latestTimestamp = paymentTs;

            if (i >= start && statusCode == 1) {
                recentOnTimeCount += 1;
            }
        }

        int256 score = 150;

        uint256 onTimePoints = onTimeCount * 30;
        if (onTimePoints > 300) onTimePoints = 300;
        score += int256(onTimePoints);

        if (tokenIds.length >= 6 && recentOnTimeCount == 6) {
            score += 50;
        }

        uint256 avgAmount = amountSum / tokenIds.length;
        if (avgAmount >= 100000) {
            score += 50;
        } else if (avgAmount >= 50000) {
            score += 30;
        } else {
            score += 10;
        }

        if (latestTimestamp > firstTimestamp) {
            uint256 tenureMonths = (latestTimestamp - firstTimestamp) / 30 days;
            if (tenureMonths >= 12) {
                score += 50;
            } else if (tenureMonths >= 6) {
                score += 25;
            }
        }

        score -= int256(lateCount * 15);

        if (score < 0) score = 0;
        if (score > 850) score = 850;
        return uint16(uint256(score));
    }

    function isEligible(
        address tenant,
        uint8 tier
    ) external view returns (bool) {
        uint16 score = getScore(tenant);
        return score >= _tierMinScore(tier);
    }

    function snapshotScore(address tenant) external returns (bytes32 snapshotId, uint16 score) {
        score = getScore(tenant);
        snapshotId = keccak256(abi.encodePacked(tenant, score, block.timestamp));
        emit ScoreSnapshotStored(tenant, score, snapshotId);
    }

    function _tierMinScore(uint8 tier) internal pure returns (uint16) {
        if (tier == 1) return 300;
        if (tier == 2) return 450;
        if (tier == 3) return 600;
        if (tier == 4) return 700;
        revert("invalid tier");
    }
}
