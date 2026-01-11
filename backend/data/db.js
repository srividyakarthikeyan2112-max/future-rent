const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'investments.db');

// ensure data directory exists
const dataDir = path.join(__dirname);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(DB_PATH);

// initialize table
db.prepare(
  `CREATE TABLE IF NOT EXISTS investments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tokenId TEXT,
    investor TEXT,
    sharePercent TEXT,
    investedAmount TEXT,
    timestamp TEXT,
    UNIQUE(tokenId, investor)
  )`
).run();

const insertStmt = db.prepare(
  `INSERT OR IGNORE INTO investments (tokenId, investor, sharePercent, investedAmount, timestamp)
   VALUES (@tokenId, @investor, @sharePercent, @investedAmount, @timestamp)`
);

const selectByInvestor = db.prepare(
  `SELECT tokenId, investor, sharePercent, investedAmount, timestamp FROM investments WHERE lower(investor) = lower(?) ORDER BY id ASC`
);

const selectAll = db.prepare(
  `SELECT tokenId, investor, sharePercent, investedAmount, timestamp FROM investments ORDER BY id ASC`
);

function addInvestment(inv) {
  insertStmt.run(inv);
}

const deleteStmt = db.prepare(
  `DELETE FROM investments WHERE tokenId = ? AND lower(investor) = lower(?)`
);

function deleteInvestment(tokenId, investor) {
  return deleteStmt.run(tokenId, investor);
}

function getInvestmentsByAddress(address) {
  return selectByInvestor.all(address);
}

function getAllInvestments() {
  return selectAll.all();
}

module.exports = { addInvestment, getInvestmentsByAddress, getAllInvestments, deleteInvestment, db };
