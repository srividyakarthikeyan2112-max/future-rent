const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const db = require('../data/db');
const eventListener = require('../services/eventListener');

// Protected route to list all persisted investments
router.get('/investments', adminAuth, (req, res) => {
  try {
    const all = db.getAllInvestments();
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint to manually trigger a sync of past events
router.post('/sync', adminAuth, async (req, res) => {
  try {
    const result = await eventListener.syncPastEvents();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint to delete an investment by tokenId + investor
router.delete('/investments', adminAuth, (req, res) => {
  try {
    const { tokenId, investor } = req.body;
    if (!tokenId || !investor) return res.status(400).json({ success: false, error: 'tokenId and investor required' });
    const result = db.deleteInvestment(tokenId.toString(), investor);
    res.json({ success: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin endpoint to resync a specific investment (by tokenId and/or investor)
router.post('/resync', adminAuth, async (req, res) => {
  try {
    const { tokenId, investor } = req.body || {};
    const result = await eventListener.resyncInvestment({ tokenId, investor });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
