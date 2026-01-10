const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FutureRent Platform", function () {
  let futureYieldNFT;
  let fractionalOwnership;
  let escrowVault;
  let oracleVerification;
  let payoutManager;
  let marketplace;

  let owner;
  let assetOwner;
  let investor1;
  let investor2;
  let oracle;

  const YIELD_PERCENT = 5000; // 50%
  const TARGET_PRICE = ethers.parseEther("10");
  const TOKEN_URI = "ipfs://QmTest123";
  const ASSET_TYPE = "solar";

  beforeEach(async function () {
    [owner, assetOwner, investor1, investor2, oracle] = await ethers.getSigners();

    // Deploy contracts
    const FutureYieldNFT = await ethers.getContractFactory("FutureYieldNFT");
    futureYieldNFT = await FutureYieldNFT.deploy();

    const FractionalOwnership = await ethers.getContractFactory("FractionalOwnership");
    fractionalOwnership = await FractionalOwnership.deploy();

    const EscrowVault = await ethers.getContractFactory("EscrowVault");
    escrowVault = await EscrowVault.deploy();

    const OracleVerification = await ethers.getContractFactory("OracleVerification");
    oracleVerification = await OracleVerification.deploy();

    const PayoutManager = await ethers.getContractFactory("PayoutManager");
    payoutManager = await PayoutManager.deploy(
      await escrowVault.getAddress(),
      await oracleVerification.getAddress(),
      await fractionalOwnership.getAddress(),
      await futureYieldNFT.getAddress()
    );

    const Marketplace = await ethers.getContractFactory("Marketplace");
    marketplace = await Marketplace.deploy(
      await futureYieldNFT.getAddress(),
      await fractionalOwnership.getAddress(),
      await escrowVault.getAddress()
    );

    // Configure contracts
    await escrowVault.setPayoutManager(await payoutManager.getAddress());

    // Note: FractionalOwnership uses Ownable, so functions must be called by owner
    // For production, consider using AccessControl or transferring ownership

    // Add oracle
    await oracleVerification.addOracle(oracle.address);
  });

  describe("FutureYieldNFT", function () {
    it("Should mint a new NFT", async function () {
      await expect(
        futureYieldNFT
          .connect(assetOwner)
          .mintFutureYield(
            assetOwner.address,
            YIELD_PERCENT,
            TARGET_PRICE,
            TOKEN_URI,
            ASSET_TYPE
          )
      ).to.emit(futureYieldNFT, "AssetMinted");

      const tokenId = 1;
      expect(await futureYieldNFT.ownerOf(tokenId)).to.equal(assetOwner.address);
      expect(await futureYieldNFT.tokenURI(tokenId)).to.equal(TOKEN_URI);

      const assetInfo = await futureYieldNFT.getAssetInfo(tokenId);
      expect(assetInfo.assetOwner).to.equal(assetOwner.address);
      expect(assetInfo.totalYieldPercent).to.equal(YIELD_PERCENT);
      expect(assetInfo.targetPrice).to.equal(TARGET_PRICE);
      expect(assetInfo.isActive).to.be.true;
      expect(assetInfo.assetType).to.equal(ASSET_TYPE);
    });

    it("Should reject invalid yield percentage", async function () {
      await expect(
        futureYieldNFT
          .connect(assetOwner)
          .mintFutureYield(
            assetOwner.address,
            15000, // > 100%
            TARGET_PRICE,
            TOKEN_URI,
            ASSET_TYPE
          )
      ).to.be.revertedWith("Invalid yield percentage");
    });

    it("Should update escrow amount", async function () {
      await futureYieldNFT
        .connect(assetOwner)
        .mintFutureYield(
          assetOwner.address,
          YIELD_PERCENT,
          TARGET_PRICE,
          TOKEN_URI,
          ASSET_TYPE
        );

      const tokenId = 1;
      const escrowAmount = ethers.parseEther("5");
      await futureYieldNFT.updateEscrowAmount(tokenId, escrowAmount);

      const assetInfo = await futureYieldNFT.getAssetInfo(tokenId);
      expect(assetInfo.escrowAmount).to.equal(escrowAmount);
    });
  });

  describe("EscrowVault", function () {
    it("Should deposit funds to escrow", async function () {
      const tokenId = 1;
      const depositAmount = ethers.parseEther("10");

      await expect(
        escrowVault.connect(investor1).deposit(tokenId, assetOwner.address, {
          value: depositAmount,
        })
      ).to.emit(escrowVault, "FundsDeposited");

      expect(await escrowVault.getEscrowedAmount(tokenId)).to.equal(depositAmount);
    });

    it("Should only allow PayoutManager to release funds", async function () {
      const tokenId = 1;
      const depositAmount = ethers.parseEther("10");

      await escrowVault.connect(investor1).deposit(tokenId, assetOwner.address, {
        value: depositAmount,
      });

      await expect(
        escrowVault.connect(investor1).releaseFunds(tokenId, assetOwner.address, depositAmount)
      ).to.be.revertedWith("Only PayoutManager can call this");
    });
  });

  describe("OracleVerification", function () {
    it("Should verify income as oracle", async function () {
      const tokenId = 1;
      const incomeAmount = ethers.parseEther("100");
      const timestamp = Math.floor(Date.now() / 1000);
      const verificationData = "ipfs://QmVerify123";

      await expect(
        oracleVerification
          .connect(oracle)
          .verifyIncome(tokenId, incomeAmount, timestamp, verificationData)
      ).to.emit(oracleVerification, "IncomeVerified");

      const record = await oracleVerification.getIncomeRecord(tokenId, timestamp);
      expect(record.verified).to.be.true;
      expect(record.incomeAmount).to.equal(incomeAmount);
      expect(record.verifiedBy).to.equal(oracle.address);
    });

    it("Should reject verification from non-oracle", async function () {
      const tokenId = 1;
      const incomeAmount = ethers.parseEther("100");
      const timestamp = Math.floor(Date.now() / 1000);
      const verificationData = "ipfs://QmVerify123";

      await expect(
        oracleVerification
          .connect(investor1)
          .verifyIncome(tokenId, incomeAmount, timestamp, verificationData)
      ).to.be.reverted;
    });
  });

  describe("FractionalOwnership", function () {
    it("Should record fractional purchase", async function () {
      const tokenId = 1;
      const sharePercent = 3000; // 30%
      const investedAmount = ethers.parseEther("5");

      await expect(
        fractionalOwnership
          .connect(owner)
          .recordFractionPurchase(tokenId, investor1.address, sharePercent, investedAmount)
      ).to.emit(fractionalOwnership, "FractionPurchased");

      const share = await fractionalOwnership.getShare(tokenId, investor1.address);
      expect(share.sharePercent).to.equal(sharePercent);
      expect(share.investedAmount).to.equal(investedAmount);
    });

    it("Should prevent total shares exceeding 100%", async function () {
      const tokenId = 1;
      const sharePercent1 = 6000; // 60%
      const sharePercent2 = 5000; // 50% (would exceed 100%)

      await fractionalOwnership
        .connect(owner)
        .recordFractionPurchase(
          tokenId,
          investor1.address,
          sharePercent1,
          ethers.parseEther("5")
        );

      await expect(
        fractionalOwnership
          .connect(owner)
          .recordFractionPurchase(
            tokenId,
            investor2.address,
            sharePercent2,
            ethers.parseEther("5")
          )
      ).to.be.revertedWith("Total shares exceed 100%");
    });
  });

  describe("Marketplace", function () {
    beforeEach(async function () {
      // Mint NFT first
      await futureYieldNFT
        .connect(assetOwner)
        .mintFutureYield(
          assetOwner.address,
          YIELD_PERCENT,
          TARGET_PRICE,
          TOKEN_URI,
          ASSET_TYPE
        );
    });

    it("Should create a listing", async function () {
      const tokenId = 1;
      const listingPrice = ethers.parseEther("12");

      await futureYieldNFT.connect(assetOwner).approve(await marketplace.getAddress(), tokenId);

      await expect(
        marketplace
          .connect(assetOwner)
          .createListing(tokenId, listingPrice, 0) // 0 = full NFT
      ).to.emit(marketplace, "ListingCreated");

      const listing = await marketplace.getListing(1);
      expect(listing.tokenId).to.equal(tokenId);
      expect(listing.price).to.equal(listingPrice);
      expect(listing.isActive).to.be.true;
    });

    it("Should purchase an item", async function () {
      const tokenId = 1;
      const listingPrice = ethers.parseEther("12");

      await futureYieldNFT.connect(assetOwner).approve(await marketplace.getAddress(), tokenId);
      await marketplace.connect(assetOwner).createListing(tokenId, listingPrice, 0);

      await expect(
        marketplace.connect(investor1).purchaseItem(1, { value: listingPrice })
      ).to.emit(marketplace, "ItemPurchased");

      expect(await futureYieldNFT.ownerOf(tokenId)).to.equal(investor1.address);

      const listing = await marketplace.getListing(1);
      expect(listing.isActive).to.be.false;
    });
  });

  describe("PayoutManager", function () {
    beforeEach(async function () {
      // Setup: Mint NFT, deposit funds, record fractional ownership, verify income
      await futureYieldNFT
        .connect(assetOwner)
        .mintFutureYield(
          assetOwner.address,
          YIELD_PERCENT,
          TARGET_PRICE,
          TOKEN_URI,
          ASSET_TYPE
        );

      const tokenId = 1;
      await escrowVault
        .connect(investor1)
        .deposit(tokenId, assetOwner.address, { value: ethers.parseEther("5") });

      await fractionalOwnership
        .connect(owner)
        .recordFractionPurchase(
          tokenId,
          investor1.address,
          3000, // 30%
          ethers.parseEther("5")
        );

      const timestamp = Math.floor(Date.now() / 1000);
      await oracleVerification
        .connect(oracle)
        .verifyIncome(tokenId, ethers.parseEther("100"), timestamp, "ipfs://verify");
    });

    it("Should distribute payout", async function () {
      const tokenId = 1;
      const timestamp = Math.floor(Date.now() / 1000);

      // Need to add funds to escrow for payout
      await escrowVault
        .connect(investor1)
        .deposit(tokenId, assetOwner.address, { value: ethers.parseEther("200") });

      await expect(
        payoutManager.connect(owner).distributePayout(tokenId, timestamp)
      ).to.emit(payoutManager, "PayoutDistributed");

      expect(await payoutManager.isPayoutProcessed(tokenId, timestamp)).to.be.true;
    });
  });
});
