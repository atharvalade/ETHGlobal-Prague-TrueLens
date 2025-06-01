const OpenAI = require('openai');
const { getHederaService } = require('./hedera-service');
const crypto = require('crypto');
const { TopicMessageSubmitTransaction, Hbar } = require('@hashgraph/sdk');

class VeritasAgent {
  constructor() {
    this.openai = null;
    this.hederaService = null;
    this.isInitialized = false;
    this.agentName = "Veritas";
    this.version = "1.0";
    this.capabilities = [
      "news_analysis",
      "credibility_assessment", 
      "sentiment_analysis",
      "trading_implications",
      "fact_verification"
    ];
  }

  /**
   * Initialize the Veritas agent with required services
   */
  async initialize() {
    try {
      // Initialize OpenAI
      const apiKey = process.env.OPENAI_API_KEY || 'PLACEHOLDER_OPENAI_KEY';
      
      if (apiKey.includes('PLACEHOLDER') || apiKey === 'your_openai_api_key_here') {
        console.log("⚠️ OpenAI API key not configured. AI analysis will use fallback mode.");
        console.log("   Get your API key from: https://platform.openai.com/api-keys");
        console.log("   Add it to .env file: OPENAI_API_KEY=your_actual_key");
      }
      
      this.openai = new OpenAI({
        apiKey: apiKey
      });

      // Initialize Hedera service
      this.hederaService = getHederaService();
      await this.hederaService.initialize();

      this.isInitialized = true;
      console.log("🤖 Veritas Agent initialized successfully");
      
      // Only log agent initialization if Hedera is properly configured
      if (this.hederaService.client) {
        await this.logAgentActivity({
          type: "agent_initialization",
          timestamp: new Date().toISOString(),
          agent: this.getAgentInfo(),
          status: "active"
        });
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Veritas Agent:", error);
      return false;
    }
  }

  /**
   * Analyze news article for credibility and trading implications
   */
  async analyzeArticle(articleData) {
    try {
      if (!this.isInitialized) {
        throw new Error("Veritas agent not initialized");
      }

      console.log(`🤖 Veritas analyzing article: ${articleData.title}`);

      // Generate content hash for integrity
      const contentHash = crypto.createHash('sha256')
        .update(articleData.content)
        .digest('hex');

      // Perform AI analysis
      const aiAnalysis = await this.performAiAnalysis(articleData);

      // Calculate credibility score
      const credibilityScore = this.calculateCredibilityScore(aiAnalysis, articleData);

      // Assess trading implications
      const tradingImplications = await this.assessTradingImplications(articleData, aiAnalysis);

      const analysisResult = {
        articleId: articleData.id,
        contentHash,
        analysis: aiAnalysis,
        credibilityScore,
        tradingImplications,
        agent: this.getAgentInfo(),
        timestamp: new Date().toISOString()
      };

      // Log analysis to Hedera HCS
      await this.hederaService.logAiAnalysis({
        articleId: articleData.id,
        sentiment: aiAnalysis.sentiment,
        credibilityScore,
        keyFindings: aiAnalysis.keyFindings,
        riskAssessment: aiAnalysis.riskAssessment,
        tradingImplications: tradingImplications.summary,
        model: "gpt-4"
      });

      console.log(`✅ Analysis completed for article ${articleData.id}`);
      return analysisResult;

    } catch (error) {
      console.error("❌ Failed to analyze article:", error);
      return {
        success: false,
        error: error.message,
        articleId: articleData.id
      };
    }
  }

  /**
   * Perform detailed AI analysis using OpenAI
   */
  async performAiAnalysis(articleData) {
    const prompt = `
You are Veritas, an AI agent specialized in financial news verification and analysis. 

Analyze the following news article and provide a comprehensive assessment:

Title: ${articleData.title}
Source: ${articleData.source}
Content: ${articleData.content}
URL: ${articleData.url}

Please provide analysis in the following JSON format:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0-1.0,
  "keyFindings": ["finding1", "finding2", "finding3"],
  "credibilityIndicators": {
    "sourceReliability": 0.0-1.0,
    "factualAccuracy": 0.0-1.0,
    "evidenceQuality": 0.0-1.0,
    "biasDetection": 0.0-1.0
  },
  "riskAssessment": {
    "misinformationRisk": "low|medium|high",
    "manipulationRisk": "low|medium|high", 
    "verificationNeeded": true|false
  },
  "financialImpact": {
    "marketRelevance": 0.0-1.0,
    "volatilityPotential": 0.0-1.0,
    "tradingRelevance": 0.0-1.0
  },
  "reasoning": "Detailed explanation of the analysis"
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are Veritas, a specialized AI agent for financial news verification. Provide accurate, unbiased analysis in the requested JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      });

      const analysisText = response.choices[0].message.content;
      
      // Try to parse as JSON, fallback to structured text
      try {
        return JSON.parse(analysisText);
      } catch (parseError) {
        // Fallback parsing if JSON is malformed
        return this.parseAnalysisText(analysisText);
      }
    } catch (error) {
      console.error("❌ OpenAI API error:", error);
      // Return fallback analysis
      return this.generateFallbackAnalysis(articleData);
    }
  }

  /**
   * Calculate overall credibility score
   */
  calculateCredibilityScore(aiAnalysis, articleData) {
    try {
      const indicators = aiAnalysis.credibilityIndicators || {};
      const weights = {
        sourceReliability: 0.3,
        factualAccuracy: 0.3,
        evidenceQuality: 0.25,
        biasDetection: 0.15
      };

      let score = 0;
      for (const [indicator, weight] of Object.entries(weights)) {
        score += (indicators[indicator] || 0.5) * weight;
      }

      // Adjust based on source reputation
      const sourceBonus = this.getSourceReputationBonus(articleData.source);
      score = Math.min(1.0, score + sourceBonus);

      return Math.round(score * 100); // Return as percentage
    } catch (error) {
      console.error("❌ Error calculating credibility score:", error);
      return 50; // Default neutral score
    }
  }

  /**
   * Assess trading implications
   */
  async assessTradingImplications(articleData, aiAnalysis) {
    try {
      const tradingPrompt = `
Based on this financial news analysis, provide specific trading implications:

Article: ${articleData.title}
Sentiment: ${aiAnalysis.sentiment}
Market Relevance: ${aiAnalysis.financialImpact?.marketRelevance || 0.5}

Provide trading implications in JSON format:
{
  "summary": "Brief summary of trading implications",
  "recommendations": [
    {
      "action": "buy|sell|hold|watch",
      "asset": "specific asset/ticker",
      "confidence": 0.0-1.0,
      "timeframe": "short|medium|long",
      "reasoning": "explanation"
    }
  ],
  "riskLevel": "low|medium|high",
  "marketImpact": "minimal|moderate|significant"
}
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system", 
            content: "You are a financial analysis expert. Provide specific, actionable trading insights."
          },
          {
            role: "user",
            content: tradingPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error("❌ Error assessing trading implications:", error);
      return {
        summary: "Unable to assess trading implications",
        recommendations: [],
        riskLevel: "medium",
        marketImpact: "uncertain"
      };
    }
  }

