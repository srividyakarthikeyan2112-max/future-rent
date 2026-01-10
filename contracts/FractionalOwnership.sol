// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FractionalOwnership
 * @dev Manages fractional ownership of future yield NFTs
 * @notice Allows multiple investors to own percentages of a single NFT's yield
 */
contract FractionalOwnership is Ownable, ReentrancyGuard {
    // Structure to track fractional shares
    struct FractionalShare {
        uint256 tokenId; // Original NFT token ID
        address investor;
        uint256 sharePercent; // Percentage in basis points (10000 = 100%)
        uint256 investedAmount;
        uint256 claimedPayouts;
        uint256 createdAt;
    }

    // Mapping from tokenId => investor => share info
    mapping(uint256 => mapping(address => FractionalShare)) public shares;

    // Mapping from tokenId => list of investors
    mapping(uint256 => address[]) public tokenInvestors;

    // Mapping from investor => list of tokenIds they invested in
    mapping(address => uint256[]) public investorTokens;

    // Total shares per token
    mapping(uint256 => uint256) public totalShares;

    // Events
    event FractionPurchased(
        uint256 indexed tokenId,
        address indexed investor,
        uint256 sharePercent,
        uint256 investedAmount
    );
    event FractionSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 sharePercent
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Record fractional purchase
     * @param tokenId The NFT token ID
     * @param investor The investor address
     * @param sharePercent Share percentage in basis points
     * @param investedAmount Amount invested
     */
    function recordFractionPurchase(
        uint256 tokenId,
        address investor,
        uint256 sharePercent,
        uint256 investedAmount
    ) external onlyOwner {
        require(sharePercent > 0 && sharePercent <= 10000, "Invalid share percentage");
        require(investedAmount > 0, "Investment amount must be greater than 0");

        // Check if investor already has shares
        if (shares[tokenId][investor].investor == address(0)) {
            tokenInvestors[tokenId].push(investor);
            investorTokens[investor].push(tokenId);
        }

        shares[tokenId][investor] = FractionalShare({
            tokenId: tokenId,
            investor: investor,
            sharePercent: sharePercent,
            investedAmount: investedAmount,
            claimedPayouts: 0,
            createdAt: block.timestamp
        });

        totalShares[tokenId] += sharePercent;
        require(totalShares[tokenId] <= 10000, "Total shares exceed 100%");

        emit FractionPurchased(tokenId, investor, sharePercent, investedAmount);
    }

    /**
     * @dev Transfer fractional share between investors
     * @param tokenId The NFT token ID
     * @param from Current owner
     * @param to New owner
     * @param sharePercent Share percentage to transfer
     */
    function transferFraction(
        uint256 tokenId,
        address from,
        address to,
        uint256 sharePercent
    ) external onlyOwner nonReentrant {
        require(shares[tokenId][from].sharePercent >= sharePercent, "Insufficient shares");
        require(to != address(0), "Cannot transfer to zero address");

        shares[tokenId][from].sharePercent -= sharePercent;

        if (shares[tokenId][to].investor == address(0)) {
            tokenInvestors[tokenId].push(to);
            investorTokens[to].push(tokenId);
        }

        shares[tokenId][to].sharePercent += sharePercent;

        emit FractionSold(tokenId, from, to, sharePercent);
    }

    /**
     * @dev Update claimed payouts for an investor
     * @param tokenId The NFT token ID
     * @param investor The investor address
     * @param amount Claimed amount
     */
    function updateClaimedPayouts(
        uint256 tokenId,
        address investor,
        uint256 amount
    ) external onlyOwner {
        shares[tokenId][investor].claimedPayouts += amount;
    }

    /**
     * @dev Get investor share for a token
     * @param tokenId The NFT token ID
     * @param investor The investor address
     * @return Share information
     */
    function getShare(uint256 tokenId, address investor) external view returns (FractionalShare memory) {
        return shares[tokenId][investor];
    }

    /**
     * @dev Get all investors for a token
     * @param tokenId The NFT token ID
     * @return Array of investor addresses
     */
    function getTokenInvestors(uint256 tokenId) external view returns (address[] memory) {
        return tokenInvestors[tokenId];
    }

    /**
     * @dev Get all tokens an investor has shares in
     * @param investor The investor address
     * @return Array of token IDs
     */
    function getInvestorTokens(address investor) external view returns (uint256[] memory) {
        return investorTokens[investor];
    }
}
