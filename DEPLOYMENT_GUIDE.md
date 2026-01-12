# FutureRent - Complete Deployment Guide

This guide covers deploying all components of the FutureRent platform to production.

## 📋 Table of Contents
1. [Deployment Overview](#deployment-overview)
2. [Smart Contracts Deployment](#smart-contracts-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Deployment Overview

FutureRent has three components to deploy:

1. **Smart Contracts** → Blockchain (Sepolia testnet or Mainnet)
2. **Backend API** → Cloud platform (Vercel, AWS, Heroku, Railway)
3. **Frontend** → Static hosting (Vercel, Netlify)

### Deployment Order

```
1. Deploy Smart Contracts → Get contract addresses
2. Configure Backend → Set contract addresses & RPC
3. Deploy Backend → Get backend URL
4. Configure Frontend → Set contract addresses & backend URL
5. Deploy Frontend → Public website
```

---

## 🔗 Smart Contracts Deployment

### Prerequisites

- MetaMask wallet with ETH for gas fees
- Private key or mnemonic (keep secure!)
- Hardhat configured with network settings

### Option 1: Deploy to Sepolia Testnet (Recommended for Testing)

#### Step 1: Get Sepolia ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/) or [Alchemy Faucet](https://sepoliafaucet.com/)
2. Request testnet ETH
3. Wait for confirmation (may take a few minutes)

#### Step 2: Configure Hardhat for Sepolia

Update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
```

#### Step 3: Set Environment Variables

Create `.env` in root:

```env
# Sepolia RPC URL (get from Alchemy/Infura)
SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key (optional, for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**⚠️ Security Warning:**
- Never commit `.env` file to Git
- Use environment variables in production
- Consider using hardware wallet for mainnet

#### Step 4: Deploy to Sepolia

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

**Save the contract addresses from the output!**

Example output:
```
FutureYieldNFT deployed to: 0x1234...
FractionalOwnership deployed to: 0x5678...
EscrowVault deployed to: 0x9abc...
...
```

#### Step 5: Verify Contracts (Optional)

```bash
# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

---

### Option 2: Deploy to Ethereum Mainnet

⚠️ **Production Deployment - Use with Caution!**

#### Prerequisites

1. **Security Audit**: Get professional audit before mainnet
2. **Multi-sig Wallet**: Use multi-sig for contract ownership
3. **Sufficient ETH**: Ensure enough ETH for gas fees
4. **Test Thoroughly**: Test on testnet first

#### Deployment Steps

Same as Sepolia, but:

1. Update network in `hardhat.config.js`:
```javascript
mainnet: {
  url: process.env.MAINNET_URL || "",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 1,
}
```

2. Use mainnet RPC URL:
```env
MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

---

## 🖥️ Backend Deployment

### Option 1: Deploy to Vercel (Recommended)

Vercel is great for Next.js, but also supports Express.js via serverless functions.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Create `vercel.json`

Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/health",
      "dest": "backend/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Configure Environment Variables

In Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `backend/.env`

#### Step 4: Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

### Option 2: Deploy to Railway

Railway is excellent for Node.js apps.

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login and Initialize

```bash
railway login
railway init
```

#### Step 3: Configure

1. Railway will detect your Node.js app
2. Set start command: `cd backend && npm start`
3. Add environment variables in Railway dashboard

#### Step 4: Deploy

```bash
railway up
```

Railway will automatically deploy on git push.

---

### Option 3: Deploy to Heroku

#### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Linux/Windows: Download from heroku.com
```

#### Step 2: Create Procfile

Create `Procfile` in `backend/`:

```
web: node server.js
```

#### Step 3: Configure package.json

Ensure `backend/package.json` has:

```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

#### Step 4: Deploy

```bash
# Login
heroku login

# Create app
heroku create futurerent-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=3001
heroku config:set RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
heroku config:set FUTURE_YIELD_NFT_ADDRESS=0x...
# ... add all contract addresses

# Deploy
git push heroku main
```

---

### Option 4: Deploy to AWS EC2

#### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch instance (Ubuntu 22.04)
3. Configure security group (open port 3001)
4. Create key pair and download

#### Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Setup Node.js

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 4: Clone and Setup

```bash
# Clone repository
git clone your-repo-url
cd FUTURE-RENT/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add all environment variables
```

#### Step 5: Start with PM2

```bash
# Start application
pm2 start server.js --name futurerent-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 6: Configure Nginx (Optional)

```bash
# Install Nginx
sudo apt install nginx

# Configure
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

---

## 🎨 Frontend Deployment

### Option 1: Deploy to Vercel (Recommended for Next.js)

Vercel is optimized for Next.js.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
cd frontend

# Login
vercel login

# Deploy
vercel --prod
```

Or use GitHub integration:
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### Step 3: Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_RPC_URL`
- `NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS`
- `NEXT_PUBLIC_MARKETPLACE_ADDRESS`
- ... (all contract addresses)

---

### Option 2: Deploy to Netlify

#### Step 1: Create `netlify.toml`

Create `netlify.toml` in `frontend/`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Step 2: Deploy

1. Push to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import project from GitHub
4. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `.next`

#### Step 3: Environment Variables

Add in Netlify dashboard → Site Settings → Environment Variables

---

### Option 3: Deploy to AWS S3 + CloudFront

#### Step 1: Build Static Export

Update `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

Build:
```bash
cd frontend
npm run build
```

#### Step 2: Upload to S3

```bash
# Install AWS CLI
aws configure

# Sync build to S3
aws s3 sync out/ s3://your-bucket-name --delete
```

#### Step 3: Configure CloudFront

1. Create CloudFront distribution
2. Origin: S3 bucket
3. Default root object: `index.html`
4. Deploy

---

## ⚙️ Environment Configuration

### Backend Environment Variables

**Production `.env`:**

```env
PORT=3001
NODE_ENV=production

# Blockchain RPC
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# OR for mainnet:
# RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Private key (only if backend needs to send transactions)
# PRIVATE_KEY=your_private_key_here

# Contract Addresses (from deployment)
FUTURE_YIELD_NFT_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
ESCROW_VAULT_ADDRESS=0x...
FRACTIONAL_OWNERSHIP_ADDRESS=0x...
PAYOUT_MANAGER_ADDRESS=0x...
ORACLE_VERIFICATION_ADDRESS=0x...

# Database (if using)
DATABASE_URL=postgresql://...
# OR MongoDB:
# MONGODB_URI=mongodb://...

# IPFS (if using real service)
IPFS_API_KEY=your_ipfs_key
IPFS_SECRET=your_ipfs_secret
```

### Frontend Environment Variables

**Production `.env.production` or Vercel/Netlify config:**

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_CHAIN_ID=11155111
# OR for mainnet:
# NEXT_PUBLIC_CHAIN_ID=1

NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
# OR for mainnet:
# NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS=0x...
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
NEXT_PUBLIC_ESCROW_VAULT_ADDRESS=0x...
NEXT_PUBLIC_FRACTIONAL_OWNERSHIP_ADDRESS=0x...
NEXT_PUBLIC_PAYOUT_MANAGER_ADDRESS=0x...
```

**Note:** `NEXT_PUBLIC_` prefix is required for Next.js to expose variables to browser.

---

## ✅ Post-Deployment Checklist

### Smart Contracts
- [ ] Contracts deployed and verified
- [ ] Contract addresses saved
- [ ] Ownership transferred to multi-sig (if applicable)
- [ ] Oracle addresses added to OracleVerification
- [ ] PayoutManager configured in EscrowVault
- [ ] Test basic functions (mint, invest, verify income)

### Backend
- [ ] Environment variables configured
- [ ] RPC connection working
- [ ] API endpoints responding
- [ ] Health check endpoint working
- [ ] CORS configured for frontend domain
- [ ] Database connected (if using)
- [ ] Event listeners running (if implemented)

### Frontend
- [ ] Environment variables configured
- [ ] Contract addresses correct
- [ ] Backend URL correct
- [ ] MetaMask connection working
- [ ] Network switch detection working
- [ ] All pages loading correctly
- [ ] Transactions working

### Security
- [ ] `.env` files not in Git
- [ ] Private keys secured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if applicable)
- [ ] Error handling in place

### Testing
- [ ] Create asset flow works
- [ ] Marketplace listing works
- [ ] Investment flow works
- [ ] Income verification works (if oracle configured)
- [ ] Payout distribution works

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Contract Deployment Fails

**Error:** `insufficient funds for gas`

**Solution:**
- Ensure wallet has enough ETH
- Check gas prices
- Try reducing gas limit

#### 2. Backend Can't Connect to Blockchain

**Error:** `network error` or `connection refused`

**Solution:**
- Check RPC URL is correct
- Verify API key is valid
- Test RPC URL with curl: `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' YOUR_RPC_URL`

#### 3. Frontend Can't Connect to Contracts

**Error:** `contract not deployed` or `invalid address`

**Solution:**
- Verify contract addresses are correct
- Check network ID matches
- Ensure contracts are deployed on same network
- Check MetaMask is on correct network

#### 4. CORS Errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
- Add frontend domain to backend CORS whitelist
- Update `backend/server.js`:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:3000'],
  credentials: true,
}));
```

#### 5. Environment Variables Not Working (Frontend)

**Error:** Variables undefined in browser

**Solution:**
- Ensure variables have `NEXT_PUBLIC_` prefix
- Restart Next.js dev server
- Rebuild after adding variables
- Check Vercel/Netlify environment variable settings

---

## 📊 Deployment Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│              PRODUCTION ENVIRONMENT                      │
│                                                          │
│  ┌──────────────────────────────────────────┐          │
│  │        FRONTEND (Vercel/Netlify)         │          │
│  │  Next.js Static/SSR                      │          │
│  │  https://futurerent.app                   │          │
│  └───────────────┬──────────────────────────┘          │
│                  │                                       │
│                  │ HTTPS                                 │
│                  ▼                                       │
│  ┌──────────────────────────────────────────┐          │
│  │        BACKEND (Railway/Heroku/AWS)      │          │
│  │  Express.js API                          │          │
│  │  https://api.futurerent.app               │          │
│  │  ┌──────────┐  ┌──────────┐             │          │
│  │  │ Database │  │ IPFS/Ora │             │          │
│  │  │ (Optional)│ │ cle APIs │             │          │
│  │  └──────────┘  └──────────┘             │          │
│  └───────────────┬──────────────────────────┘          │
│                  │                                       │
│                  │ RPC                                   │
│                  ▼                                       │
│  ┌──────────────────────────────────────────┐          │
│  │      BLOCKCHAIN (Sepolia/Mainnet)        │          │
│  │  Smart Contracts                         │          │
│  │  - FutureYieldNFT                        │          │
│  │  - Marketplace                           │          │
│  │  - EscrowVault                           │          │
│  │  - PayoutManager                         │          │
│  │  - OracleVerification                    │          │
│  │  - FractionalOwnership                   │          │
│  └──────────────────────────────────────────┘          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Deployment Checklist

1. **Smart Contracts**
   ```bash
   npm run compile
   npx hardhat run scripts/deploy.js --network sepolia
   # Save contract addresses
   ```

2. **Backend**
   - Choose platform (Railway/Heroku/Vercel)
   - Set environment variables
   - Deploy
   - Test API endpoints

3. **Frontend**
   - Push to GitHub
   - Connect to Vercel/Netlify
   - Set environment variables
   - Deploy
   - Test all flows

4. **Verify**
   - Test all user flows
   - Check contract interactions
   - Verify API endpoints
   - Test MetaMask integration

---

## 📚 Additional Resources

- [Hardhat Deployment Guide](https://hardhat.org/tutorial/deploying-to-a-live-network)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app)
- [Heroku Node.js Guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Alchemy Documentation](https://docs.alchemy.com)
- [Etherscan Verification](https://docs.etherscan.io)

---

**Ready to deploy!** Follow the steps above for your chosen platforms. Start with testnet, test thoroughly, then move to mainnet when ready.
