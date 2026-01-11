const express = require("express");
const router = express.Router();
const assetController = require("../controllers/assetController");

/**
 * @route GET /api/assets
 * @desc Get all assets
 */
router.get("/", assetController.getAllAssets);

/**
 * @route GET /api/assets/:tokenId
 * @desc Get asset by token ID
 */
router.get("/:tokenId", assetController.getAssetById);

/**
 * @route POST /api/assets
 * @desc Create new asset
 */
router.post("/", assetController.createAsset);

// On-chain test endpoints
router.get("/onchain/value", assetController.getOnchainValue);
router.post("/onchain/value", assetController.setOnchainValue);

module.exports = router;
