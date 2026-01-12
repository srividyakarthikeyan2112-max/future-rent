const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Payout flow (integration smoke test)', function () {
  let owner, oracle, investor1, investor2;
  let EscrowVault, OracleVerification, FractionalOwnership, FutureYieldNFT, PayoutManager;
  let escrow, oracleVerif, fractional, futureNft, payout;
  const hre = require('hardhat');

  beforeEach(async function () {
    [owner, oracle, investor1, investor2] = await ethers.getSigners();

    // Deploy mock EscrowVault
    escrow = await hre.ethers.deployContract('EscrowVault');
    console.log('escrow.address =', escrow.target || escrow.address || escrow);

    oracleVerif = await hre.ethers.deployContract('OracleVerification');
    console.log('oracleVerif.address =', oracleVerif.target || oracleVerif.address || oracleVerif);

    fractional = await hre.ethers.deployContract('FractionalOwnership');
    console.log('fractional.address =', fractional.target || fractional.address || fractional);

    futureNft = await hre.ethers.deployContract('FutureYieldNFT');
    console.log('futureNft.address =', futureNft.target || futureNft.address || futureNft);

    payout = await hre.ethers.deployContract('PayoutManager', [
      escrow.target || escrow.address,
      oracleVerif.target || oracleVerif.address,
      fractional.target || fractional.address,
      futureNft.target || futureNft.address
    ]);
    console.log('payout.address =', payout.target || payout.address || payout);

  // debug: log deployed addresses
  console.log('deployed:', { escrow: escrow.address, oracleVerif: oracleVerif.address, fractional: fractional.address, futureNft: futureNft.address, payout: payout.address });

  // Grant oracle role
  const ORACLE_ROLE = await oracleVerif.ORACLE_ROLE();
  const oracleAddr = await oracle.getAddress();
  await oracleVerif.connect(owner).addOracle(oracleAddr);

  // Setup asset in FutureYieldNFT by calling mintFutureYield
    let tx, receipt;
    try {
  const ownerAddr = await owner.getAddress();
  tx = await futureNft.connect(owner).mintFutureYield(ownerAddr, 1000, 100, 'ipfs://meta', 'solar');
      receipt = await tx.wait();
      console.log('mint tx:', tx.hash);
    } catch (err) {
      console.error('mint failed', err);
      throw err;
    }
  // derive tokenId from totalSupply
  const tokenId = Number(await futureNft.totalSupply());
  // tokenId is available to tests via this variable in beforeEach
  this.mintedTokenId = tokenId;

  // Setup fractional ownership: no investors in this simple case
  // Register payout manager on escrow so PayoutManager can release funds
  await escrow.connect(owner).setPayoutManager(payout.target || payout.address);
  });

  it('allows an oracle to verify income and payout to be distributed', async function () {
    const tokenId = this.mintedTokenId || 1;
    const timestamp = Math.floor(Date.now() / 1000);
    const incomeAmount = 1_000_000; // in smallest unit

    // Oracle verifies income
    await oracleVerif.connect(oracle).verifyIncome(tokenId, incomeAmount, timestamp, 'inco-proof-commitment');

  // Deposit funds into escrow so releaseFunds has balance
  const ownerAddr = await owner.getAddress();
  await escrow.connect(owner).deposit(tokenId, ownerAddr, { value: incomeAmount });

    // Distribute payout via manager
    await expect(payout.connect(owner).distributePayout(tokenId, timestamp)).to.emit(payout, 'PayoutDistributed');

    // Check payoutProcessed
    const processed = await payout.isPayoutProcessed(tokenId, timestamp);
    expect(processed).to.equal(true);
  });
});
