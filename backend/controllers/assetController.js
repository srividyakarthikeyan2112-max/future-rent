const ipfsService = require("../services/ipfsService");

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
