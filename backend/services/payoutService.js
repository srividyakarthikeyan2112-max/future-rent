const INCOClient = require('./incoClient');
const { getContract, getSigner, sendTx } = require('./ethereumService');
const { db } = require('../data/db');
require('dotenv').config();

const INCO_PROGRAM = process.env.INCO_PROGRAM || 'futureRentPayoutLogic_v1';
const ORACLE_WALLET = process.env.ORACLE_WALLET || null; // just metadata; signer comes from ethereumService

// prepare DB statements for income_submissions table
db.prepare(
  `CREATE TABLE IF NOT EXISTS income_submissions (
    id TEXT PRIMARY KEY,
    asset_id INTEGER,
    period TEXT,
    income_amount INTEGER,
    investor_share INTEGER,
    owner_share INTEGER,
    status TEXT,
    inco_proof_id TEXT,
    inco_commitment TEXT,
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT
  )`
).run();

const insertSubmission = db.prepare(
  `INSERT OR REPLACE INTO income_submissions (id, asset_id, period, income_amount, investor_share, owner_share, status, inco_proof_id, inco_commitment, tx_hash, last_error)
   VALUES (@id,@asset_id,@period,@income_amount,@investor_share,@owner_share,@status,@inco_proof_id,@inco_commitment,@tx_hash,@last_error)`
);

const selectById = db.prepare(`SELECT * FROM income_submissions WHERE id = ?`);

const INCOClientModule = require('./incoClient');
const promClient = require('prom-client');

let incoClient = new INCOClientModule();

function setIncoClient(client) {
  incoClient = client;
}

// Prometheus metrics
const incoFailures = new promClient.Counter({ name: 'inco_compute_failures_total', help: 'INCO compute failures', labelNames: ['service'] });
const incoLatency = new promClient.Histogram({ name: 'inco_compute_seconds', help: 'INCO compute latency seconds' });
const onchainSubmissions = new promClient.Counter({ name: 'payout_onchain_submissions_total', help: 'Onchain payout submissions', labelNames: ['status'] });

async function submitIncome(payload) {
  // basic validation (more robust checks should exist in controller)
  const { id, assetId, period, incomeAmount, investorShare, ownerShare } = payload;
  const rowId = id || `${assetId}:${period}`;

  // persist RECEIVED
  insertSubmission.run({
    id: rowId,
    asset_id: assetId,
    period,
    income_amount: incomeAmount,
    investor_share: investorShare,
    owner_share: ownerShare,
    status: 'RECEIVED',
    inco_proof_id: null,
    inco_commitment: null,
    tx_hash: null,
    last_error: null
  });

  // call INCO
  let resp;
  // call INCO with simple retry/backoff and measure latency
  let attempts = 0;
  const maxAttempts = 3;
  let lastErr = null;
  const start = Date.now();
  while (attempts < maxAttempts) {
    attempts += 1;
    try {
  resp = await incoClient.compute(INCO_PROGRAM, { assetId, period }, { income: incomeAmount, investorShare, ownerShare }, { requestId: rowId });
      lastErr = null;
      break;
    } catch (err) {
      lastErr = err;
      console.error(`INCO compute attempt ${attempts} failed:`, err.message || err);
      incoFailures.inc({ service: 'payoutService' });
      // exponential backoff
      await new Promise((r) => setTimeout(r, 500 * attempts));
    }
  }
  incoLatency.observe((Date.now() - start) / 1000);
  if (lastErr) {
    insertSubmission.run({ id: rowId, asset_id: assetId, period, income_amount: incomeAmount, investor_share: investorShare, owner_share: ownerShare, status: 'FAILED', last_error: lastErr.message });
    throw lastErr;
  }

  if (!resp || resp.status !== 'VALID') {
    insertSubmission.run({ id: rowId, asset_id: assetId, period, income_amount: incomeAmount, investor_share: investorShare, owner_share: ownerShare, status: 'FAILED', last_error: JSON.stringify(resp) });
    throw new Error('INCO returned invalid status');
  }

  // persist proof info
  insertSubmission.run({ id: rowId, asset_id: assetId, period, income_amount: incomeAmount, investor_share: investorShare, owner_share: ownerShare, status: 'PROOF_READY', inco_proof_id: resp.proofId || resp.proof_id, inco_commitment: resp.publicOutput?.commitment || null, tx_hash: null, last_error: null });

  // prepare on-chain call - for now assume contract and ABI env
  const payoutContractAddress = process.env.PAYOUT_CONTRACT_ADDRESS;
  let payoutAbi = [];
  try {
    const pm = require('../contracts/PayoutManager.json');
    payoutAbi = pm.abi || [];
  } catch (err) {
    // fallback to empty ABI when running unit tests without compiled artifacts
    payoutAbi = [];
  }

  // call submitProofAndPayout or distribute function depending on contract
  try {
    const signer = getSigner();
    const contract = getContract(payoutAbi, payoutContractAddress, true);

    // Example: call a method submitProofAndPayout(assetId, period, proofBytes, publicInputs)
    // We'll call a generic method 'submitProofAndPayout' if present, otherwise fallback to oracle verification path
    if (contract.submitProofAndPayout) {
      const tx = await contract.submitProofAndPayout(assetId, period, resp.proof, [resp.publicOutput?.commitment || '0x0']);
      const receipt = await tx.wait(1);
  insertSubmission.run({ id: rowId, asset_id: assetId, period, income_amount: incomeAmount, investor_share: investorShare, owner_share: ownerShare, status: 'PROOF_SUBMITTED', inco_proof_id: resp.proofId, inco_commitment: resp.publicOutput?.commitment || null, tx_hash: receipt.transactionHash, last_error: null });
      onchainSubmissions.inc({ status: 'success' });
      return { rowId, receipt };
    } else {
      // Fallback: call OracleVerification.verifyIncome as a way to simulate writing verified record (suitable for our current contracts)
      const oracleVerificationAddr = process.env.ORACLE_VERIFICATION_ADDRESS;
      let oracleAbi = [];
      try {
        const oj = require('../contracts/OracleVerification.json');
        oracleAbi = oj.abi || [];
      } catch (err) {
        oracleAbi = [];
      }
      const oracleContract = getContract(oracleAbi, oracleVerificationAddr, true);
      const verificationData = resp.publicOutput?.commitment || 'inco-proof';
      const tx = await oracleContract.verifyIncome(assetId, incomeAmount, Number(period), verificationData);
      const receipt = await tx.wait(1);
  insertSubmission.run({ id: rowId, asset_id: assetId, period, income_amount: incomeAmount, investor_share: investorShare, owner_share: ownerShare, status: 'PROOF_SUBMITTED', inco_proof_id: resp.proofId, inco_commitment: resp.publicOutput?.commitment || null, tx_hash: receipt.transactionHash, last_error: null });
      onchainSubmissions.inc({ status: 'success' });
      return { rowId, receipt };
    }
  } catch (err) {
    insertSubmission.run({ id: rowId, asset_id: assetId, period, income_amount: incomeAmount, investor_share: investorShare, owner_share: ownerShare, status: 'FAILED', last_error: err.message });
    console.error('On-chain submission failed', err.message);
    onchainSubmissions.inc({ status: 'failed' });
    throw err;
  }
}

module.exports = { submitIncome, selectById, setIncoClient };

