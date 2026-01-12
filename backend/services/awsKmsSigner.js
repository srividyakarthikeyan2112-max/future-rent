/**
 * awsKmsSigner.js
 *
 * Template/example for integrating AWS KMS as a signer for Ethereum transactions.
 * This file does NOT enable KMS by default. It demonstrates how to implement a
 * KMS-backed signer. In production, you should secure permissions, rotate keys,
 * and test thoroughly.
 *
 * To use:
 *  - Create a KMS asymmetric key with SIGN_VERIFY capability and ECDSA_SHA_256
 *  - Grant the backend IAM role permission to use kms:Sign on the key
 *  - Set AWS_REGION and AWS_KMS_KEY_ID in env, then call createKmsSigner()
 */

const { KMSClient, SignCommand } = require('@aws-sdk/client-kms');
const { arrayify, hexlify } = require('ethers/lib/utils');

function createKmsClient(region) {
  return new KMSClient({ region });
}

/**
 * Very small example wrapper exposing a `signDigest` function and `getAddress`.
 * A full ethers Signer implementation is more involved; consider using an
 * existing library like `aws-kms-ethers` for production.
 */
function createKmsSigner({ region, keyId, address }) {
  if (!region || !keyId || !address) throw new Error('Missing KMS config');
  const kms = createKmsClient(region);

  async function signDigest(digestHex) {
    // KMS expects binary message
    const digest = arrayify(digestHex);
    const cmd = new SignCommand({ KeyId: keyId, Message: digest, MessageType: 'DIGEST', SigningAlgorithm: 'ECDSA_SHA_256' });
    const resp = await kms.send(cmd);
    // resp.Signature is ArrayBuffer
    const sig = Buffer.from(resp.Signature).toString('hex');
    return '0x' + sig;
  }

  return {
    getAddress: async () => address,
    signDigest,
  };
}

module.exports = { createKmsSigner };
