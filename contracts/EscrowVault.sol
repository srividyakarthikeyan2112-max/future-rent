// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EscrowVault
 * @dev Securely holds investor funds until payout distribution
 * @notice Funds can only be released by PayoutManager contract
 */
contract EscrowVault is Ownable, ReentrancyGuard {
    // Mapping from tokenId => total escrowed amount
    mapping(uint256 => uint256) public escrowedFunds;

    // Mapping from tokenId => asset owner address
    mapping(uint256 => address) public assetOwners;

    // Reference to PayoutManager contract
    address public payoutManager;

    // Events
    event FundsDeposited(uint256 indexed tokenId, address indexed depositor, uint256 amount);
    event FundsReleased(uint256 indexed tokenId, address indexed recipient, uint256 amount);

    modifier onlyPayoutManager() {
        require(msg.sender == payoutManager, "Only PayoutManager can call this");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set the PayoutManager contract address
     * @param _payoutManager Address of PayoutManager
     */
    function setPayoutManager(address _payoutManager) external onlyOwner {
        require(_payoutManager != address(0), "Invalid address");
        payoutManager = _payoutManager;
    }

    /**
     * @dev Deposit funds to escrow for a specific token
     * @param tokenId The NFT token ID
     * @param assetOwner The asset owner address
     */
    function deposit(uint256 tokenId, address assetOwner) external payable nonReentrant {
        require(msg.value > 0, "Must send funds");
        require(assetOwner != address(0), "Invalid asset owner");

        escrowedFunds[tokenId] += msg.value;
        assetOwners[tokenId] = assetOwner;

        emit FundsDeposited(tokenId, msg.sender, msg.value);
    }

    /**
     * @dev Release funds from escrow (only callable by PayoutManager)
     * @param tokenId The NFT token ID
     * @param recipient The recipient address
     * @param amount Amount to release
     */
    function releaseFunds(
        uint256 tokenId,
        address payable recipient,
        uint256 amount
    ) external onlyPayoutManager nonReentrant {
        require(escrowedFunds[tokenId] >= amount, "Insufficient escrowed funds");
        require(recipient != address(0), "Invalid recipient");

        escrowedFunds[tokenId] -= amount;

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit FundsReleased(tokenId, recipient, amount);
    }

    /**
     * @dev Get escrowed amount for a token
     * @param tokenId The NFT token ID
     * @return Escrowed amount
     */
    function getEscrowedAmount(uint256 tokenId) external view returns (uint256) {
        return escrowedFunds[tokenId];
    }

    /**
     * @dev Get contract balance
     * @return Total balance in wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
