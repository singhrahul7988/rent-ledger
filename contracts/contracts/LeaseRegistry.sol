// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract LeaseRegistry {
    struct Lease {
        address tenant;
        address landlord;
        uint256 monthlyRentUsdCents;
        uint8 dueDay;
        uint64 startTimestamp;
        bool active;
    }

    mapping(bytes32 => Lease) private leases;
    mapping(address => bytes32[]) private tenantLeaseIds;

    event LeaseRegistered(
        bytes32 indexed leaseId,
        address indexed tenant,
        address indexed landlord,
        uint256 monthlyRentUsdCents,
        uint8 dueDay
    );

    function registerLease(
        address tenant,
        address landlord,
        uint256 monthlyRentUsdCents,
        uint8 dueDay
    ) external returns (bytes32 leaseId) {
        require(tenant != address(0), "tenant required");
        require(landlord != address(0), "landlord required");
        require(monthlyRentUsdCents > 0, "rent required");
        require(dueDay > 0 && dueDay <= 28, "invalid due day");

        leaseId = keccak256(
            abi.encodePacked(
                tenant,
                landlord,
                monthlyRentUsdCents,
                dueDay,
                block.timestamp,
                tenantLeaseIds[tenant].length
            )
        );

        require(!leases[leaseId].active, "lease exists");

        leases[leaseId] = Lease({
            tenant: tenant,
            landlord: landlord,
            monthlyRentUsdCents: monthlyRentUsdCents,
            dueDay: dueDay,
            startTimestamp: uint64(block.timestamp),
            active: true
        });

        tenantLeaseIds[tenant].push(leaseId);

        emit LeaseRegistered(
            leaseId,
            tenant,
            landlord,
            monthlyRentUsdCents,
            dueDay
        );
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
        Lease memory leaseData = leases[leaseId];
        return (
            leaseData.tenant,
            leaseData.landlord,
            leaseData.monthlyRentUsdCents,
            leaseData.dueDay,
            leaseData.startTimestamp,
            leaseData.active
        );
    }

    function getLeaseStruct(
        bytes32 leaseId
    ) external view returns (Lease memory) {
        return leases[leaseId];
    }

    function getTenantLeases(address tenant) external view returns (bytes32[] memory) {
        return tenantLeaseIds[tenant];
    }
}