  /**
   * Get source reputation bonus/penalty
   */
  getSourceReputationBonus(source) {
    const reputationMap = {
      'Reuters': 0.1,
      'Bloomberg': 0.1,
      'Wall Street Journal': 0.08,
      'Financial Times': 0.08,
      'CNBC': 0.05,
      'Yahoo Finance': 0.03,
      'MarketWatch': 0.03,
      'TruthSocial': -0.05,
      'Unknown': -0.1
    };

    return reputationMap[source] || 0;
  }

  /**
   * Parse analysis text when JSON parsing fails
   */
  parseAnalysisText(text) {
    // Fallback parsing logic
    return {
      sentiment: this.extractValue(text, 'sentiment', 'neutral'),
      confidence: parseFloat(this.extractValue(text, 'confidence', '0.5')),
      keyFindings: ["Analysis completed"],
      credibilityIndicators: {
        sourceReliability: 0.5,
        factualAccuracy: 0.5,
        evidenceQuality: 0.5,
        biasDetection: 0.5
      },
      riskAssessment: {
        misinformationRisk: "medium",
        manipulationRisk: "medium",
        verificationNeeded: true
      },
      reasoning: "Automated analysis with limited parsing"
    };
  }

  /**
   * Generate fallback analysis when AI fails
   */
  generateFallbackAnalysis(articleData) {
    return {
      sentiment: "neutral",
      confidence: 0.3,
      keyFindings: ["Automated fallback analysis"],
      credibilityIndicators: {
        sourceReliability: 0.5,
        factualAccuracy: 0.3,
        evidenceQuality: 0.3,
        biasDetection: 0.5
      },
      riskAssessment: {
        misinformationRisk: "medium",
        manipulationRisk: "medium",
        verificationNeeded: true
      },
      reasoning: "Fallback analysis due to AI service unavailability"
    };
  }

