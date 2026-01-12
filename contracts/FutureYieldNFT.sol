// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./vendor/Counters.sol";

/**
 * @title FutureYieldNFT
 * @dev NFT contract representing future income rights of real-world assets
 * @notice Each NFT represents a percentage of future income, NOT ownership of the asset
 */
contract FutureYieldNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    // Asset metadata structure
    struct AssetInfo {
        address assetOwner;
        uint256 totalYieldPercent; // Total percentage of yield tokenized (max 10000 = 100%)
        uint256 targetPrice; // Target price for investment
        uint256 escrowAmount; // Amount locked in escrow
        bool isActive;
        uint256 createdAt;
        string assetType; // "solar", "farmland", "digital", etc.
    }

    // Mapping from token ID to asset information
    mapping(uint256 => AssetInfo) public assets;

    // Events
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 yieldPercent,
        uint256 targetPrice,
        string assetType
    );
    event AssetStatusUpdated(uint256 indexed tokenId, bool isActive);

    constructor() ERC721("FutureYieldNFT", "FYNFT") Ownable(msg.sender) {}

    /**
     * @dev Mint a new NFT representing future income rights
     * @param to Address to mint the NFT to
     * @param yieldPercent Percentage of yield (in basis points, 10000 = 100%)
     * @param targetPrice Target investment price
     * @param tokenURI Metadata URI (IPFS)
     * @param assetType Type of asset (e.g., "solar", "farmland")
     * @return tokenId The newly minted token ID
     */
    function mintFutureYield(
        address to,
        uint256 yieldPercent,
        uint256 targetPrice,
        string memory tokenURI,
        string memory assetType
    ) public returns (uint256) {
        require(yieldPercent > 0 && yieldPercent <= 10000, "Invalid yield percentage");
        require(targetPrice > 0, "Target price must be greater than 0");
        require(bytes(tokenURI).length > 0, "Token URI required");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        assets[newTokenId] = AssetInfo({
            assetOwner: to,
            totalYieldPercent: yieldPercent,
            targetPrice: targetPrice,
            escrowAmount: 0,
            isActive: true,
            createdAt: block.timestamp,
            assetType: assetType
        });

        emit AssetMinted(newTokenId, to, yieldPercent, targetPrice, assetType);
        return newTokenId;
    }

    /**
     * @dev Update escrow amount for an asset
     * @param tokenId The token ID
     * @param amount The escrow amount
     */
    function updateEscrowAmount(uint256 tokenId, uint256 amount) external {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        assets[tokenId].escrowAmount = amount;
    }

    /**
     * @dev Update asset active status
     * @param tokenId The token ID
     * @param isActive New status
     */
    function updateAssetStatus(uint256 tokenId, bool isActive) external {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(msg.sender == owner() || msg.sender == assets[tokenId].assetOwner, "Not authorized");
        assets[tokenId].isActive = isActive;
        emit AssetStatusUpdated(tokenId, isActive);
    }

    /**
     * @dev Get asset information
     * @param tokenId The token ID
     * @return AssetInfo struct
     */
    function getAssetInfo(uint256 tokenId) external view returns (AssetInfo memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return assets[tokenId];
    }

    /**
     * @dev Get total number of minted tokens
     * @return Total count
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
