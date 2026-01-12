# FutureRent

**FutureRent** is a DeFi platform that tokenizes and trades the future income of real-world assets. Unlike traditional NFT marketplaces that sell asset ownership, FutureRent allows asset owners to mint NFTs representing a percentage of **future income only**.

## 🎯 Problem Statement

- Many real-world assets (solar rooftops, farmland, digital royalties) do not generate money immediately
- Asset owners need upfront capital
- Traditional finance does not allow selling future yield easily

## 💡 Solution

- Asset owners mint NFTs representing a % of FUTURE income
- Investors buy these at a discount
- Funds are locked in escrow
- Oracles verify real-world income generation
- Smart contracts automatically distribute payouts

## ⚠️ Important Distinction

- **NFT ≠ ownership of asset**
- **NFT = right to future income only**

## 📁 Project Structure

```
FUTURE RENT/
├── contracts/              # Smart contracts (Solidity)
│   ├── FutureYieldNFT.sol      # NFT representing future income
│   ├── FractionalOwnership.sol # Fractional yield ownership
│   ├── EscrowVault.sol         # Secure fund escrow
│   ├── OracleVerification.sol  # Income verification
│   ├── PayoutManager.sol       # Automatic payout distribution
│   └── Marketplace.sol         # Trading marketplace
├── scripts/                # Deployment scripts
│   └── deploy.js
├── test/                   # Test suite
│   └── FutureRent.test.js
├── backend/                # Express.js API
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/               # Next.js frontend
│   ├── app/
│   ├── components/
│   └── package.json
└── hardhat.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd "FUTURE RENT"
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

5. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PRIVATE_KEY=your_private_key_here
   SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
   
   # Backend
   PORT=3001
   NODE_ENV=development
   
   # Frontend (optional)
   NEXT_PUBLIC_CHAIN_ID=1337
   NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
   ```

### Running the Project

#### 1. Start Hardhat Local Network

In the root directory:
```bash
npm run node
```

This starts a local Hardhat node at `http://127.0.0.1:8545`.

#### 2. Deploy Contracts

In a new terminal, from the root directory:
```bash
npm run deploy
```

This will deploy all contracts to the local network and display their addresses.

#### 3. Run Tests

```bash
npm test
```

#### 4. Start Backend Server

In a new terminal:
```bash
cd backend
npm run dev
```

The backend API will run on `http://localhost:3001`.

#### 5. Start Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`.

## 📚 Smart Contracts

### FutureYieldNFT

ERC721 NFT contract representing future income rights of real-world assets.

**Key Features:**
- Mint NFTs with yield percentage metadata
- Store asset information (type, owner, target price)
- Track escrow amounts

### FractionalOwnership

Manages fractional ownership of future yield NFTs.

**Key Features:**
- Record fractional purchases
- Track investor shares per token
- Transfer fractional shares

### EscrowVault

Securely holds investor funds until payout distribution.

**Key Features:**
- Deposit funds to escrow
- Release funds only via PayoutManager
- Track escrowed amounts per token

### OracleVerification

Oracle-based verification of real-world income generation.

**Key Features:**
- Role-based oracle access
- Record verified income
- Query income records

### PayoutManager

Automatically distributes verified income to asset owners and investors.

**Key Features:**
- Calculate owner and investor shares
- Distribute payouts based on fractional ownership
- Handle platform fees
- Reentrancy protection

### Marketplace

Marketplace for buying and selling future yield NFTs and fractional shares.

**Key Features:**
- List NFTs and fractional shares
- Purchase items with escrow integration
- Marketplace fees

## 🔌 API Endpoints

### Assets

- `GET /api/assets` - Get all assets
- `GET /api/assets/:tokenId` - Get asset by token ID
- `POST /api/assets` - Create new asset

### Investments

- `GET /api/investments/:address` - Get investments for an address
- `POST /api/investments` - Create investment

## 🎨 Frontend Pages

- **/** - Landing page with platform overview
- **/marketplace** - Browse available assets
- **/create** - Create new asset (mint NFT)
- **/invest/:tokenId** - Invest in specific asset

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Tests cover:
- NFT minting
- Fractional investment
- Escrow deposits
- Oracle verification
- Payout distribution
- Marketplace operations

## 🔐 Security Features

- Reentrancy guards on critical functions
- Access control using OpenZeppelin
- Escrow protection
- Oracle role-based verification
- Input validation

## 🌐 Supported Assets

- **Solar Rooftops** - Electricity generation income
- **Farmland** - Agricultural yield income
- **Digital Royalties** - Music, art, content royalties

## 📝 Development Notes

- Contracts use Solidity ^0.8.20
- OpenZeppelin contracts for security
- Hardhat for development and testing
- Next.js 14 App Router for frontend
- Express.js for backend API
- Tailwind CSS for styling

## 🚀 Deployment

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions covering:
- Smart contracts deployment (Sepolia/Mainnet)
- Backend deployment (Vercel, Railway, Heroku, AWS)
- Frontend deployment (Vercel, Netlify, AWS)
- Environment configuration
- Post-deployment checklist

Quick reference: `DEPLOYMENT_CHECKLIST.md`

## 🚧 Production Considerations

Before deploying to production:

1. **Security Audit** - Get professional security audit
2. **Oracles** - Integrate real oracles (Chainlink, etc.)
3. **IPFS** - Use actual IPFS service (Pinata, Infura)
4. **Database** - Replace mock data with database
5. **Multi-sig** - Use multi-sig wallets for contract ownership
6. **Access Control** - Implement proper AccessControl for FractionalOwnership
7. **Gas Optimization** - Optimize contract gas usage
8. **Frontend** - Add error handling and loading states
9. **Testing** - Expand test coverage

## 📄 License

MIT

## 🤝 Contributing

This is a complete working implementation. Contributions are welcome!

## 📧 Contact

For questions or support, please open an issue.

---

**FutureRent** - Tokenize Future Income, Build Tomorrow's Economy
