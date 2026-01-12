-- Migration: create income_submissions table
CREATE TABLE IF NOT EXISTS income_submissions (
  id TEXT PRIMARY KEY,
  asset_id INTEGER,
  period TEXT,
  income_amount INTEGER,
  investor_share INTEGER,
  owner_share INTEGER,
  status TEXT,
  inco_proof_id TEXT,
  inco_commitment TEXT,
  tx_hash TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  last_error TEXT
);
