// Mock data store
let investments = [];
const ethService = require("../services/ethereumService");
const INVESTMENT_ABI = require("../contracts/InvestmentRegistry.json");
const INVESTMENT_CONTRACT = process.env.INVESTMENT_CONTRACT_ADDRESS || null;

/**
 * Get investments by address
 */
exports.getInvestmentsByAddress = async (req, res) => {
  try {
    const { address } = req.params;

    // In production, fetch from blockchain
    const userInvestments = investments.filter(
      (inv) => inv.investor === address
    );

    res.json({
      success: true,
      data: userInvestments,
      count: userInvestments.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create investment
 */
exports.createInvestment = async (req, res) => {
  try {
    const { tokenId, investor, sharePercent, investedAmount } = req.body;

    // Validate input
    if (!tokenId || !investor || !sharePercent || !investedAmount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // In production, call smart contract to record investment
    // For now, create mock investment
    const newInvestment = {
      tokenId,
      investor,
      sharePercent,
      investedAmount,
      claimedPayouts: 0,
      createdAt: new Date().toISOString(),
    };

    investments.push(newInvestment);

    res.status(201).json({
      success: true,
      data: newInvestment,
      message: "Investment created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get investments for an investor from the blockchain
 */
exports.getOnchainInvestments = async (req, res) => {
  try {
    const { address } = req.params;
    if (!INVESTMENT_CONTRACT) return res.status(500).json({ success: false, error: "INVESTMENT_CONTRACT_ADDRESS not set in env" });
    const result = await ethService.callRead(INVESTMENT_ABI, INVESTMENT_CONTRACT, "getInvestments", [address]);
    // result is an array of tuples; map to JS objects
    const mapped = result.map(r => ({ tokenId: r.tokenId.toString(), investor: r.investor, sharePercent: r.sharePercent.toString(), investedAmount: r.investedAmount.toString(), timestamp: r.timestamp.toString() }));
    res.json({ success: true, data: mapped, count: mapped.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Record investment on-chain by calling recordInvestment
 */
exports.recordOnchainInvestment = async (req, res) => {
  try {
    const { tokenId, investor, sharePercent, investedAmount } = req.body;
    if (!INVESTMENT_CONTRACT) return res.status(500).json({ success: false, error: "INVESTMENT_CONTRACT_ADDRESS not set in env" });
    if (!tokenId || !investor || !sharePercent || !investedAmount) return res.status(400).json({ success: false, error: "Missing fields" });
    const receipt = await ethService.sendTx(INVESTMENT_ABI, INVESTMENT_CONTRACT, "recordInvestment", [tokenId, investor, sharePercent, investedAmount]);
    res.json({ success: true, txReceipt: receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
