require('dotenv').config();
const path = require('path');
(async function main(){
  try{
    console.log('CONTRACT_ADDRESS=' + (process.env.CONTRACT_ADDRESS||'<missing>'));
    console.log('INVESTMENT_CONTRACT_ADDRESS=' + (process.env.INVESTMENT_CONTRACT_ADDRESS||'<missing>'));
    const db = require('../data/db');
    console.log('\nPersisted DB investments:');
    console.log(db.getAllInvestments());

    const eth = require('../services/ethereumService');
    const INVESTMENT_ABI = require('../contracts/InvestmentRegistry.json');
    const addr = process.env.INVESTMENT_CONTRACT_ADDRESS;
    if(!addr){
      console.log('\nNo INVESTMENT_CONTRACT_ADDRESS set');
      return;
    }
    const contract = eth.getContract(INVESTMENT_ABI, addr, false);
    const filter = (contract.filters && contract.filters.InvestmentCreated) ? contract.filters.InvestmentCreated() : contract.filters['InvestmentCreated']();
    const evts = await contract.queryFilter(filter, 0, 'latest');
    console.log('\nOn-chain InvestmentCreated events (count=' + evts.length + '):');
    for(const e of evts){
      const [investor, tokenId, sharePercent, investedAmount] = e.args;
      console.log(JSON.stringify({ investor: investor, tokenId: tokenId.toString(), sharePercent: sharePercent.toString(), investedAmount: investedAmount.toString(), blockNumber: e.blockNumber, txHash: e.transactionHash }));
    }
  }catch(err){
    console.error('Error listing deployments/events:', err.message || err);
    process.exitCode = 1;
  }
})();
