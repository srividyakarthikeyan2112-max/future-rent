# Quick Start: Connecting Frontend, Backend & Blockchain

## 🎯 Three Connection Types

### 1. Frontend ↔ Blockchain (via MetaMask)
**Direct connection** - User's browser → MetaMask → Blockchain
- Used for: Transactions, reading contract state
- User signs all transactions
- No backend needed

### 2. Frontend ↔ Backend (REST API)
**HTTP requests** - Frontend → Backend API
- Used for: Metadata storage, asset listings, IPFS
- Handles: User data, asset metadata, investment tracking

### 3. Backend ↔ Blockchain (ethers.js Provider)
**RPC connection** - Backend → Blockchain RPC
- Used for: Reading contract state, listening to events
- Optional: Sending transactions (requires private key)

---

## 📦 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
# Root (already done)
npm install

# Frontend
cd frontend
npm install ethers

# Backend
cd ../backend
npm install ethers
```

### Step 2: Deploy Contracts

```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contracts
npm run deploy
```

**Save the contract addresses!** You'll need them for configuration.

### Step 3: Copy Contract Artifacts

After compilation, copy ABIs to frontend:

```bash
# Option 1: Copy artifacts (one-time)
cp artifacts/contracts/FutureYieldNFT.sol/FutureYieldNFT.json frontend/contracts/
cp artifacts/contracts/Marketplace.sol/Marketplace.json frontend/contracts/
cp artifacts/contracts/EscrowVault.sol/EscrowVault.json frontend/contracts/
cp artifacts/contracts/FractionalOwnership.sol/FractionalOwnership.json frontend/contracts/

# Option 2: Symlink (recommended for development)
ln -s ../../artifacts/contracts frontend/contracts
```

### Step 4: Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3001
RPC_URL=http://127.0.0.1:8545

# Contract addresses (from deployment output)
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

# Contract addresses (same as backend)
NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
NEXT_PUBLIC_FRACTIONAL_OWNERSHIP_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
NEXT_PUBLIC_PAYOUT_MANAGER_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
```

### Step 5: Create Utility Files

See `INTEGRATION_GUIDE.md` for full code examples of:
- `frontend/utils/contracts.js` - Frontend blockchain connection
- `frontend/utils/api.js` - Frontend API connection  
- `backend/services/blockchainService.js` - Backend blockchain connection

### Step 6: Start All Services

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

## 🔌 Connection Summary

### Frontend → Blockchain
```javascript
// User clicks "Connect Wallet"
await window.ethereum.request({ method: 'eth_requestAccounts' });

// Get provider from MetaMask
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Get contract instance
const contract = new ethers.Contract(address, abi, signer);

// Call contract function
const tx = await contract.mintFutureYield(...);
await tx.wait();
```

### Frontend → Backend
```javascript
// Fetch assets
const response = await fetch('http://localhost:3001/api/assets');
const data = await response.json();

// Create asset (metadata)
const response = await fetch('http://localhost:3001/api/assets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(assetData),
});
```

### Backend → Blockchain
```javascript
const { ethers } = require('ethers');

// Create provider (read-only)
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// Get contract instance
const contract = new ethers.Contract(address, abi, provider);

// Read contract state
const assetInfo = await contract.getAssetInfo(tokenId);

// Listen to events
contract.on('AssetMinted', (tokenId, owner, ...) => {
  // Update database
});
```

---

## 🧪 Quick Test

1. **Test Backend**: Open `http://localhost:3001/health`
2. **Test Frontend**: Open `http://localhost:3000`
3. **Test Blockchain**: Check Hardhat node logs
4. **Test Integration**: Connect wallet in frontend

---

## 📚 Full Details

See `INTEGRATION_GUIDE.md` for:
- Complete code examples
- Detailed explanations
- Security considerations
- Production deployment
