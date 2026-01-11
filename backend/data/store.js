// Simple in-memory store for demo purposes
const investments = [];

function addInvestment(inv) {
  investments.push(inv);
}

function getInvestmentsByAddress(address) {
  return investments.filter(i => i.investor.toLowerCase() === address.toLowerCase());
}

module.exports = {
  investments,
  addInvestment,
  getInvestmentsByAddress,
};
