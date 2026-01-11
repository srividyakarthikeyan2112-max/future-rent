const ipfsService = require("../services/ipfsService");
const ethService = require("../services/ethereumService");
const SIMPLE_ABI = require("../contracts/SimpleStorage.json");
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || null;

// Mock data store (in production, use database)
let assets = [];

/**
 * Get all assets
 */
exports.getAllAssets = async (req, res) => {
  try {
    // In production, fetch from blockchain and database
    res.json({
      success: true,
      data: assets,
      count: assets.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get asset by token ID
 */
exports.getAssetById = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    // In production, fetch from blockchain
    const asset = assets.find((a) => a.tokenId === parseInt(tokenId));
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        error: "Asset not found",
      });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create new asset
 */
exports.createAsset = async (req, res) => {
  try {
    const { assetOwner, yieldPercent, targetPrice, assetType, metadata } = req.body;

    // Validate input
    if (!assetOwner || !yieldPercent || !targetPrice || !assetType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Upload metadata to IPFS (mocked)
    const tokenURI = await ipfsService.uploadMetadata(metadata);

    // In production, call smart contract to mint NFT
    // For now, create mock asset
    const newAsset = {
      tokenId: assets.length + 1,
      assetOwner,
      yieldPercent,
      targetPrice,
      assetType,
      tokenURI,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    assets.push(newAsset);

    res.status(201).json({
      success: true,
      data: newAsset,
      message: "Asset created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Read on-chain value from SimpleStorage
 */
exports.getOnchainValue = async (req, res) => {
  try {
    if (!CONTRACT_ADDRESS) return res.status(500).json({ success: false, error: "CONTRACT_ADDRESS not set in env" });
    const value = await ethService.callRead(SIMPLE_ABI, CONTRACT_ADDRESS, "getValue", []);
    res.json({ success: true, data: value.toString() });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Set on-chain value in SimpleStorage (writes a transaction)
 */
exports.setOnchainValue = async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ success: false, error: "Missing value in body" });
    if (!CONTRACT_ADDRESS) return res.status(500).json({ success: false, error: "CONTRACT_ADDRESS not set in env" });
    const receipt = await ethService.sendTx(SIMPLE_ABI, CONTRACT_ADDRESS, "setValue", [value]);
    res.json({ success: true, txReceipt: receipt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
