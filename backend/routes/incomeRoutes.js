const express = require('express');
const router = express.Router();
const { submitIncome } = require('../services/payoutService');

// POST /api/income/submit
router.post('/submit', async (req, res, next) => {
  try {
    const body = req.body || {};
    const required = ['assetId', 'period', 'incomeAmount', 'investorShare', 'ownerShare'];
    for (const k of required) {
      if (body[k] === undefined) return res.status(400).json({ error: `${k} required` });
    }

    const idempotencyKey = req.headers['idempotency-key'] || `${body.assetId}:${body.period}`;

    const result = await submitIncome({ id: idempotencyKey, assetId: body.assetId, period: body.period, incomeAmount: body.incomeAmount, investorShare: body.investorShare, ownerShare: body.ownerShare });
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
