const express = require('express');
const router = express.Router();
const IncoDocsClient = require('../services/incoDocsClient');

// Construct a client instance per module; tests can replace it by setting router.incoDocsClient
router.incoDocsClient = new IncoDocsClient();

// GET /api/inco-docs/search?q=...
router.get('/search', async (req, res) => {
  const q = req.query.q || req.query.qs || req.query.query || '';
  try {
    const results = await router.incoDocsClient.search(q);
    res.json({ results });
  } catch (err) {
    console.error('inco-docs search error', err);
    res.status(500).json({ error: 'search_failed' });
  }
});

module.exports = router;
