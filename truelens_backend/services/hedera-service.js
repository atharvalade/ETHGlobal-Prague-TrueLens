const {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicInfoQuery,
  Hbar,
  AccountId,
  PrivateKey,
  TopicId,
  TransactionId
} = require("@hashgraph/sdk");

class HederaService {
  constructor() {
    this.client = null;
    this.operatorId = null;
    this.operatorKey = null;
    this.topics = {
      newsSubmissions: null,
      verificationResults: null,
      truthScores: null,
      webProofs: null,
      aiAnalysis: null
    };
    this.isInitialized = false;
  }

  /**
   * Initialize Hedera client with credentials
   */
  async initialize() {
    try {
      // Get credentials from environment variables
      const accountIdString = process.env.HEDERA_ACCOUNT_ID || "0.0.PLACEHOLDER";
      const privateKeyString = process.env.HEDERA_PRIVATE_KEY || "PLACEHOLDER_PRIVATE_KEY";

      // Check if we have valid credentials
      if (accountIdString.includes('PLACEHOLDER') || privateKeyString.includes('PLACEHOLDER')) {
        console.log("🔄 Hedera service running in mock mode (no credentials provided)");
        this.isInitialized = true;
        return true;
      }

      this.operatorId = AccountId.fromString(accountIdString);
      this.operatorKey = PrivateKey.fromString(privateKeyString);

      // Set up client for testnet (change to mainnet for production)
      this.client = Client.forTestnet();
      this.client.setOperator(this.operatorId, this.operatorKey);

      console.log("✅ Hedera client initialized");
      console.log(`🔑 Operator Account: ${this.operatorId.toString()}`);

      // Initialize or load existing topics
      await this.initializeTopics();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Hedera client:", error);
      // Fall back to mock mode
      console.log("🔄 Hedera service running in mock mode");
      this.isInitialized = true;
      return true;
    }
  }

  /**
   * Create HCS topics for different data streams
   */
  async initializeTopics() {
    try {
      // Check if topics already exist in environment
      const existingTopics = {
        newsSubmissions: process.env.HEDERA_TOPIC_NEWS_SUBMISSIONS,
        verificationResults: process.env.HEDERA_TOPIC_VERIFICATION_RESULTS,
        truthScores: process.env.HEDERA_TOPIC_TRUTH_SCORES,
        webProofs: process.env.HEDERA_TOPIC_WEB_PROOFS,
        aiAnalysis: process.env.HEDERA_TOPIC_AI_ANALYSIS
      };

      // Create missing topics
      for (const [topicName, topicId] of Object.entries(existingTopics)) {
        if (topicId && topicId !== 'PLACEHOLDER') {
          this.topics[topicName] = TopicId.fromString(topicId);
          console.log(`📄 Using existing topic ${topicName}: ${topicId}`);
        } else {
          this.topics[topicName] = await this.createTopic(topicName);
          console.log(`📝 Created new topic ${topicName}: ${this.topics[topicName].toString()}`);
        }
      }

      return this.topics;
    } catch (error) {
      console.error("❌ Failed to initialize topics:", error);
      throw error;
    }
  }

