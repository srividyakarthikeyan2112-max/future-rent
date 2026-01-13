FutureRent
it is a DeFi platform that tokenizes and trades the future income of real-world assets. Unlike traditional NFT marketplaces that sell asset ownership, FutureRent allows asset owners to mint NFTs representing a percentage of *future income only*.

 What this README contains
- Architecture & data flow
- Concrete files changed / added
- Tech stack and dependencies
- Smart contracts and oracle model
- How INCO is used and implemented
- How to run & test locally
- Monitoring, security, and production next steps

 High-level architecture (data flow)
1. Client or admin posts income data to backend `POST /api/income/submit`.
2. Backend validates and records the submission in `income_submissions` (idempotent).
3. Backend calls INCO with the payout program & inputs.
4. INCO runs confidential computation and returns proof/commitment metadata.
5. Backend updates DB (status PROOF_READY) and attempts on-chain submission:
   - If a proof-verifier contract is deployed, the backend calls `PayoutManager.submitProofAndPayout(...)`.
   - If not, the backend uses `OracleVerification` fallback to simulate verification for demos.
6. Backend exposes Prometheus metrics and logs for alerts on repeated INCO failures.

- Tests
  - `test/payout_integration_test.js` — Hardhat integration test exercising deploy + oracle fallback distribution flow.
  - `test/payoutService.unit.test.js` — unit tests that mock INCO and assert DB transitions.
  - `test/incomeRoute.test.js` and `test/incoDocsRoute.test.js` — endpoint tests using `supertest`.

Full technology stack
- Blockchain & contracts: Solidity 0.8.x, Hardhat as the dev environment, Ethers.js in tests and scripts.
- Backend: Node.js (Express), SQLite for local persistence, Axios for HTTP calls.
- Confidential compute (INCO): integrated via `incoClient` (HTTP) — production can swap this for the vendor SDK.
- Monitoring: Prometheus metrics via `prom-client`, scraping `/metrics`.
- Secrets & signing: local private keys for dev; templates for AWS KMS signer are included for production.

Smart contracts — summary
- `PayoutManager.sol`: receives proof submissions and triggers payouts.
- `OracleVerification.sol`: demo-only fallback that marks a submission as verified when the oracle reports it.
- `EscrowVault.sol`: holds funds to be distributed.
- `FractionalOwnership.sol` / `FutureYieldNFT.sol`: ownership tokens and fractionalization primitives.


Oracles and verification model
- Primary design: INCO returns cryptographic commitments/proofs. A dedicated on-chain verifier contract should verify these proofs and allow `PayoutManager` to distribute funds trustlessly.
- Demo fallback: `OracleVerification.sol` is used to simulate proof verification on-chain so the payout flow can be demonstrated without a deployed verifier.


INCO : When income is reported, the server sends private data to INCO to compute payouts confidentially and returns a proof. The system stores the proof, optionally submits it to an on-chain verifier for trustless payouts, and adds observability, retries, and safe fallbacks so the flow is robust and demo-ready.

 How we used INCO (detailed)

- Role: INCO runs the payout logic over private inputs (income, investor splits) and returns a proof.
- Integration:
  - `backend/services/incoClient.js`: implements `compute(program, publicInputs, privateInputs, meta)`.
  - `backend/services/payoutService.js`: calls `incoClient.compute()` during submission processing and stores the returned proof metadata in `income_submissions`.
  - If a proof-verifier is present on-chain, the backend calls it to submit the proof; otherwise the backend uses the `OracleVerification` fallback.
    
- Robustness:
  - Retries with exponential backoff for transient network failures.
  - Circuit-breaker in `incoClient` to avoid overwhelming a failing INCO endpoint.
  - Prometheus metrics for latency and failure counts.

 Database schema (important table)

- `income_submissions` fields:
  - `id`, `asset_id`, `period`, `income_amount`, `investor_share`, `owner_share`,
  - `status` (QUEUED, PROOF_READY, ONCHAIN_SUBMITTED, COMPLETED, FAILED),
  - `inco_proof_id`, `inco_commitment`, `tx_hash`, `last_error`, `created_at`, `updated_at`.


**FutureRent** is a DeFi platform that tokenizes and trades the future income of real-world assets. Unlike traditional NFT marketplaces that sell asset ownership, FutureRent allows asset owners to mint NFTs representing a percentage of **future income only**.

## 📁 Project Structure

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

## 🚧 Production Considerations

1. **Security Audit** - Get professional security audit
2. **Oracles** - Integrate real oracles (Chainlink, etc.)
3. **IPFS** - Use actual IPFS service (Pinata, Infura)
4. **Database** - Replace mock data with database
5. **Multi-sig** - Use multi-sig wallets for contract ownership
6. **Access Control** - Implement proper AccessControl for FractionalOwnership
7. **Gas Optimization** - Optimize contract gas usage
8. **Frontend** - Add error handling and loading states
9. **Testing** - Expand test coverage

FutureRent** - Tokenize Future Income, Build Tomorrow's Economy
