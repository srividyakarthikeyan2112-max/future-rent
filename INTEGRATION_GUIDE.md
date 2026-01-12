# FutureRent - Frontend, Backend & Blockchain Integration Guide

This guide explains how to connect the three layers of the FutureRent platform.

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend to Blockchain Connection](#frontend-to-blockchain-connection)
3. [Frontend to Backend Connection](#frontend-to-backend-connection)
4. [Backend to Blockchain Connection](#backend-to-blockchain-connection)
5. [Complete Integration Setup](#complete-integration-setup)
6. [Contract Addresses Configuration](#contract-addresses-configuration)
7. [Example Implementations](#example-implementations)
8. [Testing the Integration](#testing-the-integration)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────────────┐        ┌──────────────────┐      │
│  │  MetaMask Wallet │        │  REST API Calls  │      │
│  │  (ethers.js)     │        │  (fetch/axios)   │      │
│  └────────┬─────────┘        └────────┬─────────┘      │
│           │                           │                  │
│           │ Direct RPC                │ HTTP Requests    │
│           │                           │                  │
└───────────┼───────────────────────────┼──────────────────┘
            │                           │
            │                           ▼
            │                  ┌──────────────────┐
            │                  │  BACKEND (Express)│
            │                  │  ┌──────────────┐│
            │                  │  │  ethers.js   ││
            │                  │  │  (Provider)  ││
            │                  │  └──────┬───────┘│
            │                  └─────────┼────────┘
            │                           │
            │                           │ RPC Connection
            └───────────────────────────┼──────────────────┐
                                        │                  │
                                        ▼                  ▼
                            ┌──────────────────────────────────┐
                            │     BLOCKCHAIN LAYER             │
                            │  (Hardhat Local / Testnet /      │
                            │   Mainnet via RPC)               │
                            │                                  │
                            │  Smart Contracts:                │
                            │  - FutureYieldNFT                │
                            │  - FractionalOwnership           │
                            │  - EscrowVault                   │
                            │  - OracleVerification            │
                            │  - PayoutManager                 │
                            │  - Marketplace                   │
                            └──────────────────────────────────┘
```

---

## 🔗 Frontend to Blockchain Connection

### Method 1: Direct Connection via MetaMask (Recommended)

**How it works:**
- User's browser has MetaMask extension
- Frontend uses `ethers.js` to interact with MetaMask
- MetaMask connects to blockchain network (local/testnet/mainnet)
- All transactions signed by user's wallet

### Setup Steps

#### 1. Install ethers.js in Frontend

```bash
cd frontend
npm install ethers
```

#### 2. Create Contract ABIs Directory

```bash
mkdir -p frontend/contracts
mkdir -p frontend/utils
```

#### 3. Create Contract Connection Utility

Create `frontend/utils/contracts.js`:

```javascript
import { ethers } from 'ethers';

// Contract ABIs (you'll need to copy these from artifacts after compilation)
// For now, we'll import them from artifacts
// Note: You'll need to copy ABIs from artifacts/contracts after compilation
// For now, we'll import from a contracts directory
// In production, copy from artifacts/contracts/*.sol/*.json to frontend/contracts/

// Example structure:
// import FutureYieldNFT_ABI from '../contracts/FutureYieldNFT.json';
// import Marketplace_ABI from '../contracts/Marketplace.json';
// import EscrowVault_ABI from '../contracts/EscrowVault.json';

// For now, we'll use placeholder - you'll need to add actual ABIs
const FutureYieldNFT_ABI = [];
const Marketplace_ABI = [];
const EscrowVault_ABI = [];
const FractionalOwnership_ABI = [];

// Contract addresses (will be set after deployment)
const CONTRACT_ADDRESSES = {
  FutureYieldNFT: process.env.NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS || '',
  Marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || '',
  EscrowVault: process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS || '',
  FractionalOwnership: process.env.NEXT_PUBLIC_FRACTIONAL_OWNERSHIP_ADDRESS || '',
  PayoutManager: process.env.NEXT_PUBLIC_PAYOUT_MANAGER_ADDRESS || '',
};

// Get provider (MetaMask)
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('MetaMask not installed');
};

// Get signer (user's wallet)
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// Get FutureYieldNFT contract instance
export const getFutureYieldNFTContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.FutureYieldNFT,
    FutureYieldNFT_ABI.abi,
    signer
  );
};

// Get Marketplace contract instance
export const getMarketplaceContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.Marketplace,
    Marketplace_ABI.abi,
    signer
  );
};

// Get EscrowVault contract instance
export const getEscrowVaultContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.EscrowVault,
    EscrowVault_ABI.abi,
    signer
  );
};

