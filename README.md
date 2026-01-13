# FutureRent — Confidential Payouts with INCO

This repository is a prototype of a fractional real-estate platform (FutureRent) that demonstrates confidential computation for automated revenue payouts using an off-chain confidential compute provider (INCO). The system runs private payout logic off-chain, collects cryptographic proofs that the computation was executed correctly, and (optionally) submits proofs on-chain to trigger payouts. The implementation includes Solidity smart contracts, a Node.js backend, DB migrations, monitoring, and tests. A demo-friendly oracle fallback is included so the payout flow can be shown even without a deployed proof-verifier contract.

---

## Elevator pitch
When income is reported, the server sends private data to INCO to compute payouts confidentially and returns a proof. The system stores the proof, optionally submits it to an on-chain verifier for trustless payouts, and adds observability, retries, and safe fallbacks so the flow is robust and demo-ready.

## What this README contains
- Architecture & data flow
- Concrete files changed / added
- Tech stack and dependencies
- Smart contracts and oracle model
- How INCO is used and implemented
- How to run & test locally
- Monitoring, security, and production next steps

---

## High-level architecture (data flow)
1. Client or admin posts income data to backend `POST /api/income/submit`.
2. Backend validates and records the submission in `income_submissions` (idempotent).
3. Backend calls INCO with the payout program & inputs.
4. INCO runs confidential computation and returns proof/commitment metadata.
5. Backend updates DB (status PROOF_READY) and attempts on-chain submission:
   - If a proof-verifier contract is deployed, the backend calls `PayoutManager.submitProofAndPayout(...)`.
   - If not, the backend uses `OracleVerification` fallback to simulate verification for demos.
6. Backend exposes Prometheus metrics and logs for alerts on repeated INCO failures.

---

## What I added / changed (files & components)

- Backend services
  - `backend/services/incoClient.js` — INCO HTTP client implementing `compute(...)`, with a simple in-memory circuit-breaker and error classification.
  - `backend/services/payoutService.js` — Orchestration logic: validate submissions, persist to DB, call INCO, retry/backoff, store proof metadata, and submit on-chain (or use oracle fallback). Metrics instrumented here.
  - `backend/services/kmsSigner.js`, `backend/services/awsKmsSigner.js` — templates for KMS-backed signing (not enabled by default).
  - `backend/services/incoDocsClient.js` — small docs-search client & fallback index used by a helpful route for demos.

- Routes
  - `backend/routes/incomeRoutes.js` — `POST /api/income/submit` to accept income submissions.
  - `backend/routes/incoDocsRoutes.js` — `GET /api/inco-docs/search?q=...` (demo helper to search docs).

- Server
  - `backend/server.js` — mounts routes, exposes `/metrics` (Prometheus `prom-client`), and exports the Express `app` for testing.

- Database / migrations
  - `backend/data/migrations/001_create_income_submissions.sql` (and runtime `CREATE TABLE IF NOT EXISTS` usage in service).
  - DB file: `backend/data/investments.db` (SQLite used for local dev).
  - Table: `income_submissions` — tracks job id, asset_id, period, amounts, status, inco_proof_id, inco_commitment, tx_hash, last_error, created_at, updated_at.

- Smart contracts
  - `contracts/PayoutManager.sol` — payout orchestration on-chain (refactored to avoid stack-too-deep issues).
  - `contracts/OracleVerification.sol` — demo oracle verification used as a fallback.
  - `contracts/EscrowVault.sol`, `contracts/FractionalOwnership.sol`, `contracts/FutureYieldNFT.sol`, `contracts/Marketplace.sol` — platform primitives.
  - `contracts/vendor/Counters.sol` — small vendor lib included to avoid external OpenZeppelin import problems in the environment.

- Tests
  - `test/payout_integration_test.js` — Hardhat integration test exercising deploy + oracle fallback distribution flow.
  - `test/payoutService.unit.test.js` — unit tests that mock INCO and assert DB transitions.
  - `test/incomeRoute.test.js` and `test/incoDocsRoute.test.js` — endpoint tests using `supertest`.

---

## Full technology stack

- Blockchain & contracts: Solidity 0.8.x, Hardhat as the dev environment, Ethers.js in tests and scripts.
- Backend: Node.js (Express), SQLite for local persistence, Axios for HTTP calls.
- Confidential compute (INCO): integrated via `incoClient` (HTTP) — production can swap this for the vendor SDK.
- Monitoring: Prometheus metrics via `prom-client`, scraping `/metrics`.
- Secrets & signing: local private keys for dev; templates for AWS KMS signer are included for production.

---

## Smart contracts — quick summary

- `PayoutManager.sol`: receives proof submissions and triggers payouts.
- `OracleVerification.sol`: demo-only fallback that marks a submission as verified when the oracle reports it.
- `EscrowVault.sol`: holds funds to be distributed.
- `FractionalOwnership.sol` / `FutureYieldNFT.sol`: ownership tokens and fractionalization primitives.

---

## Oracles and verification model

