async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy SimpleStorage if available
  try {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.deployed();
    console.log("SimpleStorage deployed to:", simpleStorage.address);
  } catch (e) {
    console.log("SimpleStorage contract not found or failed to deploy:", e.message || e);
  }

  // Deploy InvestmentRegistry if available
  try {
    const InvestmentRegistry = await ethers.getContractFactory("InvestmentRegistry");
    const investmentRegistry = await InvestmentRegistry.deploy();
    await investmentRegistry.deployed();
    console.log("InvestmentRegistry deployed to:", investmentRegistry.address);
  } catch (e) {
    console.log("InvestmentRegistry contract not found or failed to deploy:", e.message || e);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
