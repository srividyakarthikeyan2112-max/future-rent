# FutureRent - Deployment Checklist

Quick reference checklist for deploying FutureRent.

## 🔗 Smart Contracts Deployment

### Pre-Deployment
- [ ] Code reviewed and tested
- [ ] Security audit completed (recommended for mainnet)
- [ ] Testnet deployment tested
- [ ] Gas estimates calculated
- [ ] Wallet funded with ETH

### Deployment
- [ ] Hardhat configured with network settings
- [ ] Environment variables set (RPC URL, private key)
- [ ] Contracts compiled: `npm run compile`
- [ ] Contracts deployed: `npx hardhat run scripts/deploy.js --network [network]`
- [ ] Contract addresses saved
- [ ] Contracts verified on Etherscan (optional)

### Post-Deployment
- [ ] Test contract functions (mint, invest, verify)
- [ ] Configure contract relationships:
  - [ ] EscrowVault.setPayoutManager()
  - [ ] OracleVerification.addOracle()
- [ ] Ownership transferred to multi-sig (recommended)
- [ ] Contract addresses documented

---

## 🖥️ Backend Deployment

### Pre-Deployment
- [ ] Database setup (if using)
- [ ] IPFS service configured (if using real service)
- [ ] Oracle service configured (if using real oracle)
- [ ] Environment variables prepared
- [ ] CORS configured for frontend domain

### Deployment Platform Choice
- [ ] Vercel
- [ ] Railway
- [ ] Heroku
- [ ] AWS EC2
- [ ] Other: ___________

### Configuration
- [ ] Environment variables set:
  - [ ] PORT
  - [ ] NODE_ENV=production
  - [ ] RPC_URL
  - [ ] Contract addresses (all 6)
  - [ ] Database URL (if using)
  - [ ] IPFS credentials (if using)
  - [ ] Oracle credentials (if using)

### Deployment
- [ ] Deployed to chosen platform
- [ ] Health check working: `GET /health`
- [ ] API endpoints responding
- [ ] CORS working
- [ ] Environment variables verified

### Post-Deployment
- [ ] Test API endpoints:
  - [ ] GET /api/assets
  - [ ] GET /api/assets/:tokenId
  - [ ] POST /api/assets
  - [ ] GET /api/investments/:address
- [ ] Test blockchain connection
- [ ] Test event listeners (if implemented)
- [ ] Monitor logs for errors

---

## 🎨 Frontend Deployment

### Pre-Deployment
- [ ] Code builds successfully: `npm run build`
- [ ] All environment variables prepared
- [ ] Contract addresses from deployment
- [ ] Backend URL ready
- [ ] Images and assets optimized

### Deployment Platform Choice
- [ ] Vercel (recommended for Next.js)
- [ ] Netlify
- [ ] AWS S3 + CloudFront
- [ ] Other: ___________

### Configuration
- [ ] Environment variables set:
  - [ ] NEXT_PUBLIC_API_URL
  - [ ] NEXT_PUBLIC_CHAIN_ID
  - [ ] NEXT_PUBLIC_RPC_URL
  - [ ] NEXT_PUBLIC_FUTURE_YIELD_NFT_ADDRESS
  - [ ] NEXT_PUBLIC_MARKETPLACE_ADDRESS
  - [ ] NEXT_PUBLIC_ESCROW_VAULT_ADDRESS
  - [ ] NEXT_PUBLIC_FRACTIONAL_OWNERSHIP_ADDRESS
  - [ ] NEXT_PUBLIC_PAYOUT_MANAGER_ADDRESS

### Deployment
- [ ] Deployed to chosen platform
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Build successful
- [ ] Site accessible

### Post-Deployment
- [ ] Test all pages load:
  - [ ] Landing page (/)
  - [ ] Marketplace (/marketplace)
  - [ ] Create asset (/create)
  - [ ] Invest page (/invest/:tokenId)
- [ ] Test MetaMask connection
- [ ] Test network switching
- [ ] Test transactions:
  - [ ] Create asset
  - [ ] List asset
  - [ ] Purchase asset
  - [ ] Invest in asset
- [ ] Test responsive design
- [ ] Test error handling

---

## 🔐 Security Checklist

### Smart Contracts
- [ ] Private keys secured (not in Git)
- [ ] Multi-sig wallet for contract ownership
- [ ] Access controls verified
- [ ] Contract upgradeability considered (if needed)

### Backend
- [ ] `.env` file not committed to Git
- [ ] Environment variables secured
- [ ] Private keys not exposed (only if needed)
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if applicable)
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info

### Frontend
- [ ] No private keys in code
- [ ] Environment variables properly prefixed
- [ ] HTTPS enabled
- [ ] Error handling in place
- [ ] User input sanitized

### General
- [ ] All dependencies up to date
- [ ] No hardcoded secrets
- [ ] Security headers configured
- [ ] Monitoring/logging set up

---

## 🧪 Testing Checklist

### Functionality
- [ ] Asset creation flow works
- [ ] Marketplace listing works
- [ ] Asset purchase works
- [ ] Fractional investment works
- [ ] Income verification works (if oracle configured)
- [ ] Payout distribution works

### Integration
- [ ] Frontend ↔ Backend communication
- [ ] Frontend ↔ Blockchain (MetaMask)
- [ ] Backend ↔ Blockchain (RPC)
- [ ] All contract interactions

### Edge Cases
- [ ] Error handling
- [ ] Network switching
- [ ] Wallet disconnection
- [ ] Failed transactions
- [ ] Invalid inputs

---

## 📊 Monitoring & Maintenance

### Setup
- [ ] Error tracking (Sentry, LogRocket, etc.)
- [ ] Analytics (Google Analytics, Mixpanel, etc.)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Log aggregation (if needed)

### Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Contract addresses documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide created

---

## 🚀 Go-Live Checklist

### Final Checks
- [ ] All tests passing
- [ ] All environments configured
- [ ] All services running
- [ ] Monitoring set up
- [ ] Documentation complete
- [ ] Team notified

### Launch
- [ ] Deploy contracts to mainnet (if ready)
- [ ] Deploy backend to production
- [ ] Deploy frontend to production
- [ ] Verify all services working
- [ ] Test end-to-end flow
- [ ] Announce launch!

---

## 📝 Notes

**Deployment Order:**
1. Smart Contracts → Blockchain
2. Backend → Cloud Platform
3. Frontend → Static Hosting

**Recommended Testnet First:**
- Deploy to Sepolia testnet
- Test thoroughly
- Get security audit
- Deploy to mainnet

**Environment Variables:**
- Keep secure
- Use platform-specific secret management
- Never commit to Git
- Document all required variables

---

**Check off items as you complete them!**