// Get FractionalOwnership contract instance
export const getFractionalOwnershipContract = async () => {
  const signer = await getSigner();
  return new ethers.Contract(
    CONTRACT_ADDRESSES.FractionalOwnership,
    FractionalOwnership_ABI.abi,
    signer
  );
};

// Connect wallet
export const connectWallet = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = getProvider();
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  } else {
    throw new Error('MetaMask not installed');
  }
};

// Get wallet address
export const getWalletAddress = async () => {
  const signer = await getSigner();
  return await signer.getAddress();
};
```

---

## 🔄 Frontend to Backend Connection

### Setup

#### 1. Create API Utility

Create `frontend/utils/api.js`:

```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Asset API
export const assetAPI = {
  // Get all assets
  getAll: () => fetchAPI('/assets'),
  
  // Get asset by ID
  getById: (tokenId) => fetchAPI(`/assets/${tokenId}`),
  
  // Create asset
  create: (assetData) => fetchAPI('/assets', {
    method: 'POST',
    body: JSON.stringify(assetData),
  }),
};

// Investment API
export const investmentAPI = {
  // Get investments by address
  getByAddress: (address) => fetchAPI(`/investments/${address}`),
  
  // Create investment
  create: (investmentData) => fetchAPI('/investments', {
    method: 'POST',
    body: JSON.stringify(investmentData),
  }),
};

export default fetchAPI;
```

#### 2. Update Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS=
NEXT_PUBLIC_MARKETPLACE_ADDRESS=
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=
NEXT_PUBLIC_FRACTIONAL_OWNERSHIP_ADDRESS=
NEXT_PUBLIC_PAYOUT_MANAGER_ADDRESS=
```

---

## 🖥️ Backend to Blockchain Connection

### Setup

#### 1. Install ethers.js in Backend

```bash
cd backend
npm install ethers
```

#### 2. Create Blockchain Service

Create `backend/services/blockchainService.js`:

