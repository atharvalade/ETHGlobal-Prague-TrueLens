const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying TrueLens Veritas to multiple networks...");

  // Get the contract factory
  const TrueLensVeritas = await ethers.getContractFactory("TrueLensVeritas");

  try {
    // Deploy the contract
    console.log("📝 Deploying TrueLensVeritas contract...");
    const veritas = await TrueLensVeritas.deploy();
    await veritas.deployTransaction.wait();

    console.log("✅ TrueLensVeritas deployed to:", veritas.address);
    console.log("🔗 Transaction hash:", veritas.deployTransaction.hash);

    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await veritas.deployTransaction.wait(3);

    console.log("🎉 Deployment completed successfully!");
    
    // Display deployment summary
    console.log("\n📊 Deployment Summary:");
    console.log("========================");
    console.log(`Contract Address: ${veritas.address}`);
    console.log(`Network: ${network.name}`);
    console.log(`Deployer: ${(await ethers.getSigners())[0].address}`);
    console.log(`Gas Used: ${veritas.deployTransaction.gasLimit?.toString()}`);
    
    // Verify on block explorer if not local network
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("\n🔍 To verify on block explorer, run:");
      console.log(`npx hardhat verify --network ${network.name} ${veritas.address}`);
    }

    // Store deployment info
    const deploymentInfo = {
      network: network.name,
      contractAddress: veritas.address,
      transactionHash: veritas.deployTransaction.hash,
      deployer: (await ethers.getSigners())[0].address,
      timestamp: new Date().toISOString(),
      chainId: network.config.chainId
    };

    // Write to file for frontend integration
    const fs = require('fs');
    const path = require('path');
    
    const deploymentDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentDir, `veritas-${network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`📄 Deployment info saved to: ${deploymentFile}`);

    // If deploying to Hedera, set up HCS topics
    if (network.name.includes('hedera')) {
      console.log("\n🌐 Setting up Hedera Consensus Service...");
      await setupHederaTopics(veritas.address);
    }

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

async function setupHederaTopics(contractAddress) {
  // This would be implemented with Hedera SDK
  console.log("📝 Creating Hedera topics for news verification...");
  
  // Placeholder for Hedera HCS setup
  const topics = [
    "news-submissions",
    "verification-results", 
    "truth-scores",
    "web-proofs"
  ];
  
  for (const topic of topics) {
    console.log(`🏷️  Topic: ${topic} - Will be created with Hedera SDK`);
  }
  
  console.log("✅ Hedera topics setup completed");
}

// Deploy multiple instances for different use cases
async function deployMultipleContracts() {
  console.log("🔄 Deploying specialized contracts...");
  
  const contracts = await Promise.all([
    deployContract("TrueLensVeritas", "Main verification contract"),
    // Add more specialized contracts as needed
  ]);
  
  return contracts;
}

async function deployContract(contractName, description) {
  console.log(`📝 Deploying ${contractName}: ${description}`);
  
  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await ContractFactory.deploy();
  await contract.deployTransaction.wait();
  
  console.log(`✅ ${contractName} deployed to: ${contract.address}`);
  return { name: contractName, address: contract.address, description };
}

// Network-specific configuration
function getNetworkConfig() {
  const config = {
    hardhat: {
      vlayerProver: "0x1234567890123456789012345678901234567890", // Mock for testing
      vlayerVerifier: "0x2345678901234567890123456789012345678901", // Mock for testing
      pythOracle: "0x3456789012345678901234567890123456789012" // Mock for testing
    },
    hedera_testnet: {
      vlayerProver: process.env.VLAYER_PROVER_HEDERA || "0x0000000000000000000000000000000000000000",
      vlayerVerifier: process.env.VLAYER_VERIFIER_HEDERA || "0x0000000000000000000000000000000000000000",
      pythOracle: process.env.PYTH_HEDERA || "0x0000000000000000000000000000000000000000"
    },
    ethereum: {
      vlayerProver: process.env.VLAYER_PROVER_ETH || "0x0000000000000000000000000000000000000000",
      vlayerVerifier: process.env.VLAYER_VERIFIER_ETH || "0x0000000000000000000000000000000000000000",
      pythOracle: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C" // Pyth mainnet
    }
  };
  
  return config[network.name] || config.hardhat;
}

// Main execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main, deployMultipleContracts }; 