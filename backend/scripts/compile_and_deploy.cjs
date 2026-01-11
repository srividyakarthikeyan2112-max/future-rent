const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config();

async function main() {
  const contractPath = path.join(__dirname, '..', 'contracts', 'SimpleStorage.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'SimpleStorage.sol': { content: source }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length) {
      console.error('Compilation errors:', errors);
      process.exit(1);
    }
  }

  const contractName = 'SimpleStorage';
  const abi = output.contracts['SimpleStorage.sol'][contractName].abi;
  const bytecode = output.contracts['SimpleStorage.sol'][contractName].evm.bytecode.object;

  // Save ABI for later usage
  const abiPath = path.join(__dirname, '..', 'contracts', 'SimpleStorage.json');
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

  const rpc = process.env.RPC_URL || 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(rpc);
  const signer = new ethers.Wallet('0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d', provider);

  console.log('Deploying to', rpc);

  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log('Deployed SimpleStorage at:', contract.target);

  // Append CONTRACT_ADDRESS to .env (or create)
  const envPath = path.join(__dirname, '..', '.env');
  let env = '';
  if (fs.existsSync(envPath)) env = fs.readFileSync(envPath, 'utf8');
  env = env.replace(/\n?CONTRACT_ADDRESS=.*\n?/g, '');
  env += `\nCONTRACT_ADDRESS=${contract.target}\n`;
  fs.writeFileSync(envPath, env);
  console.log('Wrote CONTRACT_ADDRESS to .env');
}

main().catch(err => { console.error(err); process.exit(1); });
