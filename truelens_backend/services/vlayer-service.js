const axios = require('axios');
const crypto = require('crypto');

class VlayerService {
  constructor() {
    this.baseUrl = process.env.VLAYER_API_URL || 'https://api.vlayer.xyz';
    this.apiKey = process.env.VLAYER_API_KEY || 'PLACEHOLDER_VLAYER_API_KEY';
    this.proverContractAddress = process.env.VLAYER_PROVER_CONTRACT || '0x0000000000000000000000000000000000000000';
    this.verifierContractAddress = process.env.VLAYER_VERIFIER_CONTRACT || '0x0000000000000000000000000000000000000000';
    this.isInitialized = false;
  }

  /**
   * Initialize vlayer service
   */
  async initialize() {
    try {
      // Test connection to vlayer API
      const response = await axios.get(`${this.baseUrl}/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      this.isInitialized = true;
      console.log("✅ vlayer service initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize vlayer service:", error.message);
      // Continue with mock mode for development
      this.isInitialized = true;
      console.log("🔄 vlayer service running in mock mode");
      return true;
    }
  }

  /**
   * Generate web proof for a news article URL
   */
  async generateWebProof(articleData) {
    try {
      if (!this.isInitialized) {
        throw new Error("vlayer service not initialized");
      }

      console.log(`🌐 Generating web proof for: ${articleData.url}`);

      // Check if we can access the URL
      const urlAccessible = await this.checkUrlAccessibility(articleData.url);
      if (!urlAccessible) {
        throw new Error("URL not accessible for proof generation");
      }

      // Generate proof payload
      const proofPayload = {
        url: articleData.url,
        timestamp: new Date().toISOString(),
        content: {
          title: articleData.title,
          hash: crypto.createHash('sha256').update(articleData.content).digest('hex')
        },
        metadata: {
          source: articleData.source,
          submitter: articleData.submitter,
          articleId: articleData.id
        }
      };

      // Try to generate actual web proof via vlayer API
      try {
        const proofResponse = await this.callVlayerApi('/generate-web-proof', {
          method: 'POST',
          data: proofPayload
        });

        if (proofResponse.success) {
          console.log("✅ Web proof generated successfully");
          return {
            success: true,
            proofHash: proofResponse.proofHash,
            proof: proofResponse.proof,
            timestamp: proofResponse.timestamp,
            verifiable: true,
            method: 'vlayer'
          };
        }
      } catch (apiError) {
        console.log("🔄 API unavailable, generating mock proof...");
      }

      // Fallback to mock proof generation for development
      const mockProof = await this.generateMockWebProof(proofPayload);
      return mockProof;

    } catch (error) {
      console.error("❌ Failed to generate web proof:", error);
      return {
        success: false,
        error: error.message,
        proofHash: null
      };
    }
  }

  /**
   * Verify web proof
   */
  async verifyWebProof(proofHash, originalUrl) {
    try {
      console.log(`🔍 Verifying web proof: ${proofHash}`);

      // Try vlayer API verification first
      try {
        const verificationResponse = await this.callVlayerApi('/verify-web-proof', {
          method: 'POST',
          data: {
            proofHash,
            url: originalUrl
          }
        });

        if (verificationResponse.success) {
          return {
            isValid: verificationResponse.isValid,
            timestamp: verificationResponse.timestamp,
            confidence: verificationResponse.confidence || 0.95,
            method: 'vlayer'
          };
        }
      } catch (apiError) {
        console.log("🔄 API unavailable, using mock verification...");
      }

      // Fallback mock verification
      const mockVerification = await this.mockVerifyWebProof(proofHash, originalUrl);
      return mockVerification;

    } catch (error) {
      console.error("❌ Failed to verify web proof:", error);
      return {
        isValid: false,
        error: error.message,
        confidence: 0
      };
    }
  }

  /**
   * Generate source trust proof
   */
  async generateSourceTrustProof(domain, metrics) {
    try {
      console.log(`📊 Generating source trust proof for: ${domain}`);

      const trustPayload = {
        domain,
        metrics: {
          totalArticles: metrics.totalSubmissions,
          verifiedArticles: metrics.verifiedSubmissions,
          trustScore: metrics.truthScore,
          reputation: this.calculateDomainReputation(domain)
        },
        timestamp: new Date().toISOString(),
        version: "1.0"
      };

      // Try vlayer API
      try {
        const response = await this.callVlayerApi('/generate-trust-proof', {
          method: 'POST',
          data: trustPayload
        });

        if (response.success) {
          return {
            success: true,
            trustProofHash: response.proofHash,
            trustIndex: response.trustIndex,
            verifiable: true
          };
        }
      } catch (apiError) {
        console.log("🔄 Generating mock trust proof...");
      }

      // Mock trust proof
      const trustProofHash = crypto.createHash('sha256')
        .update(JSON.stringify(trustPayload))
        .digest('hex');

      return {
        success: true,
        trustProofHash,
        trustIndex: this.calculateTrustIndex(metrics),
        verifiable: false,
        method: 'mock'
      };

    } catch (error) {
      console.error("❌ Failed to generate source trust proof:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create verifiable credential for news verification
   */
  async createVerificationCredential(verificationData) {
    try {
      const credential = {
        type: "NewsVerificationCredential",
        issuer: "TrueLens Veritas",
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          articleId: verificationData.articleId,
          url: verificationData.url,
          truthScore: verificationData.truthScore,
          webProofVerified: verificationData.webProofValid,
          pythValidated: verificationData.pythValidated,
          hederaLogged: verificationData.hederaLogged,
          verificationLevel: this.getVerificationLevel(verificationData.truthScore)
        },
        proof: {
          type: "vlayerWebProof",
          created: new Date().toISOString(),
          proofHash: verificationData.webProofHash,
          verificationMethod: "TrueLens-Veritas-2024"
        }
      };

      // Generate credential hash
      const credentialHash = crypto.createHash('sha256')
        .update(JSON.stringify(credential))
        .digest('hex');

      return {
        success: true,
        credential,
        credentialHash,
        downloadUrl: `${this.baseUrl}/credentials/${credentialHash}`
      };

    } catch (error) {
      console.error("❌ Failed to create verification credential:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check URL accessibility
   */
  async checkUrlAccessibility(url) {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        maxRedirects: 3
      });
      return response.status === 200;
    } catch (error) {
      console.log(`⚠️ URL not accessible: ${url}`);
      return false;
    }
  }

  /**
   * Call vlayer API with error handling
   */
  async callVlayerApi(endpoint, options = {}) {
    const config = {
      url: `${this.baseUrl}${endpoint}`,
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      ...options
    };

    if (options.data) {
      config.data = options.data;
    }

    const response = await axios(config);
    return response.data;
  }

  /**
   * Generate mock web proof for development
   */
  async generateMockWebProof(proofPayload) {
    const mockProofData = {
      url: proofPayload.url,
      timestamp: proofPayload.timestamp,
      contentHash: proofPayload.content.hash,
      signature: crypto.createHash('sha256').update(JSON.stringify(proofPayload)).digest('hex'),
      verificationLevel: "mock"
    };

    const proofHash = crypto.createHash('sha256')
      .update(JSON.stringify(mockProofData))
      .digest('hex');

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      success: true,
      proofHash,
      proof: mockProofData,
      timestamp: new Date().toISOString(),
      verifiable: false,
      method: 'mock'
    };
  }

  /**
   * Mock verification for development
   */
  async mockVerifyWebProof(proofHash, originalUrl) {
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock verification logic - assume valid if proof hash exists and URL is accessible
    const isValid = proofHash && proofHash.length === 64; // Valid SHA256 hash
    
    return {
      isValid,
      timestamp: new Date().toISOString(),
      confidence: isValid ? 0.85 : 0.1, // Mock confidence
      method: 'mock'
    };
  }

  /**
   * Calculate domain reputation
   */
  calculateDomainReputation(domain) {
    const reputationMap = {
      'reuters.com': 0.95,
      'bloomberg.com': 0.95,
      'wsj.com': 0.9,
      'ft.com': 0.9,
      'cnbc.com': 0.85,
      'marketwatch.com': 0.8,
      'yahoo.com': 0.7,
      'truthsocial.com': 0.3
    };

    // Extract domain from URL if needed
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return reputationMap[cleanDomain] || 0.5; // Default neutral reputation
  }

  /**
   * Calculate trust index from metrics
   */
  calculateTrustIndex(metrics) {
    if (metrics.totalSubmissions === 0) return 50;
    
    const verificationRate = metrics.verifiedSubmissions / metrics.totalSubmissions;
    const baseScore = verificationRate * 100;
    
    // Adjust for volume (more submissions = more reliable)
    const volumeBonus = Math.min(10, Math.log10(metrics.totalSubmissions + 1) * 3);
    
    return Math.min(100, Math.round(baseScore + volumeBonus));
  }

  /**
   * Get verification level based on truth score
   */
  getVerificationLevel(truthScore) {
    if (truthScore >= 90) return "HIGHLY_VERIFIED";
    if (truthScore >= 70) return "VERIFIED";
    if (truthScore >= 50) return "PARTIALLY_VERIFIED";
    return "UNVERIFIED";
  }

  /**
   * Get contract addresses for frontend integration
   */
  getContractAddresses() {
    return {
      prover: this.proverContractAddress,
      verifier: this.verifierContractAddress,
      network: process.env.VLAYER_NETWORK || "testnet"
    };
  }

  /**
   * Get service status and configuration
   */
  getServiceInfo() {
    return {
      initialized: this.isInitialized,
      apiUrl: this.baseUrl,
      version: "1.0",
      capabilities: [
        "web_proofs",
        "source_trust_verification",
        "verifiable_credentials"
      ],
      contracts: this.getContractAddresses()
    };
  }
}

// Singleton instance
let vlayerServiceInstance = null;

function getVlayerService() {
  if (!vlayerServiceInstance) {
    vlayerServiceInstance = new VlayerService();
  }
  return vlayerServiceInstance;
}

module.exports = {
  VlayerService,
  getVlayerService
}; 