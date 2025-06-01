const express = require('express');
const cors = require('cors');
const { getHederaService } = require('./services/hedera-service');
const { getVeritasAgent } = require('./services/veritas-agent');
const { getVlayerService } = require('./services/vlayer-service');
const { getPythService } = require('./services/pyth-service');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Service instances
let hederaService;
let veritasAgent;
let vlayerService;
let pythService;

// Initialize all services
async function initializeServices() {
  console.log("🚀 Initializing TrueLens Veritas services...");
  
  try {
    // Initialize services in parallel
    const [hederaInit, vlayerInit, pythInit] = await Promise.all([
      getHederaService().initialize(),
      getVlayerService().initialize(),
      getPythService().initialize()
    ]);

    // Initialize Veritas agent (depends on Hedera)
    const veritasInit = await getVeritasAgent().initialize();

    // Store service references
    hederaService = getHederaService();
    veritasAgent = getVeritasAgent();
    vlayerService = getVlayerService();
    pythService = getPythService();

    console.log("✅ All services initialized successfully");
    return {
      hedera: hederaInit,
      vlayer: vlayerInit,
      pyth: pythInit,
      veritas: veritasInit
    };
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      hedera: hederaService?.isInitialized || false,
      vlayer: vlayerService?.isInitialized || false,
      pyth: pythService?.isInitialized || false,
      veritas: veritasAgent?.isInitialized || false
    }
  });
});

// Service configuration endpoint
app.get('/api/config', (req, res) => {
  try {
    res.json({
      hedera: hederaService?.getClientConfig() || {},
      vlayer: vlayerService?.getServiceInfo() || {},
      pyth: pythService?.getServiceInfo() || {},
      veritas: veritasAgent?.getAgentInfo() || {}
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit news article for comprehensive verification
app.post('/api/submit-article', async (req, res) => {
  try {
    const { title, url, content, source, submitter } = req.body;

    if (!title || !url || !content || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`📝 Processing new article submission: ${title}`);

    const articleData = {
      id: Date.now().toString(),
      title,
      url,
      content,
      source,
      submitter: submitter || 'anonymous',
      timestamp: new Date().toISOString()
    };

    // Step 1: AI Analysis with Veritas agent
    console.log("🤖 Step 1: AI Analysis");
    const aiAnalysis = await veritasAgent.analyzeArticle(articleData);

    // Step 2: Generate web proof with vlayer
    console.log("🌐 Step 2: Web Proof Generation");
    const webProof = await vlayerService.generateWebProof(articleData);

    // Step 3: Validate with Pyth price feeds (if financial news)
    console.log("📊 Step 3: Price Validation");
    const pythValidation = await pythService.validateNewsWithPrice(
      articleData,
      aiAnalysis.analysis?.sentiment || 'neutral'
    );

    // Step 4: Log to Hedera HCS
    console.log("🏗️ Step 4: Hedera Logging");
    const hederaResult = await hederaService.submitNewsArticle({
      ...articleData,
      contentHash: webProof.proof?.contentHash || 'unknown'
    });

    // Step 5: Calculate composite truth score
    const truthScore = calculateTruthScore({
      aiAnalysis,
      webProof,
      pythValidation,
      hederaResult
    });

    // Step 6: Create verifiable credential
    const credential = await vlayerService.createVerificationCredential({
      articleId: articleData.id,
      url: articleData.url,
      truthScore,
      webProofValid: webProof.success,
      pythValidated: pythValidation.validated,
      hederaLogged: hederaResult.success,
      webProofHash: webProof.proofHash
    });

    const response = {
      success: true,
      articleId: articleData.id,
      verification: {
        aiAnalysis: aiAnalysis.credibilityScore || 0,
        webProofValid: webProof.success,
        pythValidated: pythValidation.validated,
        hederaLogged: hederaResult.success,
        truthScore
      },
      results: {
        ai: aiAnalysis,
        webProof,
        priceValidation: pythValidation,
        hedera: hederaResult,
        credential
      },
      summary: generateVerificationSummary({
        aiAnalysis,
        webProof,
        pythValidation,
        hederaResult,
        truthScore
      })
    };

    res.json(response);
  } catch (error) {
    console.error("❌ Error processing article:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get article verification status
app.get('/api/article/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // This would typically fetch from a database
    // For demo purposes, return mock data
    res.json({
      articleId: id,
      status: 'verified',
      truthScore: 85,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price data from Pyth
app.get('/api/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const priceData = await pythService.getPrice(symbol.toUpperCase() + '/USD');
    res.json(priceData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify web proof
app.post('/api/verify-proof', async (req, res) => {
  try {
    const { proofHash, url } = req.body;
    const verification = await vlayerService.verifyWebProof(proofHash, url);
    res.json(verification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Hedera topic information
app.get('/api/hedera/topics', async (req, res) => {
  try {
    const topics = hederaService.getTopics();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Batch analyze articles
app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!Array.isArray(articles)) {
      return res.status(400).json({ error: 'Articles must be an array' });
    }

    const results = await veritasAgent.batchAnalyze(articles);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utility function to calculate truth score
function calculateTruthScore({ aiAnalysis, webProof, pythValidation, hederaResult }) {
  let score = 0;
  let maxScore = 100;

  // AI credibility score (40 points max)
  if (aiAnalysis.success !== false) {
    score += (aiAnalysis.credibilityScore || 0) * 0.4;
  }

  // Web proof verification (30 points max)
  if (webProof.success) {
    score += 30;
  }

  // Pyth validation (20 points max) 
  if (pythValidation.success && pythValidation.validated) {
    score += pythValidation.confidence * 20;
  }

  // Hedera logging (10 points max)
  if (hederaResult.success) {
    score += 10;
  }

  return Math.round(Math.min(score, maxScore));
}

// Utility function to generate verification summary
function generateVerificationSummary({ aiAnalysis, webProof, pythValidation, hederaResult, truthScore }) {
  const checks = [];
  
  if (aiAnalysis.success !== false) {
    checks.push(`✅ AI Analysis: ${aiAnalysis.credibilityScore || 0}% credible`);
  } else {
    checks.push(`❌ AI Analysis failed`);
  }

  if (webProof.success) {
    checks.push(`✅ Web Proof: Source verified`);
  } else {
    checks.push(`❌ Web Proof: Could not verify source`);
  }

  if (pythValidation.success && pythValidation.validated) {
    checks.push(`✅ Price Validation: Claims supported by market data`);
  } else if (pythValidation.success) {
    checks.push(`⚠️ Price Validation: No financial claims found`);
  } else {
    checks.push(`❌ Price Validation failed`);
  }

  if (hederaResult.success) {
    checks.push(`✅ Blockchain: Logged to Hedera (${hederaResult.topicId})`);
  } else {
    checks.push(`❌ Blockchain logging failed`);
  }

  return {
    truthScore,
    level: truthScore >= 80 ? 'HIGH_CONFIDENCE' : truthScore >= 60 ? 'MEDIUM_CONFIDENCE' : 'LOW_CONFIDENCE',
    checks,
    summary: `Article received ${truthScore}/100 truth score based on multi-chain verification`
  };
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🌟 TrueLens Veritas server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`⚙️ Configuration: http://localhost:${PORT}/api/config`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down TrueLens Veritas server...');
  
  try {
    if (veritasAgent) {
      await veritasAgent.shutdown();
    }
    if (hederaService) {
      await hederaService.close();
    }
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

if (require.main === module) {
  startServer();
}

module.exports = app; 