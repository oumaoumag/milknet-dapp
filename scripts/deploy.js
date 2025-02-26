const hre = require("hardhat");

async function main() {
  const FarmerRegistration = await hre.ethers.getContractFactory("FarmerRegistration");
  const contract = await FarmerRegistration.deploy();

  await contract.waitForDeployment(); // Ensure the contract is fully deployed

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error deploying contract:", error);
    process.exit(1);
  });