- Primary design: INCO returns cryptographic commitments/proofs. A dedicated on-chain verifier contract should verify these proofs and allow `PayoutManager` to distribute funds trustlessly.
- Demo fallback: `OracleVerification.sol` is used to simulate proof verification on-chain so the payout flow can be demonstrated without a deployed verifier.

---

## How we used INCO (detailed)

- Role: INCO runs the payout logic over private inputs (income, investor splits) and returns a proof.
- Integration:
  - `backend/services/incoClient.js`: implements `compute(program, publicInputs, privateInputs, meta)`.
  - `backend/services/payoutService.js`: calls `incoClient.compute()` during submission processing and stores the returned proof metadata in `income_submissions`.
  - If a proof-verifier is present on-chain, the backend calls it to submit the proof; otherwise the backend uses the `OracleVerification` fallback.
- Robustness:
  - Retries with exponential backoff for transient network failures.
  - Circuit-breaker in `incoClient` to avoid overwhelming a failing INCO endpoint.
  - Prometheus metrics for latency and failure counts.

---

## Important environment variables (put in `backend/.env` for local dev)

> Do NOT commit secrets to the repo.

- `PRIVATE_KEY` — local private key for dev signing (production: use KMS).
- `RPC_URL` / `SHARDEUM_RPC` — blockchain RPC endpoints.
- `ORACLE_VERIFICATION_ADDRESS` — address of oracle fallback contract.
- `PAYOUT_CONTRACT_ADDRESS` — address of deployed `PayoutManager`.
- `INCO_BASE_URL`, `INCO_API_KEY`, `INCO_PROGRAM` — INCO configuration.
- `INCO_DOCS_URL`, `INCO_DOCS_API_KEY` — optional docs search service for demo.

---

## Database schema (important table)

- `income_submissions` fields:
  - `id`, `asset_id`, `period`, `income_amount`, `investor_share`, `owner_share`,
  - `status` (QUEUED, PROOF_READY, ONCHAIN_SUBMITTED, COMPLETED, FAILED),
  - `inco_proof_id`, `inco_commitment`, `tx_hash`, `last_error`, `created_at`, `updated_at`.

---

## How to run locally (quickstart)

1. Install dependencies:
```bash
npm install
# If backend has its own package.json, run:
# npm install --prefix backend
```

2. Start a local Hardhat node (optional for contract deployment and tests):
```bash
npx hardhat node
```

3. Deploy contracts (examples in `scripts/` or `backend/scripts/`):
```bash
# Example (adapt as needed):
node scripts/deploy.js
```

4. Start the backend server:
```bash
node backend/server.js
# or if packaged with a start script:
# npm --prefix backend start
```

5. Run tests:
```bash
npx hardhat test --show-stack-traces
# Fast single test run example:
npx hardhat test "test/incoDocsRoute.test.js" --show-stack-traces
```

6. Demo a submission:
```bash
curl -X POST http://localhost:3001/api/income/submit \
  -H "Content-Type: application/json" \
  -d '{"asset_id":"A1","period":"2025-12","income_amount":1000,"investor_share":700,"owner_share":300}'
```

---

## Monitoring & metrics

- `/metrics` endpoint exposes Prometheus metrics using `prom-client`.
- Example metrics instrumented in `payoutService`:
  - `inco_compute_failures_total` — counter for INCO failures.
  - `inco_compute_latency_seconds` — histogram for response latency.
  - `onchain_submissions_total` — counter for on-chain submit attempts.

Suggested alerts:
- Alert when rate(inco_compute_failures_total[5m]) > 5/min for > 10m.
- Alert when 95th percentile of `inco_compute_latency_seconds` exceeds acceptable threshold.

---

## Security recommendations

- Use KMS-backed Signer for production; do not store private keys in environment files.
- Store `INCO_API_KEY` and other secrets in a secret manager (Vault, AWS Secrets Manager, etc.).
- Protect `/api/income/submit` with authentication (admin token / JWT / mTLS).
- Limit access to `/metrics` or secure it via internal network/auth.

---

## Limitations & next steps for production

- Replace the HTTP `incoClient` with the official INCO SDK (map exact request/response/proof formats).
- Deploy a proof-verifier contract that verifies INCO proofs on-chain and adapt `PayoutManager` to accept proofs directly.
- Implement a KMS-backed `Signer` (AWS/GCP KMS) and wire it into `ethereumService`.
- Add robust end-to-end test coverage with a staging INCO environment.

---

## One-paragraph summary for judges

We built a prototype integration that sends confidential income data to INCO for private payout computation, stores returned proofs, and either submits proofs to an on-chain verifier for trustless payouts or uses an oracle fallback for demos. The system is robust (retries, circuit-breaker), observable (Prometheus metrics exposed on `/metrics`), and testable (unit and Hardhat integration tests). Templates for secure signing via KMS are provided for production.

---

If you want, I can:
- Add this README to the repo root (done below),
- Create a one-command demo script that deploys contracts, starts the backend, and executes a demo submission, or
- Produce a short 1–2 slide summary for judges.
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