  /**
   * Extract value from text using simple regex
   */
  extractValue(text, key, defaultValue) {
    const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`, 'i');
    const match = text.match(regex);
    return match ? match[1] : defaultValue;
  }

  /**
   * Log agent activity to Hedera
   */
  async logAgentActivity(activityData) {
    try {
      await this.hederaService.logAiAnalysis({
        articleId: 'system',
        sentiment: 'neutral',
        credibilityScore: 100,
        keyFindings: [activityData.type],
        riskAssessment: activityData.status,
        tradingImplications: JSON.stringify(activityData),
        model: 'veritas-agent'
      });
    } catch (error) {
      console.error("❌ Failed to log agent activity:", error);
    }
  }

  /**
   * Get agent information
   */
  getAgentInfo() {
    return {
      name: this.agentName,
      version: this.version,
      capabilities: this.capabilities,
      status: this.isInitialized ? "active" : "inactive"
    };
  }

  /**
   * Process multiple articles in batch
   */
  async batchAnalyze(articles) {
    const results = [];
    
    for (const article of articles) {
      try {
        const result = await this.analyzeArticle(article);
        results.push(result);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ Failed to analyze article ${article.id}:`, error);
        results.push({
          articleId: article.id,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Shutdown agent and cleanup
   */
  async shutdown() {
    try {
      await this.logAgentActivity({
        type: "agent_shutdown",
        timestamp: new Date().toISOString(),
        agent: this.getAgentInfo(),
        status: "inactive"
      });

      if (this.hederaService) {
        await this.hederaService.close();
      }

      this.isInitialized = false;
      console.log("🔒 Veritas Agent shutdown completed");
    } catch (error) {
      console.error("❌ Error during agent shutdown:", error);
    }
  }

  /**
   * Log AI analysis results from Veritas agent
   */
  async logAiAnalysis(analysisData) {
    try {
      // Only log if Hedera client is available
      if (!this.hederaService.client) {
        console.log("🔄 Skipping Hedera logging (mock mode)");
        return { success: true, message: "Mock mode - no actual logging" };
      }

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
        .setTopicId(this.hederaService.topics.aiAnalysis)
        .setMessage(message)
        .setMaxTransactionFee(new Hbar(2));

      const response = await submitTx.execute(this.hederaService.client);
      
      return {
        success: true,
        transactionId: response.transactionId.toString(),
        topicId: this.hederaService.topics.aiAnalysis.toString()
      };
    } catch (error) {
      console.error("❌ Failed to log AI analysis:", error);
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
let veritasAgentInstance = null;

function getVeritasAgent() {
  if (!veritasAgentInstance) {
    veritasAgentInstance = new VeritasAgent();
  }
  return veritasAgentInstance;
}

module.exports = {
  VeritasAgent,
  getVeritasAgent
}; 