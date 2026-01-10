// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./EscrowVault.sol";
import "./OracleVerification.sol";
import "./FractionalOwnership.sol";
import "./FutureYieldNFT.sol";

/**
 * @title PayoutManager
 * @dev Automatically distributes verified income to asset owners and investors
 * @notice Handles payout distribution based on fractional ownership and verified income
 */
contract PayoutManager is Ownable, ReentrancyGuard {
    EscrowVault public escrowVault;
    OracleVerification public oracleVerification;
    FractionalOwnership public fractionalOwnership;
    FutureYieldNFT public futureYieldNFT;

    // Mapping from tokenId => timestamp => payout status
    mapping(uint256 => mapping(uint256 => bool)) public payoutProcessed;

    // Owner fee percentage (basis points, e.g., 500 = 5%)
    uint256 public ownerFeePercent = 500; // 5% fee to platform

    // Events
    event PayoutDistributed(
        uint256 indexed tokenId,
        uint256 incomeAmount,
        uint256 timestamp,
        uint256 ownerShare,
        uint256 investorShare,
        uint256 platformFee
    );
    event OwnerFeeUpdated(uint256 newFeePercent);

    constructor(
        address _escrowVault,
        address _oracleVerification,
        address _fractionalOwnership,
        address _futureYieldNFT
    ) Ownable(msg.sender) {
        escrowVault = EscrowVault(_escrowVault);
        oracleVerification = OracleVerification(_oracleVerification);
        fractionalOwnership = FractionalOwnership(_fractionalOwnership);
        futureYieldNFT = FutureYieldNFT(_futureYieldNFT);
    }

    /**
     * @dev Distribute payout for verified income
     * @param tokenId The NFT token ID
     * @param timestamp The timestamp of the verified income
     */
    function distributePayout(uint256 tokenId, uint256 timestamp) external nonReentrant {
        require(!payoutProcessed[tokenId][timestamp], "Payout already processed");

        // Get verified income record
        OracleVerification.IncomeRecord memory record = oracleVerification.getIncomeRecord(
            tokenId,
            timestamp
        );
        require(record.verified, "Income not verified");

        // Get asset info
        FutureYieldNFT.AssetInfo memory assetInfo = futureYieldNFT.getAssetInfo(tokenId);
        require(assetInfo.isActive, "Asset not active");

        uint256 totalIncome = record.incomeAmount;

        // Calculate platform fee
        uint256 platformFee = (totalIncome * ownerFeePercent) / 10000;
        uint256 distributableIncome = totalIncome - platformFee;

        // Calculate owner share (remaining yield not sold)
        uint256 totalShares = fractionalOwnership.totalShares(tokenId);
        uint256 ownerYieldPercent = assetInfo.totalYieldPercent - 
            ((assetInfo.totalYieldPercent * totalShares) / 10000);
        uint256 ownerShare = (distributableIncome * ownerYieldPercent) / assetInfo.totalYieldPercent;

        // Calculate investor share
        uint256 investorShare = distributableIncome - ownerShare;

        // Distribute to asset owner
        if (ownerShare > 0 && assetInfo.assetOwner != address(0)) {
            escrowVault.releaseFunds(tokenId, payable(assetInfo.assetOwner), ownerShare);
        }

        // Distribute to investors based on their fractional shares
        if (investorShare > 0) {
            address[] memory investors = fractionalOwnership.getTokenInvestors(tokenId);
            
            for (uint256 i = 0; i < investors.length; i++) {
                FractionalOwnership.FractionalShare memory share = fractionalOwnership.getShare(
                    tokenId,
                    investors[i]
                );

                if (share.sharePercent > 0) {
                    uint256 investorPayout = (investorShare * share.sharePercent) / totalShares;
                    
                    if (investorPayout > 0) {
                        escrowVault.releaseFunds(tokenId, payable(investors[i]), investorPayout);
                        fractionalOwnership.updateClaimedPayouts(
                            tokenId,
                            investors[i],
                            investorPayout
                        );
                    }
                }
            }
        }

        // Platform fee can be sent to owner address or kept in escrow
        if (platformFee > 0) {
            escrowVault.releaseFunds(tokenId, payable(owner()), platformFee);
        }

        payoutProcessed[tokenId][timestamp] = true;

        emit PayoutDistributed(
            tokenId,
            totalIncome,
            timestamp,
            ownerShare,
            investorShare,
            platformFee
        );
    }

    /**
     * @dev Batch distribute payouts for multiple timestamps
     * @param tokenId The NFT token ID
     * @param timestamps Array of timestamps to process
     */
    function batchDistributePayout(
        uint256 tokenId,
        uint256[] memory timestamps
    ) external nonReentrant {
        for (uint256 i = 0; i < timestamps.length; i++) {
            if (!payoutProcessed[tokenId][timestamps[i]]) {
                distributePayout(tokenId, timestamps[i]);
            }
        }
    }

    /**
     * @dev Update platform owner fee percentage
     * @param newFeePercent New fee percentage in basis points
     */
    function setOwnerFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 2000, "Fee cannot exceed 20%");
        ownerFeePercent = newFeePercent;
        emit OwnerFeeUpdated(newFeePercent);
    }

    /**
     * @dev Check if payout has been processed
     * @param tokenId The NFT token ID
     * @param timestamp The timestamp
     * @return True if processed
     */
    function isPayoutProcessed(uint256 tokenId, uint256 timestamp) external view returns (bool) {
        return payoutProcessed[tokenId][timestamp];
    }
}
