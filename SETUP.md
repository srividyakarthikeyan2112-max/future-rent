# Quick Setup Guide

## Prerequisites
- Node.js v18+
- npm or yarn
- MetaMask browser extension

## Installation Steps

1. **Install root dependencies**
   ```bash
   npm install
   ```

2. **Install backend dependencies**
   ```bash
   cd backend && npm install && cd ..
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend && npm install && cd ..
   ```

4. **Create `.env` file in root**
   ```env
   PRIVATE_KEY=your_private_key_here
   PORT=3001
   NODE_ENV=development
   ```

## Running the Project

### Terminal 1: Hardhat Node
```bash
npm run node
```

### Terminal 2: Deploy Contracts
```bash
npm run deploy
```

Save the deployed contract addresses for later use.

### Terminal 3: Backend Server
```bash
cd backend
npm run dev
```

Backend runs on `http://localhost:3001`

### Terminal 4: Frontend
```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

## Testing

Run tests:
```bash
npm test
```

## Important Notes

1. **FractionalOwnership Access Control**: Currently uses `Ownable`. For production, consider:
   - Using `AccessControl` instead
   - Implementing multi-sig ownership
   - Granting specific roles to PayoutManager and Marketplace

2. **Oracle Integration**: Currently mocked. For production:
   - Integrate with Chainlink oracles
   - Set up custom oracle network
   - Implement off-chain data fetching

3. **IPFS Integration**: Currently mocked. For production:
   - Use Pinata or Infura IPFS
   - Implement proper metadata storage

4. **Database**: Backend uses in-memory storage. For production:
   - Add database (PostgreSQL, MongoDB)
   - Implement proper data persistence

5. **Security**: Before production:
   - Get professional security audit
   - Test all edge cases
   - Implement additional security measures
