#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log("🚀 TrueLens Veritas Environment Setup");
console.log("=" + "=".repeat(50));

const envTemplate = `# TrueLens Veritas Environment Configuration
# Copy this template to .env and fill in your actual values

# =============================================================================
# REQUIRED: OpenAI API Key for Veritas AI Agent
# =============================================================================
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# =============================================================================
# OPTIONAL: Hedera Consensus Service (for production deployment)
# =============================================================================
# For testnet development, you can leave these as placeholders
# Get testnet account from: https://portal.hedera.com/
HEDERA_ACCOUNT_ID=0.0.PLACEHOLDER
HEDERA_PRIVATE_KEY=PLACEHOLDER_PRIVATE_KEY
HEDERA_TOPIC_NEWS_SUBMISSIONS=PLACEHOLDER
HEDERA_TOPIC_VERIFICATION_RESULTS=PLACEHOLDER  
HEDERA_TOPIC_TRUTH_SCORES=PLACEHOLDER
HEDERA_TOPIC_WEB_PROOFS=PLACEHOLDER
HEDERA_TOPIC_AI_ANALYSIS=PLACEHOLDER

# =============================================================================
# OPTIONAL: vlayer Web Proofs (for production deployment)
# =============================================================================
# For development, mock proofs will be used
VLAYER_API_URL=https://api.vlayer.xyz
VLAYER_API_KEY=PLACEHOLDER_VLAYER_API_KEY
VLAYER_PROVER_CONTRACT=0x0000000000000000000000000000000000000000
VLAYER_VERIFIER_CONTRACT=0x0000000000000000000000000000000000000000

# =============================================================================
# OPTIONAL: Pyth Price Feeds (default values work for demo)
# =============================================================================
PYTH_HERMES_URL=https://hermes.pyth.network
PYTH_CONTRACT_ADDRESS=0xff1a0f4744e8582DF1aE09D5611b887B6a12925C
RPC_URL=https://ethereum.publicnode.com

# =============================================================================
# Server Configuration
# =============================================================================
PORT=3001
NODE_ENV=development

# =============================================================================
# Blockchain Deployment (for contract deployment)
# =============================================================================
PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# =============================================================================
# API Keys for Block Explorers (optional)
# =============================================================================
ETHERSCAN_API_KEY=
POLYGONSCAN_API_KEY=
BASESCAN_API_KEY=
`;

function createEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log("⚠️  .env file already exists");
    console.log("   Current file will be backed up as .env.backup");
    fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
  }
  
  fs.writeFileSync(envPath, envTemplate);
  console.log("✅ Created .env file with template");
  console.log("📝 Edit the .env file and add your API keys");
}

function checkDependencies() {
  console.log("\n📦 Checking dependencies...");
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log("❌ package.json not found");
    return false;
  }
  
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log("❌ Dependencies not installed");
    console.log("   Run: npm install");
    return false;
  }
  
  console.log("✅ Dependencies are installed");
  return true;
}

function showNextSteps() {
  console.log("\n" + "=".repeat(60));
  console.log("📋 NEXT STEPS TO GET TRUELENS VERITAS RUNNING");
  console.log("=".repeat(60));
  
  console.log("\n1️⃣ Install dependencies (if not already done):");
  console.log("   cd truelens_backend");
  console.log("   npm install");
  
  console.log("\n2️⃣ Get an OpenAI API key:");
  console.log("   • Go to: https://platform.openai.com/api-keys");
  console.log("   • Create a new API key");
  console.log("   • Add it to the .env file: OPENAI_API_KEY=your_key_here");
  
  console.log("\n3️⃣ Initialize services:");
  console.log("   npm run init-services");
  
  console.log("\n4️⃣ Start the backend server:");
  console.log("   npm start");
  
  console.log("\n5️⃣ Start the frontend (in another terminal):");
  console.log("   cd ../truelens_UI");
  console.log("   npm install  # if not already done");
  console.log("   npm run dev");
  
  console.log("\n6️⃣ Access the application:");
  console.log("   🌐 Frontend: http://localhost:3000/veritas");
  console.log("   📊 Backend Health: http://localhost:3001/health");
  
  console.log("\n" + "=".repeat(60));
  console.log("💡 TIPS:");
  console.log("   • Only OpenAI API key is required for basic functionality");
  console.log("   • Other services will run in mock mode for development");
  console.log("   • Check service status at the /veritas page");
  console.log("   • Green indicators = service working");
  console.log("   • Red indicators = service needs configuration");
}

// Main execution
console.log("\n🔧 Setting up environment...");
createEnvFile();

console.log("\n🔍 Checking system requirements...");
checkDependencies();

showNextSteps();

console.log("\n✨ Setup completed! Follow the steps above to get started."); 