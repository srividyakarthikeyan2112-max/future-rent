const express = require("express");
const router = express.Router();
const investmentController = require("../controllers/investmentController");
const db = require("../data/db");

/**
 * @route GET /api/investments/:address
 * @desc Get investments for an address
 */
router.get("/:address", investmentController.getInvestmentsByAddress);

/**
 * @route POST /api/investments
 * @desc Create investment
 */
router.post("/", investmentController.createInvestment);

// On-chain endpoints
router.post("/onchain", investmentController.recordOnchainInvestment);
router.get("/onchain/:address", investmentController.getOnchainInvestments);
// debug route removed; use admin endpoint /admin/investments

module.exports = router;
