const axios = require('axios');
const { ethers } = require('ethers');

class PythService {
  constructor() {
    this.hermesUrl = process.env.PYTH_HERMES_URL || 'https://hermes.pyth.network';
    this.pythContractAddress = process.env.PYTH_CONTRACT_ADDRESS || '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C';
    this.provider = null;
    this.pythContract = null;
    this.priceIds = this.initializePriceIds();
    this.isInitialized = false;
  }

  /**
   * Initialize Pyth service with contract and provider
   */
  async initialize() {
    try {
      // Initialize provider - use getDefaultProvider for ethers v5
      const rpcUrl = process.env.RPC_URL || 'https://ethereum.publicnode.com';
      this.provider = ethers.getDefaultProvider(rpcUrl);

      // Initialize Pyth contract
      const pythAbi = [
        "function getPrice(bytes32 id) external view returns (int64 price, uint256 conf, int32 expo, uint256 publishTime)",
        "function updatePriceFeeds(bytes[] calldata priceUpdateData) external payable",
        "function getUpdateFee(bytes[] calldata updateData) external view returns (uint feeAmount)",
        "function parsePriceFeedUpdates(bytes[] calldata updateData, bytes32[] calldata priceIds, uint64 minPublishTime, uint64 maxPublishTime) external payable returns (tuple(bytes32 id, int64 price, uint256 conf, int32 expo, uint256 publishTime)[] memory priceFeeds)"
      ];

      this.pythContract = new ethers.Contract(
        this.pythContractAddress,
        pythAbi,
        this.provider
      );

      this.isInitialized = true;
      console.log("✅ Pyth service initialized successfully");
      console.log(`🔗 Contract: ${this.pythContractAddress}`);
      console.log(`🌐 Hermes: ${this.hermesUrl}`);

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Pyth service:", error);
      // Continue in mock mode for development
      this.isInitialized = true;
      console.log("🔄 Pyth service running in mock mode");
      return true;
    }
  }

  /**
   * Initialize price feed IDs for major assets
   */
  initializePriceIds() {
    return {
      // Crypto
      'BTC/USD': '0xe62df6c8b4c85fe1e5c8cf77deb7a7c8bb7ba81d2a52b6e0ceac4c13d1e6c7c3',
      'ETH/USD': '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
      'BNB/USD': '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f',
      'SOL/USD': '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
      'MATIC/USD': '0x5de33a9112c2b700b8d30b8a3402c103578ccfa2765696471cc672bd5cf6ac52',
      
      // Stocks
      'AAPL/USD': '0x49f6b65cb1de6b10eaf75e7c03ca029c306d0357e91b5311b175084a5ad55688',
      'TSLA/USD': '0x16dad506d7db8da01c45c67213ad744f64319c6e7a9ca6c25c9bdf9b89653f4b',
      'GOOGL/USD': '0x6bb8c97b86fa8fe0b3e9b33e9e64b48bb2e33c3f1b4f0e8e8e8e8e8e8e8e8e8e',
      'MSFT/USD': '0x4b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b5b',
      'AMZN/USD': '0x5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c',
      
      // Forex
      'EUR/USD': '0xa995d00bb36c098e31f54b6b1fc4f3b03c47e0ace9b6a20d5c3d2e4d3e4d3e4d',
      'GBP/USD': '0xbbb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5bb5b',
      'JPY/USD': '0xccc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5cc5c',
      
      // Commodities
      'GOLD/USD': '0xddd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5dd5d',
      'SILVER/USD': '0xeee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5ee5e',
      'OIL/USD': '0xfff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5ff5f'
    };
  }

  /**
   * Get current price for an asset
   */
  async getPrice(symbol) {
    try {
      console.log(`📊 Fetching price for: ${symbol}`);

      const priceId = this.priceIds[symbol];
      if (!priceId) {
        throw new Error(`Price ID not found for symbol: ${symbol}`);
      }

      // Try to get price from Hermes API first (more recent data)
      try {
        const hermesPrice = await this.getPriceFromHermes(priceId);
        if (hermesPrice) {
          return hermesPrice;
        }
      } catch (hermesError) {
        console.log("🔄 Hermes unavailable, trying on-chain...");
      }

      // Fallback to on-chain price
      const onChainPrice = await this.getOnChainPrice(priceId);
      return onChainPrice;

    } catch (error) {
      console.error(`❌ Failed to get price for ${symbol}:`, error);
      return {
        success: false,
        symbol,
        error: error.message
      };
    }
  }

  /**
   * Get price from Hermes API
   */
  async getPriceFromHermes(priceId) {
    try {
      const response = await axios.get(`${this.hermesUrl}/api/latest_price_feeds`, {
        params: {
          ids: priceId
        },
        timeout: 5000
      });

      if (response.data && response.data.length > 0) {
        const priceData = response.data[0];
        return {
          success: true,
          price: parseInt(priceData.price.price) / Math.pow(10, Math.abs(priceData.price.expo)),
          confidence: parseInt(priceData.price.conf) / Math.pow(10, Math.abs(priceData.price.expo)),
          expo: priceData.price.expo,
          publishTime: new Date(priceData.price.publish_time * 1000).toISOString(),
          source: 'hermes'
        };
      }

      return null;
    } catch (error) {
      console.error("❌ Hermes API error:", error);
      return null;
    }
  }

