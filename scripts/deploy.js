const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy contracts in order
  console.log("\n1. Deploying FutureYieldNFT...");
  const FutureYieldNFT = await hre.ethers.getContractFactory("FutureYieldNFT");
  const futureYieldNFT = await FutureYieldNFT.deploy();
  await futureYieldNFT.waitForDeployment();
  const futureYieldNFTAddress = await futureYieldNFT.getAddress();
  console.log("FutureYieldNFT deployed to:", futureYieldNFTAddress);

  console.log("\n2. Deploying FractionalOwnership...");
  const FractionalOwnership = await hre.ethers.getContractFactory("FractionalOwnership");
  const fractionalOwnership = await FractionalOwnership.deploy();
  await fractionalOwnership.waitForDeployment();
  const fractionalOwnershipAddress = await fractionalOwnership.getAddress();
  console.log("FractionalOwnership deployed to:", fractionalOwnershipAddress);

  console.log("\n3. Deploying EscrowVault...");
  const EscrowVault = await hre.ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy();
  await escrowVault.waitForDeployment();
  const escrowVaultAddress = await escrowVault.getAddress();
  console.log("EscrowVault deployed to:", escrowVaultAddress);

  console.log("\n4. Deploying OracleVerification...");
  const OracleVerification = await hre.ethers.getContractFactory("OracleVerification");
  const oracleVerification = await OracleVerification.deploy();
  await oracleVerification.waitForDeployment();
  const oracleVerificationAddress = await oracleVerification.getAddress();
  console.log("OracleVerification deployed to:", oracleVerificationAddress);

  console.log("\n5. Deploying PayoutManager...");
  const PayoutManager = await hre.ethers.getContractFactory("PayoutManager");
  const payoutManager = await PayoutManager.deploy(
    escrowVaultAddress,
    oracleVerificationAddress,
    fractionalOwnershipAddress,
    futureYieldNFTAddress
  );
  await payoutManager.waitForDeployment();
  const payoutManagerAddress = await payoutManager.getAddress();
  console.log("PayoutManager deployed to:", payoutManagerAddress);

  console.log("\n6. Deploying Marketplace...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    futureYieldNFTAddress,
    fractionalOwnershipAddress,
    escrowVaultAddress
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  // Set PayoutManager in EscrowVault
  console.log("\n7. Configuring EscrowVault...");
  await escrowVault.setPayoutManager(payoutManagerAddress);
  console.log("EscrowVault configured with PayoutManager");

  // Note: FractionalOwnership uses Ownable, so functions will be called by owner
  // For production, you may want to create a multi-sig or use AccessControl
  console.log("\n8. Configuration complete");
  console.log("Note: FractionalOwnership operations must be called by owner");
  console.log("For production, consider using AccessControl or multi-sig");

  console.log("\n=== Deployment Summary ===");
  console.log("FutureYieldNFT:", futureYieldNFTAddress);
  console.log("FractionalOwnership:", fractionalOwnershipAddress);
  console.log("EscrowVault:", escrowVaultAddress);
  console.log("OracleVerification:", oracleVerificationAddress);
  console.log("PayoutManager:", payoutManagerAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
