const express = require("express");
const router = express.Router();
const investmentController = require("../controllers/investmentController");

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

module.exports = router;