```javascript
const { ethers } = require('ethers');
require('dotenv').config();

// RPC URL (Hardhat local, or testnet/mainnet)
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''; // Optional: for backend-initiated transactions

// Create provider (read-only or with private key for transactions)
let provider;
let signer;

if (PRIVATE_KEY) {
  // Provider with signer (can send transactions)
  provider = new ethers.JsonRpcProvider(RPC_URL);
  signer = new ethers.Wallet(PRIVATE_KEY, provider);
} else {
  // Read-only provider (only reads, no transactions)
  provider = new ethers.JsonRpcProvider(RPC_URL);
}

// Contract addresses (set after deployment)
const CONTRACT_ADDRESSES = {
  FutureYieldNFT: process.env.FUTURE_YIELD_NFT_ADDRESS || '',
  Marketplace: process.env.MARKETPLACE_ADDRESS || '',
  EscrowVault: process.env.ESCROW_VAULT_ADDRESS || '',
  FractionalOwnership: process.env.FRACTIONAL_OWNERSHIP_ADDRESS || '',
  PayoutManager: process.env.PAYOUT_MANAGER_ADDRESS || '',
  OracleVerification: process.env.ORACLE_VERIFICATION_ADDRESS || '',
};

// Load contract ABIs (from Hardhat artifacts)
const loadContractABI = (contractName) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const artifactPath = path.join(
      __dirname,
      '../../artifacts/contracts',
      `${contractName}.sol`,
      `${contractName}.json`
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return artifact.abi;
  } catch (error) {
    console.error(`Error loading ABI for ${contractName}:`, error);
    return null;
  }
};

// Get contract instance (read-only or with signer)
const getContract = (contractName, useSigner = false) => {
  const address = CONTRACT_ADDRESSES[contractName];
  const abi = loadContractABI(contractName);
  
  if (!address || !abi) {
    throw new Error(`Contract ${contractName} not configured`);
  }
  
  const contractProvider = useSigner && signer ? signer : provider;
  return new ethers.Contract(address, abi, contractProvider);
};

// FutureYieldNFT functions
const getFutureYieldNFT = (useSigner = false) => {
  return getContract('FutureYieldNFT', useSigner);
};

// Read asset info from blockchain
const getAssetInfo = async (tokenId) => {
  try {
    const contract = getFutureYieldNFT(false); // Read-only
    const assetInfo = await contract.getAssetInfo(tokenId);
    
    return {
      tokenId: tokenId.toString(),
      assetOwner: assetInfo.assetOwner,
      totalYieldPercent: assetInfo.totalYieldPercent.toString(),
      targetPrice: ethers.formatEther(assetInfo.targetPrice),
      escrowAmount: ethers.formatEther(assetInfo.escrowAmount),
      isActive: assetInfo.isActive,
      createdAt: assetInfo.createdAt.toString(),
      assetType: assetInfo.assetType,
    };
  } catch (error) {
    console.error('Error getting asset info:', error);
    throw error;
  }
};

// Get total supply
const getTotalSupply = async () => {
  try {
    const contract = getFutureYieldNFT(false);
    const supply = await contract.totalSupply();
    return supply.toString();
  } catch (error) {
    console.error('Error getting total supply:', error);
    throw error;
  }
};

// Marketplace functions
const getMarketplace = (useSigner = false) => {
  return getContract('Marketplace', useSigner);
};

// Get listing info
const getListing = async (listingId) => {
  try {
    const contract = getMarketplace(false);
    const listing = await contract.getListing(listingId);
    
    return {
      listingId: listingId.toString(),
      tokenId: listing.tokenId.toString(),
      seller: listing.seller,
      price: ethers.formatEther(listing.price),
      sharePercent: listing.sharePercent.toString(),
      isActive: listing.isActive,
      createdAt: listing.createdAt.toString(),
    };
  } catch (error) {
    console.error('Error getting listing:', error);
    throw error;
  }
};

// FractionalOwnership functions
const getFractionalOwnership = (useSigner = false) => {
  return getContract('FractionalOwnership', useSigner);
};

// Get investor shares
const getInvestorShares = async (tokenId, investorAddress) => {
  try {
    const contract = getFractionalOwnership(false);
    const share = await contract.getShare(tokenId, investorAddress);
    
    return {
      tokenId: tokenId.toString(),
      investor: share.investor,
      sharePercent: share.sharePercent.toString(),
      investedAmount: ethers.formatEther(share.investedAmount),
      claimedPayouts: ethers.formatEther(share.claimedPayouts),
      createdAt: share.createdAt.toString(),
    };
  } catch (error) {
    console.error('Error getting investor shares:', error);
    throw error;
  }
};

// EscrowVault functions
const getEscrowVault = (useSigner = false) => {
  return getContract('EscrowVault', useSigner);
};

// Get escrowed amount
const getEscrowedAmount = async (tokenId) => {
  try {
    const contract = getEscrowVault(false);
    const amount = await contract.getEscrowedAmount(tokenId);
    return ethers.formatEther(amount);
  } catch (error) {
    console.error('Error getting escrowed amount:', error);
    throw error;
  }
};

module.exports = {
  provider,
  signer,
  getFutureYieldNFT,
  getMarketplace,
  getFractionalOwnership,
  getEscrowVault,
  getAssetInfo,
  getTotalSupply,
  getListing,
  getInvestorShares,
  getEscrowedAmount,
  CONTRACT_ADDRESSES,
};
```

#### 3. Update Backend Environment Variables

