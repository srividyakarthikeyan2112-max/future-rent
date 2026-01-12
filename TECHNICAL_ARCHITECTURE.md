# FutureRent - Complete Technical Architecture & Security Documentation

## 📋 Table of Contents
1. [Tech Stack Overview](#tech-stack-overview)
2. [System Architecture](#system-architecture)
3. [Smart Contracts Architecture](#smart-contracts-architecture)
4. [Contract Interactions & Data Flow](#contract-interactions--data-flow)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Security Features & Checks](#security-features--checks)
8. [Workflow Diagrams](#workflow-diagrams)
9. [Deployment Architecture](#deployment-architecture)

---

## 🔧 Tech Stack Overview

### Blockchain Layer
- **Solidity** `^0.8.20` - Smart contract language
- **Hardhat** `^2.19.0` - Development framework
- **OpenZeppelin Contracts** `^5.0.0` - Secure contract libraries
  - ERC721 (NFT standard)
  - Ownable (Access control)
  - AccessControl (Role-based access)
  - ReentrancyGuard (Security)
- **ethers.js** `^6.9.0` - Ethereum library

### Backend Layer
- **Node.js** - Runtime environment
- **Express.js** `^4.18.2` - Web framework
- **REST API** - API architecture
- **ethers.js** - Blockchain interaction

### Frontend Layer
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **Tailwind CSS** - Styling
- **ethers.js** - Blockchain interaction
- **MetaMask** - Wallet integration

### Development Tools
- **Hardhat Network** - Local blockchain
- **Chai & Mocha** - Testing framework
- **nodemon** - Development server

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Next.js     │  │  React       │  │  Tailwind    │     │
│  │  App Router  │  │  Components  │  │  CSS         │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐            │
│         │      ethers.js + MetaMask           │            │
│         └──────────────────┬──────────────────┘            │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                      BACKEND LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Express.js  │  │  REST API    │  │  Controllers │     │
│  │  Server      │  │  Routes      │  │  Services    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│         ┌──────────────────▼──────────────────┐            │
│         │      IPFS Service (Mocked)          │            │
│         │      Oracle Service (Mocked)        │            │
│         └──────────────────┬──────────────────┘            │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    BLOCKCHAIN LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Smart Contracts (Solidity)              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │  │
│  │  │ FutureYield  │  │ Fractional   │  │ Escrow   │  │  │
│  │  │ NFT          │  │ Ownership    │  │ Vault    │  │  │
│  │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘  │  │
│  │         │                  │                │        │  │
│  │  ┌──────▼───────┐  ┌──────▼───────┐  ┌────▼─────┐  │  │
│  │  │ Oracle       │  │ Payout       │  │ Market   │  │  │
│  │  │ Verification │  │ Manager      │  │ Place    │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│                    Ethereum Network                          │
│              (Hardhat Local / Sepolia / Mainnet)             │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔗 Smart Contracts Architecture

### 1. FutureYieldNFT.sol
**Purpose**: ERC721 NFT contract representing future income rights

**Key Features**:
- Extends OpenZeppelin's `ERC721` and `ERC721URIStorage`
- Mints NFTs representing future income percentages
- Stores asset metadata (owner, yield %, target price, type)
- Emits events for asset minting and status updates

**Data Structure**:
```solidity
struct AssetInfo {
    address assetOwner;          // Asset owner address
    uint256 totalYieldPercent;   // Yield percentage (basis points, 10000 = 100%)
    uint256 targetPrice;         // Target investment price
    uint256 escrowAmount;        // Amount locked in escrow
    bool isActive;               // Asset active status
    uint256 createdAt;           // Creation timestamp
    string assetType;            // "solar", "farmland", "digital"
}
```

**Key Functions**:
- `mintFutureYield()` - Mint new NFT with asset info
- `updateEscrowAmount()` - Update escrow tracking
- `updateAssetStatus()` - Toggle active status
- `getAssetInfo()` - Retrieve asset information

---

### 2. FractionalOwnership.sol
**Purpose**: Manages fractional ownership of yield percentages

**Key Features**:
- Tracks multiple investors per token
- Manages share percentages (basis points)
- Records investment amounts and claimed payouts
- Prevents total shares exceeding 100%

**Data Structure**:
```solidity
struct FractionalShare {
    uint256 tokenId;            // Original NFT token ID
    address investor;           // Investor address
    uint256 sharePercent;       // Share percentage (basis points)
    uint256 investedAmount;     // Amount invested
    uint256 claimedPayouts;     // Total payouts claimed
    uint256 createdAt;          // Creation timestamp
}
```

**Mappings**:
- `shares[tokenId][investor]` - Share information
- `tokenInvestors[tokenId]` - List of investors per token
- `investorTokens[investor]` - List of tokens per investor
- `totalShares[tokenId]` - Total shares per token (max 10000)

**Key Functions**:
- `recordFractionPurchase()` - Record fractional investment (onlyOwner)
- `transferFraction()` - Transfer shares between investors (onlyOwner)
- `updateClaimedPayouts()` - Update payout tracking (onlyOwner)
- `getShare()` - Get investor share info
- `getTokenInvestors()` - Get all investors for a token

**Access Control**: Uses `Ownable` (owner-only functions)

---

### 3. EscrowVault.sol
**Purpose**: Securely holds investor funds until payout distribution

**Key Features**:
- Receives and stores ETH deposits
- Only releases funds via PayoutManager
- Tracks escrowed amounts per token
- Reentrancy protection

**Mappings**:
- `escrowedFunds[tokenId]` - Total escrowed amount per token
- `assetOwners[tokenId]` - Asset owner address

**Key Functions**:
- `deposit()` - Accept ETH deposits (payable, public)
- `releaseFunds()` - Release funds (onlyPayoutManager, nonReentrant)
- `setPayoutManager()` - Set PayoutManager address (onlyOwner)
- `getEscrowedAmount()` - Get escrowed amount for token

**Access Control**: 
- `deposit()` - Public (anyone can deposit)
- `releaseFunds()` - Only PayoutManager
- `setPayoutManager()` - Only owner

---

### 4. OracleVerification.sol
**Purpose**: Oracle-based verification of real-world income generation

**Key Features**:
- Role-based oracle access (AccessControl)
- Records verified income with timestamps
- Stores verification data (IPFS hashes, API references)
- Tracks all verified income records

**Data Structure**:
```solidity
struct IncomeRecord {
    uint256 tokenId;            // NFT token ID
    uint256 incomeAmount;       // Income amount in wei
    uint256 timestamp;          // Income timestamp
    bool verified;              // Verification status
    address verifiedBy;         // Oracle address
    string verificationData;    // IPFS hash or API reference
}
```

**Mappings**:
- `incomeRecords[tokenId][timestamp]` - Income records
- `recordTimestamps[tokenId]` - Array of timestamps with records

**Key Functions**:
- `verifyIncome()` - Record verified income (onlyRole(ORACLE_ROLE))
- `addOracle()` - Add oracle address (onlyRole(DEFAULT_ADMIN_ROLE))
- `removeOracle()` - Remove oracle (onlyRole(DEFAULT_ADMIN_ROLE))
- `getIncomeRecord()` - Get income record
- `getTotalVerifiedIncome()` - Calculate total verified income

**Access Control**: Uses `AccessControl` with `ORACLE_ROLE`

---

### 5. PayoutManager.sol
**Purpose**: Automatically distributes verified income to owners and investors

**Key Features**:
- Orchestrates payout distribution
- Calculates owner and investor shares
- Handles platform fees (5% default)
- Prevents double payouts
- Reentrancy protection

**Contract Dependencies**:
- EscrowVault
- OracleVerification
- FractionalOwnership
- FutureYieldNFT

**Mappings**:
- `payoutProcessed[tokenId][timestamp]` - Payout status tracking

**Key Functions**:
- `distributePayout()` - Distribute income (public, nonReentrant)
- `batchDistributePayout()` - Batch distribution (nonReentrant)
- `setOwnerFeePercent()` - Update platform fee (onlyOwner, max 20%)
- `isPayoutProcessed()` - Check payout status

**Payout Calculation Logic**:
1. Get verified income from OracleVerification
2. Calculate platform fee (5% default)
3. Calculate owner share (unsold yield %)
4. Calculate investor share (distributed proportionally)
5. Release funds from EscrowVault
6. Update claimed payouts in FractionalOwnership

---

### 6. Marketplace.sol
**Purpose**: Marketplace for buying/selling NFTs and fractional shares

**Key Features**:
- Lists NFTs and fractional shares
- Handles purchases with escrow integration
- Marketplace fees (2.5% default)
- Supports full NFT and fractional sales

**Data Structure**:
```solidity
struct Listing {
    uint256 tokenId;            // NFT token ID
    address seller;             // Seller address
    uint256 price;              // Sale price in wei
    uint256 sharePercent;       // Share % (0 = full NFT)
    bool isActive;              // Listing status
    uint256 createdAt;          // Creation timestamp
}
```

**Mappings**:
- `listings[listingId]` - Listing information
- `tokenListings[tokenId]` - Listings per token

**Key Functions**:
- `createListing()` - Create listing (public, nonReentrant)
- `purchaseItem()` - Purchase item (payable, nonReentrant)
- `cancelListing()` - Cancel listing (nonReentrant)
- `getListing()` - Get listing details
- `setMarketplaceFee()` - Update fee (onlyOwner, max 10%)

**Access Control**: Uses `Ownable`

---

## 🔄 Contract Interactions & Data Flow

### Deployment Order
```
1. FutureYieldNFT (no dependencies)
2. FractionalOwnership (no dependencies)
3. EscrowVault (no dependencies)
4. OracleVerification (no dependencies)
5. PayoutManager (depends on all above)
6. Marketplace (depends on FutureYieldNFT, FractionalOwnership, EscrowVault)
```

### Contract Dependencies

```
FutureYieldNFT
    ↑
    │ (stores asset info)
    │
PayoutManager ──→ EscrowVault (releases funds)
    │                    ↑
    │                    │ (deposits)
    │                    │
    ├─→ OracleVerification (reads income records)
    │
    └─→ FractionalOwnership (updates shares, reads investors)
            ↑
            │ (reads/updates)
            │
        Marketplace

Marketplace ──→ FutureYieldNFT (NFT transfers)
    │
    └─→ EscrowVault (deposits)
```

### Workflow: Asset Creation & Investment

```
1. Asset Owner
   ↓
2. Frontend → Backend API → IPFS (metadata storage)
   ↓
3. Frontend → MetaMask → FutureYieldNFT.mintFutureYield()
   ↓
4. NFT Minted (tokenId created)
   ↓
5. Asset Owner → Marketplace.createListing()
   ↓
6. Investor → Marketplace.purchaseItem()
   ↓
7. Marketplace → EscrowVault.deposit() (funds locked)
   ↓
8. Marketplace → FractionalOwnership.recordFractionPurchase() (if fractional)
```

### Workflow: Income Verification & Payout

```
1. Real-world income generated (solar/farmland/digital)
   ↓
2. Oracle Service (off-chain) → fetches income data
   ↓
3. Oracle → OracleVerification.verifyIncome()
   ↓
4. Income record stored on-chain
   ↓
5. PayoutManager.distributePayout() called
   ↓
6. PayoutManager:
   - Reads OracleVerification (income record)
   - Reads FutureYieldNFT (asset info)
   - Reads FractionalOwnership (investor shares)
   - Calculates payouts
   ↓
7. PayoutManager → EscrowVault.releaseFunds()
   ↓
8. Funds distributed to:
   - Asset Owner (unsold yield %)
   - Investors (proportional to shares)
   - Platform (5% fee)
```

---

## 🖥️ Backend Architecture

### MVC Structure

```
backend/
├── server.js              # Express app entry point
├── routes/
│   ├── assetRoutes.js     # Asset endpoints
│   └── investmentRoutes.js # Investment endpoints
├── controllers/
│   ├── assetController.js      # Asset business logic
│   └── investmentController.js # Investment business logic
└── services/
    ├── ipfsService.js     # IPFS integration (mocked)
    └── oracleService.js   # Oracle integration (mocked)
```

### API Endpoints

**Assets**:
- `GET /api/assets` - Get all assets
- `GET /api/assets/:tokenId` - Get asset by ID
- `POST /api/assets` - Create new asset

**Investments**:
- `GET /api/investments/:address` - Get investments for address
- `POST /api/investments` - Create investment

**Health**:
- `GET /health` - Health check

### Current Implementation
- **Storage**: In-memory arrays (mock)
- **IPFS**: Mock service (returns mock hashes)
- **Oracle**: Mock service (returns mock data)

**Production Requirements**:
- Database (PostgreSQL/MongoDB)
- Real IPFS service (Pinata/Infura)
- Real oracle integration (Chainlink/custom)

---

## 🎨 Frontend Architecture

### Next.js App Router Structure

```
frontend/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Landing page
│   ├── marketplace/
│   │   └── page.js        # Marketplace listing
│   ├── create/
│   │   └── page.js        # Create asset form
│   └── invest/
│       └── [tokenId]/
│           └── page.js    # Investment page
├── components/
│   ├── Navbar.js          # Navigation
│   ├── WalletConnect.js   # MetaMask integration
│   └── AssetCard.js       # Asset display card
└── app/globals.css        # Global styles
```

### Key Features
- **Wallet Integration**: MetaMask via ethers.js
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS
- **Data Fetching**: Fetch API (backend REST endpoints)

### User Flows

**1. Create Asset**:
```
User → Create Page → Form Input → Backend API → IPFS → Smart Contract Mint
```

**2. Browse Marketplace**:
```
User → Marketplace Page → Backend API → Display Assets → Click Asset → Invest Page
```

**3. Invest**:
```
User → Invest Page → Connect Wallet → Enter Amount → MetaMask → Smart Contract
```

---

## 🔒 Security Features & Checks

### 1. Smart Contract Security

#### Reentrancy Protection
**Used in**: EscrowVault, PayoutManager, Marketplace

```solidity
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EscrowVault is ReentrancyGuard {
    function deposit(...) external payable nonReentrant {
        // Safe from reentrancy attacks
    }
    
    function releaseFunds(...) external onlyPayoutManager nonReentrant {
        // Safe fund release
    }
}
```

**Protection**: Prevents reentrancy attacks during state changes

---

#### Access Control

**FutureYieldNFT**:
- `Ownable` - Owner controls updates
- Public minting (anyone can mint)
- Only owner can update escrow amounts (can be modified for production)

**FractionalOwnership**:
- `Ownable` - Only owner can record/transfer shares
- **Note**: For production, consider `AccessControl` to grant roles to PayoutManager and Marketplace

**EscrowVault**:
- `Ownable` - Owner sets PayoutManager
- `onlyPayoutManager` - Only PayoutManager can release funds
- Public deposits (anyone can deposit)

**OracleVerification**:
- `AccessControl` - Role-based access
- `ORACLE_ROLE` - Only oracles can verify income
- `DEFAULT_ADMIN_ROLE` - Only admin can add/remove oracles

**PayoutManager**:
- `Ownable` - Owner controls fees
- Public distribution (anyone can trigger payout)
- Protected by reentrancy guard

**Marketplace**:
- `Ownable` - Owner controls fees
- Public listing and purchasing
- Protected by reentrancy guard

---

#### Input Validation

**FutureYieldNFT**:
```solidity
require(yieldPercent > 0 && yieldPercent <= 10000, "Invalid yield percentage");
require(targetPrice > 0, "Target price must be greater than 0");
require(bytes(tokenURI).length > 0, "Token URI required");
```

**FractionalOwnership**:
```solidity
require(sharePercent > 0 && sharePercent <= 10000, "Invalid share percentage");
require(totalShares[tokenId] <= 10000, "Total shares exceed 100%");
require(investedAmount > 0, "Investment amount must be greater than 0");
```

**EscrowVault**:
```solidity
require(msg.value > 0, "Must send funds");
require(assetOwner != address(0), "Invalid asset owner");
require(escrowedFunds[tokenId] >= amount, "Insufficient escrowed funds");
```

**OracleVerification**:
```solidity
require(incomeAmount > 0, "Income amount must be greater than 0");
require(timestamp > 0, "Invalid timestamp");
require(bytes(verificationData).length > 0, "Verification data required");
require(!incomeRecords[tokenId][timestamp].verified, "Income already verified");
```

**PayoutManager**:
```solidity
require(!payoutProcessed[tokenId][timestamp], "Payout already processed");
require(record.verified, "Income not verified");
require(assetInfo.isActive, "Asset not active");
require(newFeePercent <= 2000, "Fee cannot exceed 20%");
```

**Marketplace**:
```solidity
require(price > 0, "Price must be greater than 0");
require(msg.value >= listing.price, "Insufficient payment");
require(listing.isActive, "Listing not active");
require(futureYieldNFT.ownerOf(tokenId) == msg.sender, "Not the owner");
```

---

#### Safe Math & Overflow Protection
- Solidity `^0.8.20` has built-in overflow protection
- All arithmetic operations are automatically checked

---

#### Double-Spend Prevention

**OracleVerification**:
```solidity
require(!incomeRecords[tokenId][timestamp].verified, "Income already verified");
```

**PayoutManager**:
```solidity
require(!payoutProcessed[tokenId][timestamp], "Payout already processed");
payoutProcessed[tokenId][timestamp] = true;
```

---

#### Safe External Calls

**EscrowVault.releaseFunds()**:
```solidity
(bool success, ) = recipient.call{value: amount}("");
require(success, "Transfer failed");
```

**Marketplace.purchaseItem()**:
```solidity
(bool success, ) = payable(listing.seller).call{value: sellerAmount}("");
require(success, "Transfer failed");
```

---

### 2. Fee Limits

**PayoutManager**:
- Platform fee: Max 20% (2000 basis points)
- Default: 5% (500 basis points)

**Marketplace**:
- Marketplace fee: Max 10% (1000 basis points)
- Default: 2.5% (250 basis points)

---

### 3. Share Limits

**FractionalOwnership**:
- Maximum total shares: 100% (10000 basis points)
- Prevents overselling of yield

---

### 4. Events & Transparency

All contracts emit events for:
- Asset minting
- Income verification
- Fund deposits/releases
- Payout distribution
- Listing creation/purchase

**Benefits**:
- On-chain transparency
- Easy frontend integration
- Audit trail

---

## 🔄 Workflow Diagrams

### Complete Investment Flow

```
┌─────────────┐
│ Asset Owner │
└──────┬──────┘
       │
       │ 1. Create Asset
       ▼
┌──────────────────┐
│ FutureYieldNFT   │
│ .mintFutureYield │
└──────┬───────────┘
       │
       │ 2. NFT Minted (tokenId)
       ▼
┌──────────────────┐
│ Marketplace      │
│ .createListing   │
└──────┬───────────┘
       │
       │ 3. Listing Created
       ▼
┌──────────────────┐
│    Investor      │
│  .purchaseItem   │
└──────┬───────────┘
       │
       │ 4. Funds Sent
       ▼
┌──────────────────┐
│  EscrowVault     │
│  .deposit        │
└──────┬───────────┘
       │
       │ 5. Record Investment
       ▼
┌──────────────────────┐
│ FractionalOwnership  │
│ .recordFraction      │
│ Purchase             │
└──────────────────────┘
```

### Complete Payout Flow

```
┌─────────────────┐
│ Real-World Asset│
│  Generates      │
│     Income      │
└────────┬────────┘
         │
         │ 1. Income Generated
         ▼
┌──────────────────────┐
│  Oracle Service      │
│  (Off-Chain)         │
│  Fetches Data        │
└────────┬─────────────┘
         │
         │ 2. Verify Income
         ▼
┌──────────────────────┐
│ OracleVerification   │
│ .verifyIncome        │
│ (Oracle Role)        │
└────────┬─────────────┘
         │
         │ 3. Income Recorded
         ▼
┌──────────────────────┐
│  PayoutManager       │
│  .distributePayout   │
│  (Public Call)       │
└────────┬─────────────┘
         │
         │ 4. Calculate Shares
         ├─────────────────────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐         ┌──────────────────┐
│ FutureYieldNFT   │         │ FractionalOwner  │
│ (Read Asset Info)│         │ (Read Shares)    │
└──────────────────┘         └──────────────────┘
         │                             │
         └─────────────┬───────────────┘
                       │
                       │ 5. Calculate Payouts
                       ▼
┌──────────────────────┐
│  EscrowVault         │
│  .releaseFunds       │
│  (Multiple Calls)    │
└────────┬─────────────┘
         │
         ├─────────────┬──────────────┬──────────────┐
         │             │              │              │
         ▼             ▼              ▼              ▼
┌──────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Asset Owner  │ │ Investor 1 │ │ Investor 2 │ │  Platform  │
│   (Yield)    │ │  (Share)   │ │  (Share)   │ │   (Fee)    │
└──────────────┘ └────────────┘ └────────────┘ └────────────┘
```

---

## 🚀 Deployment Architecture

### Development Environment

```
┌─────────────────────────────────────────────────────────┐
│              Development Machine                         │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Frontend │  │ Backend  │  │ Hardhat  │             │
│  │ :3000    │  │ :3001    │  │ :8545    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                  Frontend (Vercel/Netlify)               │
│              Next.js Static/SSR Deployment               │
└─────────────────────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Backend API (AWS/GCP/Heroku)                  │
│                  Express.js Server                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Database │  │  IPFS    │  │  Oracle  │             │
│  │  (RDS)   │  │ Service  │  │ Service  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         │
                         │ RPC
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Ethereum Network                            │
│  ┌──────────────────────────────────────────┐          │
│  │  Deployed Smart Contracts                │          │
│  │  - FutureYieldNFT                        │          │
│  │  - FractionalOwnership                   │          │
│  │  - EscrowVault                           │          │
│  │  - OracleVerification                    │          │
│  │  - PayoutManager                         │          │
│  │  - Marketplace                           │          │
│  └──────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Summary

### State Changes

1. **NFT Minting**: FutureYieldNFT state updated
2. **Investment**: EscrowVault + FractionalOwnership state updated
3. **Income Verification**: OracleVerification state updated
4. **Payout Distribution**: EscrowVault state decreased, FractionalOwnership updated

### Cross-Contract Calls

- **PayoutManager → OracleVerification**: Read income records
- **PayoutManager → FutureYieldNFT**: Read asset info
- **PayoutManager → FractionalOwnership**: Read/update shares
- **PayoutManager → EscrowVault**: Release funds
- **Marketplace → FutureYieldNFT**: Transfer NFTs
- **Marketplace → EscrowVault**: Deposit funds
- **Marketplace → FractionalOwnership**: Transfer shares

---

## 🔐 Security Checklist

### ✅ Implemented

- [x] Reentrancy guards on all payable functions
- [x] Access control (Ownable/AccessControl)
- [x] Input validation on all functions
- [x] Safe external calls with error handling
- [x] Overflow protection (Solidity 0.8.20)
- [x] Double-spend prevention
- [x] Fee limits (max 20% platform, 10% marketplace)
- [x] Share limits (max 100%)
- [x] Event emissions for transparency
- [x] Non-zero address checks

### ⚠️ Production Considerations

- [ ] Security audit by professional firm
- [ ] Multi-sig wallet for contract ownership
- [ ] Upgradeable contracts (if needed)
- [ ] Rate limiting on API endpoints
- [ ] CORS configuration
- [ ] API authentication/authorization
- [ ] Database security
- [ ] IPFS pinning service
- [ ] Real oracle network integration
- [ ] Comprehensive test coverage (>90%)
- [ ] Gas optimization
- [ ] Frontend input sanitization
- [ ] XSS/CSRF protection

---

## 📝 Summary

FutureRent is a **complete DeFi platform** that tokenizes future income from real-world assets. The architecture follows **separation of concerns** with:

- **Blockchain Layer**: 6 interconnected smart contracts
- **Backend Layer**: REST API with MVC structure
- **Frontend Layer**: Next.js with wallet integration

**Security is prioritized** with:
- Reentrancy protection
- Access control
- Input validation
- Safe external calls
- Transparent events

**The system enables**:
- Asset owners to tokenize future income
- Investors to purchase yield rights
- Automatic payout distribution
- Fractional ownership
- Transparent marketplace trading

This architecture provides a **solid foundation** for a production-ready DeFi platform with real-world asset tokenization.
