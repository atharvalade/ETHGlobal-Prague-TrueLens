const { getHederaService } = require('../services/hedera-service');
const { getVeritasAgent } = require('../services/veritas-agent');
const { getVlayerService } = require('../services/vlayer-service');
const { getPythService } = require('../services/pyth-service');

async function initializeAllServices() {
  console.log("🚀 TrueLens Veritas - Initializing All Blockchain Services");
  console.log("=" + "=".repeat(60));

  const results = {
    hedera: false,
    vlayer: false,
    pyth: false,
    veritas: false
  };

  try {
    // Initialize Hedera Service
    console.log("\n📘 Initializing Hedera Consensus Service...");
    const hederaService = getHederaService();
    results.hedera = await hederaService.initialize();
    
    if (results.hedera) {
      console.log("✅ Hedera service initialized successfully");
      
      // Create topics for different data types
      try {
        await hederaService.createTopic("TrueLens News Submissions", "Topic for logging all news article submissions");
        await hederaService.createTopic("TrueLens Verification Results", "Topic for logging verification results");
        await hederaService.createTopic("TrueLens AI Analysis", "Topic for logging AI analysis results");
        console.log("✅ Hedera topics created successfully");
      } catch (error) {
        console.log("⚠️ Topics may already exist or creation failed:", error.message);
      }
    } else {
      console.log("❌ Hedera service initialization failed");
    }

    // Initialize vlayer Service
    console.log("\n🌐 Initializing vlayer Web Proof Service...");
    const vlayerService = getVlayerService();
    results.vlayer = await vlayerService.initialize();
    
    if (results.vlayer) {
      console.log("✅ vlayer service initialized successfully");
      console.log("📊 vlayer configuration:", vlayerService.getServiceInfo());
    } else {
      console.log("❌ vlayer service initialization failed");
    }

    // Initialize Pyth Service
    console.log("\n💹 Initializing Pyth Price Oracle Service...");
    const pythService = getPythService();
    results.pyth = await pythService.initialize();
    
    if (results.pyth) {
      console.log("✅ Pyth service initialized successfully");
      console.log("📈 Supported price feeds:", pythService.getSupportedSymbols().length);
      
      // Test a few price feeds
      try {
        const btcPrice = await pythService.getPrice('BTC/USD');
        const ethPrice = await pythService.getPrice('ETH/USD');
        console.log("📊 Sample prices:");
        if (btcPrice.success) console.log(`   BTC/USD: $${btcPrice.price.toLocaleString()}`);
        if (ethPrice.success) console.log(`   ETH/USD: $${ethPrice.price.toLocaleString()}`);
      } catch (error) {
        console.log("⚠️ Price feed test failed:", error.message);
      }
    } else {
      console.log("❌ Pyth service initialization failed");
    }

    // Initialize Veritas AI Agent (depends on other services)
    console.log("\n🤖 Initializing Veritas AI Agent...");
    const veritasAgent = getVeritasAgent();
    results.veritas = await veritasAgent.initialize();
    
    if (results.veritas) {
      console.log("✅ Veritas AI agent initialized successfully");
      console.log("🧠 Agent capabilities:", veritasAgent.getAgentInfo().capabilities);
      
      // Test AI analysis
      try {
        const testAnalysis = await veritasAgent.analyzeArticle({
          id: 'test-001',
          title: 'Bitcoin reaches new all-time high of $100,000',
          content: 'Bitcoin has surged to a new record high of $100,000 amid institutional adoption.',
          url: 'https://example.com/bitcoin-ath',
          source: 'example.com',
          submitter: 'test',
          timestamp: new Date().toISOString()
        });
        
        if (testAnalysis.success !== false) {
          console.log("🧪 AI analysis test successful");
          console.log(`   Credibility Score: ${testAnalysis.credibilityScore || 'N/A'}%`);
        }
      } catch (error) {
        console.log("⚠️ AI analysis test failed:", error.message);
      }
    } else {
      console.log("❌ Veritas AI agent initialization failed");
    }

    // Final Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 INITIALIZATION SUMMARY");
    console.log("=".repeat(60));
    
    const successCount = Object.values(results).filter(Boolean).length;
    const totalServices = Object.keys(results).length;
    
    console.log(`✅ Successfully initialized: ${successCount}/${totalServices} services`);
    console.log("");
    
    Object.entries(results).forEach(([service, success]) => {
      const status = success ? "✅ Ready" : "❌ Failed";
      const serviceName = {
        hedera: "Hedera Consensus Service",
        vlayer: "vlayer Web Proofs",
        pyth: "Pyth Price Oracles", 
        veritas: "Veritas AI Agent"
      }[service];
      
      console.log(`   ${serviceName}: ${status}`);
    });

    if (successCount === totalServices) {
      console.log("\n🎉 All services are ready! You can now start the TrueLens Veritas server.");
      console.log("   Run: npm start");
    } else {
      console.log("\n⚠️  Some services failed to initialize. Check the configuration and try again.");
      console.log("   Make sure all environment variables are set correctly.");
    }

    console.log("\n🌐 Access the verification dashboard at: http://localhost:3000/veritas");
    console.log("📊 Check service health at: http://localhost:3001/health");

  } catch (error) {
    console.error("\n❌ Critical error during initialization:", error);
    process.exit(1);
  }
}

// Run initialization if this script is called directly
if (require.main === module) {
  initializeAllServices()
    .then(() => {
      console.log("\n✅ Initialization completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Initialization failed:", error);
      process.exit(1);
    });
}

module.exports = { initializeAllServices }; 