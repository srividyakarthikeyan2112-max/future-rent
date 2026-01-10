// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title OracleVerification
 * @dev Oracle-based verification of real-world income generation
 * @notice Only authorized oracles can verify income
 */
contract OracleVerification is Ownable, AccessControl {
    // Role for oracles
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Structure for income verification records
    struct IncomeRecord {
        uint256 tokenId;
        uint256 incomeAmount;
        uint256 timestamp;
        bool verified;
        address verifiedBy;
        string verificationData; // IPFS hash or external reference
    }

    // Mapping from tokenId => timestamp => IncomeRecord
    mapping(uint256 => mapping(uint256 => IncomeRecord)) public incomeRecords;

    // Mapping from tokenId => array of timestamps
    mapping(uint256 => uint256[]) public recordTimestamps;

    // Events
    event IncomeVerified(
        uint256 indexed tokenId,
        uint256 incomeAmount,
        uint256 timestamp,
        address indexed oracle,
        string verificationData
    );
    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);

    constructor() Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Add an oracle address
     * @param oracle Address to grant oracle role
     */
    function addOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(oracle != address(0), "Invalid oracle address");
        _grantRole(ORACLE_ROLE, oracle);
        emit OracleAdded(oracle);
    }

    /**
     * @dev Remove an oracle address
     * @param oracle Address to revoke oracle role
     */
    function removeOracle(address oracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ORACLE_ROLE, oracle);
        emit OracleRemoved(oracle);
    }

    /**
     * @dev Verify income for a specific token
     * @param tokenId The NFT token ID
     * @param incomeAmount Amount of income generated
     * @param timestamp Timestamp of income generation
     * @param verificationData Reference data (IPFS hash, API endpoint, etc.)
     */
    function verifyIncome(
        uint256 tokenId,
        uint256 incomeAmount,
        uint256 timestamp,
        string memory verificationData
    ) external onlyRole(ORACLE_ROLE) {
        require(incomeAmount > 0, "Income amount must be greater than 0");
        require(timestamp > 0, "Invalid timestamp");
        require(bytes(verificationData).length > 0, "Verification data required");

        // Check if record already exists
        require(!incomeRecords[tokenId][timestamp].verified, "Income already verified for this timestamp");

        incomeRecords[tokenId][timestamp] = IncomeRecord({
            tokenId: tokenId,
            incomeAmount: incomeAmount,
            timestamp: timestamp,
            verified: true,
            verifiedBy: msg.sender,
            verificationData: verificationData
        });

        recordTimestamps[tokenId].push(timestamp);

        emit IncomeVerified(tokenId, incomeAmount, timestamp, msg.sender, verificationData);
    }

    /**
     * @dev Get income record for a token and timestamp
     * @param tokenId The NFT token ID
     * @param timestamp The timestamp
     * @return IncomeRecord struct
     */
    function getIncomeRecord(
        uint256 tokenId,
        uint256 timestamp
    ) external view returns (IncomeRecord memory) {
        return incomeRecords[tokenId][timestamp];
    }

    /**
     * @dev Get all timestamps with verified income for a token
     * @param tokenId The NFT token ID
     * @return Array of timestamps
     */
    function getRecordTimestamps(uint256 tokenId) external view returns (uint256[] memory) {
        return recordTimestamps[tokenId];
    }

    /**
     * @dev Calculate total verified income for a token
     * @param tokenId The NFT token ID
     * @return Total income amount
     */
    function getTotalVerifiedIncome(uint256 tokenId) external view returns (uint256) {
        uint256 total = 0;
        uint256[] memory timestamps = recordTimestamps[tokenId];
        
        for (uint256 i = 0; i < timestamps.length; i++) {
            if (incomeRecords[tokenId][timestamps[i]].verified) {
                total += incomeRecords[tokenId][timestamps[i]].incomeAmount;
            }
        }
        
        return total;
    }
}
