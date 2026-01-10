// Mock data store
let investments = [];

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
