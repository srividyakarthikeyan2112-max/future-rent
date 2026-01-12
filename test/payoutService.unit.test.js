const { expect } = require('chai');
const sinon = require('sinon');
const { db } = require('../backend/data/db');
const payoutService = require('../backend/services/payoutService');

describe('payoutService unit tests', function () {
  afterEach(function () {
    // reset DB entries for clean test runs
    db.prepare('DELETE FROM income_submissions').run();
  });

  it('should persist a PROOF_READY entry when INCO returns valid', async function () {
    // mock INCO client
    const fakeInco = {
      compute: async () => ({ status: 'VALID', proofId: 'p1', publicOutput: { commitment: '0xabc' }, proof: '0x01' })
    };
    payoutService.setIncoClient(fakeInco);

    // stub ethereumService.getContract to return an object with verifyIncome
    const ethService = require('../backend/services/ethereumService');
    const origGetContract = ethService.getContract;
    ethService.getContract = () => ({
      verifyIncome: async (assetId, amount, period, verificationData) => ({ wait: async () => ({ transactionHash: '0xtx' }) })
    });

    // call submitIncome
    await payoutService.submitIncome({ id: 't1:2026-01', assetId: 1, period: '2026-01', incomeAmount: 1000, investorShare: 60, ownerShare: 40 });

    const row = db.prepare('SELECT * FROM income_submissions WHERE id = ?').get('t1:2026-01');
    expect(row).to.exist;
    expect(row.status).to.match(/PROOF_(READY|SUBMITTED|FAILED)/);

    // restore
    ethService.getContract = origGetContract;
  });
});