  /**
   * Create a new HCS topic
   */
  async createTopic(topicName) {
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(`TrueLens ${topicName} - News Verification System`)
        .setMaxTransactionFee(new Hbar(5));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return receipt.topicId;
    } catch (error) {
      console.error(`❌ Failed to create topic ${topicName}:`, error);
      throw error;
    }
  }

  /**
   * Submit news article to HCS for timestamping
   */
  async submitNewsArticle(articleData) {
    try {
      if (!this.isInitialized) {
        throw new Error("Hedera service not initialized");
      }

      const messageData = {
        type: "news_submission",
        timestamp: new Date().toISOString(),
        article: {
          id: articleData.id,
          title: articleData.title,
          url: articleData.url,
          source: articleData.source,
          submitter: articleData.submitter,
          contentHash: articleData.contentHash
        },
        metadata: {
          version: "1.0",
          system: "TrueLens Veritas"
        }
      };

      const message = JSON.stringify(messageData);
      
      const submitTx = new TopicMessageSubmitTransaction()
        .setTopicId(this.topics.newsSubmissions)
        .setMessage(message)
        .setMaxTransactionFee(new Hbar(2));

      const response = await submitTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      console.log(`📝 News article logged to Hedera HCS`);
      console.log(`🔗 Transaction ID: ${response.transactionId.toString()}`);
      console.log(`📄 Topic: ${this.topics.newsSubmissions.toString()}`);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        topicId: this.topics.newsSubmissions.toString(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("❌ Failed to submit news article to HCS:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log verification results to HCS
   */
  async logVerificationResult(verificationData) {
    try {
      const messageData = {
        type: "verification_result",
        timestamp: new Date().toISOString(),
        articleId: verificationData.articleId,
        verification: {
          webProofValid: verificationData.webProofValid,
          pythValidated: verificationData.pythValidated,
          truthScore: verificationData.truthScore,
          aiAnalysis: verificationData.aiAnalysis,
          finalVerdict: verificationData.finalVerdict
        },
        metadata: {
          verifier: verificationData.verifier,
          version: "1.0"
        }
      };

      const message = JSON.stringify(messageData);
      
      const submitTx = new TopicMessageSubmitTransaction()
        .setTopicId(this.topics.verificationResults)
        .setMessage(message)
        .setMaxTransactionFee(new Hbar(2));

      const response = await submitTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        topicId: this.topics.verificationResults.toString()
      };
    } catch (error) {
      console.error("❌ Failed to log verification result:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log AI analysis results from Veritas agent
   */
  async logAiAnalysis(analysisData) {
    try {
      const messageData = {
        type: "ai_analysis",
        timestamp: new Date().toISOString(),
        articleId: analysisData.articleId,
        analysis: {
          sentiment: analysisData.sentiment,
          credibilityScore: analysisData.credibilityScore,
          keyFindings: analysisData.keyFindings,
          riskAssessment: analysisData.riskAssessment,
          tradingImplications: analysisData.tradingImplications
        },
        agent: {
          name: "Veritas",
          version: "1.0",
          model: analysisData.model || "gpt-4"
        }
      };

      const message = JSON.stringify(messageData);
      
      const submitTx = new TopicMessageSubmitTransaction()
        .setTopicId(this.topics.aiAnalysis)
        .setMessage(message)
        .setMaxTransactionFee(new Hbar(2));

      const response = await submitTx.execute(this.client);
      
      return {
        success: true,
        transactionId: response.transactionId.toString(),
        topicId: this.topics.aiAnalysis.toString()
      };
    } catch (error) {
      console.error("❌ Failed to log AI analysis:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log truth score updates
   */
  async logTruthScoreUpdate(scoreData) {
    try {
      const messageData = {
        type: "truth_score_update",
        timestamp: new Date().toISOString(),
        articleId: scoreData.articleId,
        score: {
          previous: scoreData.previousScore,
          current: scoreData.currentScore,
          factors: scoreData.factors,
          breakdown: scoreData.breakdown
        }
      };

      const message = JSON.stringify(messageData);
      
      const submitTx = new TopicMessageSubmitTransaction()
        .setTopicId(this.topics.truthScores)
        .setMessage(message)
        .setMaxTransactionFee(new Hbar(2));

      const response = await submitTx.execute(this.client);
      
      return {
        success: true,
        transactionId: response.transactionId.toString(),
        topicId: this.topics.truthScores.toString()
      };
    } catch (error) {
      console.error("❌ Failed to log truth score update:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get topic information
   */
  async getTopicInfo(topicName) {
    try {
      const topicId = this.topics[topicName];
      if (!topicId) {
        throw new Error(`Topic ${topicName} not found`);
      }

      const query = new TopicInfoQuery()
        .setTopicId(topicId);

      const info = await query.execute(this.client);
      
      return {
        topicId: topicId.toString(),
        memo: info.topicMemo,
        runningHash: info.runningHash.toString(),
        sequenceNumber: info.sequenceNumber.toString()
      };
    } catch (error) {
      console.error(`❌ Failed to get topic info for ${topicName}:`, error);
      throw error;
    }
  }

  /**
   * Get all topics for external reference
   */
  getTopics() {
    const topicStrings = {};
    for (const [name, topicId] of Object.entries(this.topics)) {
      topicStrings[name] = topicId ? topicId.toString() : null;
    }
    return topicStrings;
  }

  /**
   * Generate configuration for frontend
   */
  getClientConfig() {
    return {
      network: "testnet", // or "mainnet" for production
      topics: this.getTopics(),
      mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
      explorerUrl: "https://hashscan.io/testnet"
    };
  }

  /**
   * Cleanup resources
   */
  async close() {
    if (this.client) {
      this.client.close();
      console.log("🔒 Hedera client connection closed");
    }
  }
}

// Singleton instance
let hederaServiceInstance = null;

function getHederaService() {
  if (!hederaServiceInstance) {
    hederaServiceInstance = new HederaService();
  }
  return hederaServiceInstance;
}

module.exports = {
  HederaService,
  getHederaService
}; 