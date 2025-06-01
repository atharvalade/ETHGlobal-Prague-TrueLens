// Script to derive an Ethereum address from a private key

const { ethers } = require("hardhat");

async function main() {
  // Read private key from stdin
  const privateKey = process.argv[2] || process.env.VALIDATOR_KEY;
  
  if (!privateKey) {
    console.error("No private key provided");
    process.exit(1);
  }
  
  try {
    // Create a wallet from the private key
    const wallet = new ethers.Wallet(privateKey);
    
    // Print the address
    console.log(wallet.address);
  } catch (error) {
    console.error("Invalid private key:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });