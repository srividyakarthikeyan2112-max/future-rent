// KMS signer stub - replace with AWS/GCP/HashiCorp KMS implementation in production
const { getSigner } = require('./ethereumService');

async function getKmsSigner() {
  // For now return the local signer; replace with KMS-backed signer when available
  return getSigner();
}

module.exports = { getKmsSigner };
