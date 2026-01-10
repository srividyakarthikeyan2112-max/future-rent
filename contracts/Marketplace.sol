// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./FutureYieldNFT.sol";
import "./FractionalOwnership.sol";
import "./EscrowVault.sol";

/**
 * @title Marketplace
 * @dev Marketplace for buying and selling future yield NFTs and fractional shares
 */
contract Marketplace is Ownable, ReentrancyGuard {
    FutureYieldNFT public futureYieldNFT;
    FractionalOwnership public fractionalOwnership;
    EscrowVault public escrowVault;

    // Listing structure
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        uint256 sharePercent; // For fractional sales, 0 means full NFT
        bool isActive;
        uint256 createdAt;
    }

    // Mapping from listing ID => Listing
    mapping(uint256 => Listing) public listings;

    // Mapping from tokenId => listing IDs
    mapping(uint256 => uint256[]) public tokenListings;

    uint256 private _listingCounter;

    // Marketplace fee percentage (basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFeePercent = 250;

    // Events
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 sharePercent
    );
    event ListingCancelled(uint256 indexed listingId);
    event ItemPurchased(
        uint256 indexed listingId,
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
    );

    constructor(
        address _futureYieldNFT,
        address _fractionalOwnership,
        address _escrowVault
    ) Ownable(msg.sender) {
        futureYieldNFT = FutureYieldNFT(_futureYieldNFT);
        fractionalOwnership = FractionalOwnership(_fractionalOwnership);
        escrowVault = EscrowVault(_escrowVault);
    }

    /**
     * @dev Create a listing for NFT or fractional share
     * @param tokenId The NFT token ID
     * @param price Sale price in wei
     * @param sharePercent Share percentage for fractional sale (0 for full NFT)
     */
    function createListing(
        uint256 tokenId,
        uint256 price,
        uint256 sharePercent
    ) external nonReentrant {
        require(price > 0, "Price must be greater than 0");

        FutureYieldNFT.AssetInfo memory assetInfo = futureYieldNFT.getAssetInfo(tokenId);
        require(assetInfo.isActive, "Asset not active");

        if (sharePercent == 0) {
            // Full NFT sale
            require(
                futureYieldNFT.ownerOf(tokenId) == msg.sender,
                "Not the owner of this NFT"
            );
            futureYieldNFT.safeTransferFrom(msg.sender, address(this), tokenId);
        } else {
            // Fractional sale
            require(sharePercent > 0 && sharePercent <= 10000, "Invalid share percentage");
            FractionalOwnership.FractionalShare memory share = fractionalOwnership.getShare(
                tokenId,
                msg.sender
            );
            require(
                share.sharePercent >= sharePercent,
                "Insufficient fractional shares"
            );
        }

        _listingCounter++;
        uint256 listingId = _listingCounter;

        listings[listingId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            sharePercent: sharePercent,
            isActive: true,
            createdAt: block.timestamp
        });

        tokenListings[tokenId].push(listingId);

        emit ListingCreated(listingId, tokenId, msg.sender, price, sharePercent);
    }

    /**
     * @dev Purchase an item from a listing
     * @param listingId The listing ID
     */
    function purchaseItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 fee = (listing.price * marketplaceFeePercent) / 10000;
        uint256 sellerAmount = listing.price - fee;

        if (listing.sharePercent == 0) {
            // Full NFT purchase
            futureYieldNFT.safeTransferFrom(address(this), msg.sender, listing.tokenId);
        } else {
            // Fractional share purchase
            fractionalOwnership.transferFraction(
                listing.tokenId,
                listing.seller,
                msg.sender,
                listing.sharePercent
            );
        }

        // Transfer payment to escrow or seller
        if (listing.sharePercent == 0) {
            // For full NFT, send directly to seller
            (bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
            require(success, "Transfer failed");
        } else {
            // For fractional, deposit to escrow
            escrowVault.deposit{value: sellerAmount}(listing.tokenId, listing.seller);
        }

        // Transfer fee to marketplace owner
        if (fee > 0) {
            (bool feeSuccess, ) = payable(owner()).call{value: fee}("");
            require(feeSuccess, "Fee transfer failed");
        }

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSuccess, "Refund failed");
        }

        listing.isActive = false;

        emit ItemPurchased(listingId, listing.tokenId, msg.sender, listing.price);
    }

    /**
     * @dev Cancel a listing
     * @param listingId The listing ID
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        if (listing.sharePercent == 0) {
            // Return NFT to seller
            futureYieldNFT.safeTransferFrom(address(this), listing.seller, listing.tokenId);
        }

        listing.isActive = false;

        emit ListingCancelled(listingId);
    }

    /**
     * @dev Get listing details
     * @param listingId The listing ID
     * @return Listing struct
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @dev Get all listings for a token
     * @param tokenId The token ID
     * @return Array of listing IDs
     */
    function getTokenListings(uint256 tokenId) external view returns (uint256[] memory) {
        return tokenListings[tokenId];
    }

    /**
     * @dev Update marketplace fee percentage
     * @param newFeePercent New fee percentage in basis points
     */
    function setMarketplaceFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee cannot exceed 10%");
        marketplaceFeePercent = newFeePercent;
    }

    /**
     * @dev Get total number of listings
     * @return Total count
     */
    function totalListings() external view returns (uint256) {
        return _listingCounter;
    }

    // Required for ERC721 safeTransferFrom
    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC721Received.selector;
    }
}
