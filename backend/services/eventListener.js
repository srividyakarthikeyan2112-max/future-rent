const ethService = require("./ethereumService");
const INVESTMENT_ABI = require("../contracts/InvestmentRegistry.json");
const INVESTMENT_CONTRACT = process.env.INVESTMENT_CONTRACT_ADDRESS || null;
const db = require("../data/db");

async function syncPastEvents() {
  if (!INVESTMENT_CONTRACT) {
    throw new Error('INVESTMENT_CONTRACT_ADDRESS not set');
  }
  const contract = ethService.getContract(INVESTMENT_ABI, INVESTMENT_CONTRACT, false);
  const filter = contract.filters.InvestmentCreated();
  const events = await contract.queryFilter(filter, 0, 'latest');
  let added = 0;
  for (const e of events) {
    const [investor, tokenId, sharePercent, investedAmount] = e.args;
    const inv = {
      tokenId: tokenId.toString(),
      investor,
      sharePercent: sharePercent.toString(),
      investedAmount: investedAmount.toString(),
      timestamp: (e.blockNumber || Math.floor(Date.now() / 1000)).toString(),
    };
    db.addInvestment(inv);
    added++;
  }
  return { synced: events.length, added };
}

async function resyncInvestment({ tokenId = null, investor = null } = {}) {
  if (!INVESTMENT_CONTRACT) throw new Error('INVESTMENT_CONTRACT_ADDRESS not set');
  const contract = ethService.getContract(INVESTMENT_ABI, INVESTMENT_CONTRACT, false);
  // Build filter; InvestmentCreated has indexed investor as first param, so we can filter by investor
  let filter;
  if (investor) {
    filter = contract.filters.InvestmentCreated(investor);
  } else {
    filter = contract.filters.InvestmentCreated();
  }
  const events = await contract.queryFilter(filter, 0, 'latest');
  // Optionally delete existing record(s)
  if (tokenId && investor) {
    require('../data/db').deleteInvestment(tokenId.toString(), investor);
  } else if (tokenId) {
    // delete any with tokenId for all investors
    const all = require('../data/db').getAllInvestments();
    for (const row of all) {
      if (row.tokenId === tokenId.toString()) require('../data/db').deleteInvestment(tokenId.toString(), row.investor);
    }
  }
  let added = 0;
  for (const e of events) {
    const [evtInvestor, evtTokenId, sharePercent, investedAmount] = e.args;
    if (tokenId && evtTokenId.toString() !== tokenId.toString()) continue;
    if (investor && evtInvestor.toLowerCase() !== investor.toLowerCase()) continue;
    const inv = {
      tokenId: evtTokenId.toString(),
      investor: evtInvestor,
      sharePercent: sharePercent.toString(),
      investedAmount: investedAmount.toString(),
      timestamp: (e.blockNumber || Math.floor(Date.now() / 1000)).toString(),
    };
    require('../data/db').addInvestment(inv);
    added++;
  }
  return { scanned: events.length, added };
}

function startInvestmentListener() {
  if (!INVESTMENT_CONTRACT) {
    console.warn("INVESTMENT_CONTRACT_ADDRESS not set; event listener not started");
    return;
  }

  try {
    const contract = ethService.getContract(INVESTMENT_ABI, INVESTMENT_CONTRACT, false);
    // initial sync (non-blocking)
    syncPastEvents()
      .then(r => console.log(`Synced ${r.synced} past InvestmentCreated events`))
      .catch(syncErr => console.error('Failed to sync past events:', syncErr.message || syncErr));

    // Real-time listener (also dedupe before storing)
    contract.on("InvestmentCreated", (investor, tokenId, sharePercent, investedAmount, event) => {
      const inv = {
        tokenId: tokenId.toString(),
        investor,
        sharePercent: sharePercent.toString(),
        investedAmount: investedAmount.toString(),
        timestamp: Math.floor(Date.now() / 1000).toString(),
      };
      db.addInvestment(inv);
      console.log("InvestmentCreated event persisted to DB:", inv);
    });

    console.log("Investment event listener started for", INVESTMENT_CONTRACT);
  } catch (err) {
    console.error("Failed to start investment listener:", err.message || err);
  }
}

module.exports = {
  startInvestmentListener,
  syncPastEvents,
  resyncInvestment,
};