Create `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# Blockchain RPC
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_here  # Optional: only if backend needs to send transactions

# Contract Addresses (set after deployment)
FUTURE_YIELD_NFT_ADDRESS=
MARKETPLACE_ADDRESS=
ESCROW_VAULT_ADDRESS=
FRACTIONAL_OWNERSHIP_ADDRESS=
PAYOUT_MANAGER_ADDRESS=
ORACLE_VERIFICATION_ADDRESS=
```

---

## 🔧 Complete Integration Setup

### Step-by-Step Setup

#### 1. Deploy Contracts and Get Addresses

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contracts
npm run deploy
```

Save the contract addresses from the deployment output.

#### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
RPC_URL=http://127.0.0.1:8545
FUTURE_YIELD_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
MARKETPLACE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
ESCROW_VAULT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
FRACTIONAL_OWNERSHIP_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
PAYOUT_MANAGER_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
ORACLE_VERIFICATION_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_FRACTIONAL_OWNERSHIP_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_PAYOUT_MANAGER_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

#### 3. Copy Contract Artifacts to Frontend

After compilation, copy ABIs:

```bash
# Copy artifacts to frontend
cp -r artifacts/contracts frontend/contracts
# Or create a symlink (recommended for development)
ln -s ../../artifacts/contracts frontend/contracts
```

#### 4. Start All Services

```bash
# Terminal 1: Hardhat node (already running)
npm run node

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
cd frontend
npm run dev
```

---

## 📝 Example Implementations

### Example 1: Frontend - Create Asset (Blockchain + Backend)

Update `frontend/app/create/page.js`:

```javascript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFutureYieldNFTContract } from "../../utils/contracts";
import { assetAPI } from "../../utils/api";