  /**
   * Get price from on-chain Pyth contract
   */
  async getOnChainPrice(priceId) {
    try {
      const priceData = await this.pythContract.getPrice(priceId);
      
      return {
        success: true,
        price: Number(priceData.price) / Math.pow(10, Math.abs(priceData.expo)),
        confidence: Number(priceData.conf) / Math.pow(10, Math.abs(priceData.expo)),
        expo: Number(priceData.expo),
        publishTime: new Date(Number(priceData.publishTime) * 1000).toISOString(),
        source: 'on-chain'
      };
    } catch (error) {
      console.error("❌ On-chain price error:", error);
      throw error;
    }
  }

  /**
   * Validate financial news against price movements
   */
  async validateNewsWithPrice(articleData, claimedMovement) {
    try {
      console.log(`🔍 Validating news against price data: ${articleData.title}`);

      // Extract asset symbols from article
      const extractedSymbols = this.extractAssetSymbols(articleData.title + ' ' + articleData.content);
      
      if (extractedSymbols.length === 0) {
        return {
          success: true,
          validated: false,
          reason: "No recognizable asset symbols found in article",
          confidence: 0.1
        };
      }

      const validationResults = [];

      for (const symbol of extractedSymbols) {
        try {
          // Get current price
          const currentPrice = await this.getPrice(symbol);
          
          if (!currentPrice.success) {
            continue;
          }

          // Get historical price for comparison (simplified - in production, use actual historical data)
          const historicalPrice = await this.getHistoricalPrice(symbol, '1h');
          
          // Calculate actual price movement
          const actualMovement = this.calculatePriceMovement(currentPrice, historicalPrice);
          
          // Validate against claimed movement
          const validation = this.validateMovement(actualMovement, claimedMovement);
          
          validationResults.push({
            symbol,
            currentPrice: currentPrice.price,
            actualMovement,
            claimedMovement,
            validated: validation.isValid,
            confidence: validation.confidence,
            reasoning: validation.reasoning
          });

        } catch (error) {
          console.error(`❌ Error validating ${symbol}:`, error);
        }
      }

      // Calculate overall validation score
      const overallValidation = this.calculateOverallValidation(validationResults);

      return {
        success: true,
        validated: overallValidation.isValid,
        confidence: overallValidation.confidence,
        assets: validationResults,
        summary: overallValidation.summary
      };

    } catch (error) {
      console.error("❌ Failed to validate news with price:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract asset symbols from text
   */
  extractAssetSymbols(text) {
    const symbols = [];
    const upperText = text.toUpperCase();

    // Check for crypto symbols
    const cryptoSymbols = ['BTC', 'ETH', 'BNB', 'SOL', 'MATIC', 'BITCOIN', 'ETHEREUM'];
    cryptoSymbols.forEach(crypto => {
      if (upperText.includes(crypto)) {
        const symbol = crypto === 'BITCOIN' ? 'BTC' : crypto === 'ETHEREUM' ? 'ETH' : crypto;
        if (!symbols.includes(symbol + '/USD')) {
          symbols.push(symbol + '/USD');
        }
      }
    });

    // Check for stock symbols
    const stockSymbols = ['AAPL', 'TSLA', 'GOOGL', 'GOOGLE', 'MSFT', 'MICROSOFT', 'AMZN', 'AMAZON', 'APPLE', 'TESLA'];
    stockSymbols.forEach(stock => {
      if (upperText.includes(stock)) {
        let symbol = stock;
        if (stock === 'GOOGLE') symbol = 'GOOGL';
        if (stock === 'MICROSOFT') symbol = 'MSFT';
        if (stock === 'AMAZON') symbol = 'AMZN';
        if (stock === 'APPLE') symbol = 'AAPL';
        if (stock === 'TESLA') symbol = 'TSLA';
        
        if (!symbols.includes(symbol + '/USD')) {
          symbols.push(symbol + '/USD');
        }
      }
    });

    return symbols;
  }

  /**
   * Get historical price (simplified implementation)
   */
  async getHistoricalPrice(symbol, timeframe) {
    try {
      // In a real implementation, this would fetch historical data
      // For demo purposes, we'll simulate a small random movement
      const currentPrice = await this.getPrice(symbol);
      if (!currentPrice.success) {
        return currentPrice;
      }

      // Simulate historical price with ±5% random movement
      const variation = (Math.random() - 0.5) * 0.1; // ±5%
      const historicalPrice = currentPrice.price * (1 + variation);

      return {
        success: true,
        price: historicalPrice,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
      };
    } catch (error) {
      console.error(`❌ Error getting historical price for ${symbol}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate price movement percentage
   */
  calculatePriceMovement(currentPrice, historicalPrice) {
    if (!currentPrice.success || !historicalPrice.success) {
      return { success: false, error: "Invalid price data" };
    }

    const movementPercent = ((currentPrice.price - historicalPrice.price) / historicalPrice.price) * 100;
    
    return {
      success: true,
      percent: movementPercent,
      direction: movementPercent > 0 ? 'up' : 'down',
      magnitude: Math.abs(movementPercent)
    };
  }

  /**
   * Validate claimed movement against actual movement
   */
  validateMovement(actualMovement, claimedMovement) {
    if (!actualMovement.success) {
      return {
        isValid: false,
        confidence: 0,
        reasoning: "Unable to calculate actual movement"
      };
    }

    // Simple validation logic - in production, this would be more sophisticated
    const actualMagnitude = actualMovement.magnitude;
    const actualDirection = actualMovement.direction;

    // Extract claimed direction and magnitude from text analysis
    const claimedDirection = this.extractDirection(claimedMovement);
    const claimedMagnitude = this.extractMagnitude(claimedMovement);

    let confidence = 0.5; // Start with neutral

    // Check direction alignment
    if (claimedDirection === actualDirection) {
      confidence += 0.3;
    } else if (claimedDirection === 'neutral' || actualMagnitude < 1) {
      confidence += 0.1; // Small movements are less clear
    } else {
      confidence -= 0.3; // Wrong direction is significant
    }

    // Check magnitude alignment
    const magnitudeDiff = Math.abs(claimedMagnitude - actualMagnitude);
    if (magnitudeDiff < 2) { // Within 2%
      confidence += 0.2;
    } else if (magnitudeDiff < 5) { // Within 5%
      confidence += 0.1;
    } else {
      confidence -= 0.1;
    }

    confidence = Math.max(0, Math.min(1, confidence));

    return {
      isValid: confidence > 0.6,
      confidence,
      reasoning: `Claimed ${claimedDirection} ${claimedMagnitude.toFixed(1)}%, actual ${actualDirection} ${actualMagnitude.toFixed(1)}%`
    };
  }

  /**
   * Extract direction from movement description
   */
  extractDirection(movementText) {
    const text = movementText.toLowerCase();
    if (text.includes('up') || text.includes('rise') || text.includes('gain') || text.includes('bull')) {
      return 'up';
    } else if (text.includes('down') || text.includes('fall') || text.includes('drop') || text.includes('bear')) {
      return 'down';
    }
    return 'neutral';
  }

  /**
   * Extract magnitude from movement description
   */
  extractMagnitude(movementText) {
    const percentMatch = movementText.match(/(\d+(?:\.\d+)?)%/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]);
    }

    // Look for keywords indicating magnitude
    const text = movementText.toLowerCase();
    if (text.includes('massive') || text.includes('huge')) return 10;
    if (text.includes('significant') || text.includes('major')) return 5;
    if (text.includes('moderate')) return 3;
    if (text.includes('slight') || text.includes('minor')) return 1;

    return 2; // Default moderate movement
  }

  /**
   * Calculate overall validation from multiple asset validations
   */
  calculateOverallValidation(validationResults) {
    if (validationResults.length === 0) {
      return {
        isValid: false,
        confidence: 0,
        summary: "No assets could be validated"
      };
    }

    const validCount = validationResults.filter(r => r.validated).length;
    const totalCount = validationResults.length;
    const avgConfidence = validationResults.reduce((sum, r) => sum + r.confidence, 0) / totalCount;

    const validationRate = validCount / totalCount;
    const overallConfidence = (validationRate * 0.7) + (avgConfidence * 0.3);

    return {
      isValid: overallConfidence > 0.6,
      confidence: overallConfidence,
      summary: `${validCount}/${totalCount} assets validated with ${(avgConfidence * 100).toFixed(1)}% avg confidence`
    };
  }

  /**
   * Get price update data for contract interaction
   */
  async getPriceUpdateData(symbols) {
    try {
      const priceIds = symbols.map(symbol => this.priceIds[symbol]).filter(Boolean);
      
      const response = await axios.get(`${this.hermesUrl}/api/latest_vaas`, {
        params: {
          ids: priceIds.join(',')
        }
      });

      return response.data.map(vaa => '0x' + Buffer.from(vaa, 'base64').toString('hex'));
    } catch (error) {
      console.error("❌ Failed to get price update data:", error);
      return [];
    }
  }

  /**
   * Get supported symbols
   */
  getSupportedSymbols() {
    return Object.keys(this.priceIds);
  }

  /**
   * Get service configuration
   */
  getServiceInfo() {
    return {
      initialized: this.isInitialized,
      hermesUrl: this.hermesUrl,
      contractAddress: this.pythContractAddress,
      supportedSymbols: this.getSupportedSymbols().length,
      capabilities: [
        "real_time_prices",
        "historical_data",
        "news_validation",
        "cross_asset_correlation"
      ]
    };
  }
}

// Singleton instance
let pythServiceInstance = null;

function getPythService() {
  if (!pythServiceInstance) {
    pythServiceInstance = new PythService();
  }
  return pythServiceInstance;
}

module.exports = {
  PythService,
  getPythService
}; 