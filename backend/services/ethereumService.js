const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY || null;

let _provider;
let _signer;

function getProvider() {
  if (!_provider) {
    _provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return _provider;
}

function getSigner() {
  if (_signer) return _signer;

  const provider = getProvider();

  if (PRIVATE_KEY) {
    _signer = new ethers.Wallet(PRIVATE_KEY, provider);
  } else {
    // If no private key provided and provider is local (Hardhat), use unlocked account 0
    try {
      _signer = provider.getSigner(0);
    } catch (err) {
      _signer = null;
    }
  }

  return _signer;
}

function getContract(abi, address, useSigner = false) {
  const provider = getProvider();
  const signerOrProvider = useSigner ? getSigner() : provider;
  if (!signerOrProvider) throw new Error("No signer or provider available");
  return new ethers.Contract(address, abi, signerOrProvider);
}

async function callRead(abi, address, methodName, args = []) {
  const contract = getContract(abi, address, false);
  return contract[methodName](...args);
}

async function sendTx(abi, address, methodName, args = [], txOverrides = {}) {
  const signer = getSigner();
  if (!signer) throw new Error("No signer available for write operation");
  const contract = new ethers.Contract(address, abi, signer);
  const tx = await contract[methodName](...args, txOverrides);
  const receipt = await tx.wait(1);
  return receipt;
}

async function deployContract(hre, contractName, args = []) {
  // helper used by hardhat deploy script if needed
  const Factory = await hre.ethers.getContractFactory(contractName);
  const contract = await Factory.deploy(...args);
  await contract.deployed();
  return contract;
}

module.exports = {
  getProvider,
  getSigner,
  getContract,
  callRead,
  sendTx,
  deployContract,
};