export default function CreateAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [formData, setFormData] = useState({
    yieldPercent: "",
    targetPrice: "",
    assetType: "solar",
    metadata: {
      name: "",
      description: "",
      image: "",
    },
  });

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        setConnected(true);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!connected) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload metadata to IPFS via backend
      const metadataResponse = await assetAPI.create({
        assetOwner: "", // Will be set from wallet
        yieldPercent: parseInt(formData.yieldPercent),
        targetPrice: formData.targetPrice,
        assetType: formData.assetType,
        metadata: formData.metadata,
      });

      const tokenURI = metadataResponse.data.tokenURI;

      // Step 2: Mint NFT on blockchain
      const contract = await getFutureYieldNFTContract();
      const signer = await contract.runner;
      const assetOwner = await signer.getAddress();

      const tx = await contract.mintFutureYield(
        assetOwner,
        parseInt(formData.yieldPercent) * 100, // Convert to basis points
        ethers.parseEther(formData.targetPrice),
        tokenURI,
        formData.assetType
      );

      await tx.wait();

      alert("Asset created successfully!");
      router.push("/marketplace");
    } catch (error) {
      console.error("Error creating asset:", error);
      alert("Error creating asset: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
}
```

### Example 2: Frontend - Purchase from Marketplace

```javascript
import { getMarketplaceContract } from "../../utils/contracts";
import { ethers } from "ethers";

const handlePurchase = async (listingId, price) => {
  try {
    const contract = await getMarketplaceContract();
    const tx = await contract.purchaseItem(listingId, {
      value: ethers.parseEther(price),
    });
    
    await tx.wait();
    alert("Purchase successful!");
    // Refresh listings
  } catch (error) {
    console.error("Error purchasing:", error);
    alert("Error purchasing: " + error.message);
  }
};
```

### Example 3: Backend - Read Asset Info from Blockchain

Update `backend/controllers/assetController.js`:

```javascript
const blockchainService = require("../services/blockchainService");

exports.getAssetById = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // Read from blockchain
    const assetInfo = await blockchainService.getAssetInfo(tokenId);
    
    // Optionally: Fetch additional data from database
    // const dbAsset = await Asset.findOne({ tokenId });
    
    res.json({
      success: true,
      data: assetInfo,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### Example 4: Backend - Sync Blockchain Events

Create `backend/services/eventListener.js`:

```javascript
const blockchainService = require("./blockchainService");

// Listen to AssetMinted events
const listenToAssetMinted = () => {
  const contract = blockchainService.getFutureYieldNFT(false);
  
  contract.on("AssetMinted", (tokenId, owner, yieldPercent, targetPrice, assetType, event) => {
    console.log("New asset minted:", {
      tokenId: tokenId.toString(),
      owner,
      yieldPercent: yieldPercent.toString(),
      targetPrice: targetPrice.toString(),
      assetType,
    });
    
    // Update database here
    // await Asset.create({ tokenId, owner, ... });
  });
};

// Listen to ListingCreated events
const listenToListingCreated = () => {
  const contract = blockchainService.getMarketplace(false);
  
  contract.on("ListingCreated", (listingId, tokenId, seller, price, sharePercent, event) => {
    console.log("New listing created:", {
      listingId: listingId.toString(),
      tokenId: tokenId.toString(),
      seller,
      price: price.toString(),
      sharePercent: sharePercent.toString(),
    });
  });
};

module.exports = {
  listenToAssetMinted,
  listenToListingCreated,
};
```

Add to `backend/server.js`:

```javascript
// ... existing code ...

// Start event listeners
const { listenToAssetMinted, listenToListingCreated } = require("./services/eventListener");
listenToAssetMinted();
listenToListingCreated();
```

---

## 🧪 Testing the Integration

### Test Checklist

1. **Frontend → Blockchain**
   - [ ] Connect MetaMask wallet
   - [ ] Mint NFT (create asset)
   - [ ] Purchase from marketplace
   - [ ] View asset info from blockchain

2. **Frontend → Backend**
   - [ ] Fetch assets list from API
   - [ ] Get asset by ID from API
   - [ ] Create asset (backend + blockchain)

3. **Backend → Blockchain**
   - [ ] Read asset info
   - [ ] Read listings
   - [ ] Listen to events

### Test Script

Create `test-integration.js` in root:

```javascript
const { ethers } = require("ethers");

async function testIntegration() {
  // Test backend connection
  const response = await fetch("http://localhost:3001/health");
  const data = await response.json();
  console.log("Backend health:", data);
  
  // Test blockchain connection
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const blockNumber = await provider.getBlockNumber();
  console.log("Blockchain block number:", blockNumber);
  
  // Test contract connection
  // Add your contract address
  const contractAddress = "0x...";
  // Add your ABI
  const abi = [...];
  const contract = new ethers.Contract(contractAddress, abi, provider);
  const totalSupply = await contract.totalSupply();
  console.log("Total supply:", totalSupply.toString());
}

testIntegration().catch(console.error);
```

---

## 🔐 Security Considerations

1. **Never expose private keys** in frontend
2. **Use environment variables** for contract addresses
3. **Validate user input** before blockchain calls
4. **Handle errors gracefully** (network errors, user rejection)
5. **Use read-only providers** for backend reads (unless needed for transactions)
6. **Rate limit API endpoints** to prevent abuse
7. **Validate contract addresses** before use
8. **Check network/chain ID** matches expected network

---

## 📚 Summary

**Connection Methods:**

1. **Frontend ↔ Blockchain**: Direct via MetaMask + ethers.js
   - User signs transactions
   - Reads contract state
   - Calls contract functions

2. **Frontend ↔ Backend**: HTTP REST API
   - Asset metadata
   - Investment tracking
   - IPFS integration

3. **Backend ↔ Blockchain**: ethers.js Provider
   - Read contract state
   - Listen to events
   - (Optional) Send transactions with private key

**Key Files:**
- `frontend/utils/contracts.js` - Frontend blockchain connection
- `frontend/utils/api.js` - Frontend API connection
- `backend/services/blockchainService.js` - Backend blockchain connection
- `.env` / `.env.local` - Configuration

**Flow:**
1. User action in Frontend
2. Frontend calls Backend API (optional metadata)
3. Frontend calls Blockchain (via MetaMask)
4. Backend listens to Blockchain events
5. Backend updates database
6. Frontend refreshes data from Backend/Blockchain

This architecture provides **flexibility** and **security** while maintaining **user control** over transactions.
