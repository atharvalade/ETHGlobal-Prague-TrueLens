// Multi-chain blockchain utilities for TrueLens Veritas

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Service status interface
interface ServiceStatus {
  hedera: boolean;
  vlayer: boolean; 
  pyth: boolean;
  veritas: boolean;
}

// Article submission interface
interface ArticleSubmission {
  title: string;
  url: string;
  content: string;
  source: string;
  submitter?: string;
}

// Verification result interface
interface VerificationResult {
  success: boolean;
  articleId: string;
  verification: {
    aiAnalysis: number;
    webProofValid: boolean;
    pythValidated: boolean;
    hederaLogged: boolean;
    truthScore: number;
  };
  results: {
    ai: any;
    webProof: any;
    priceValidation: any;
    hedera: any;
    credential: any;
  };
  summary: {
    truthScore: number;
    level: string;
    checks: string[];
    summary: string;
  };
}

// Price data interface
interface PriceData {
  success: boolean;
  price: number;
  confidence: number;
  publishTime: string;
  source: string;
}

/**
 * Simple fetch wrapper to replace axios dependency
 */
async function apiRequest(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Check the health and status of all blockchain services
 */
export async function checkServicesHealth(): Promise<ServiceStatus> {
  try {
    const data = await apiRequest('/health');
    return data.services;
  } catch (error) {
    console.error('Failed to check services health:', error);
    return {
      hedera: false,
      vlayer: false,
      pyth: false,
      veritas: false
    };
  }
}

/**
 * Get configuration for all blockchain services
 */
export async function getServicesConfig() {
  try {
    return await apiRequest('/api/config');
  } catch (error) {
    console.error('Failed to get services config:', error);
    return {};
  }
}

/**
 * Submit an article for comprehensive multi-chain verification
 */
export async function submitArticleForVerification(article: ArticleSubmission): Promise<VerificationResult | null> {
  try {
    console.log('🚀 Submitting article for verification:', article.title);

    const data = await apiRequest('/api/submit-article', {
      method: 'POST',
      body: JSON.stringify(article),
    });

    if (data.success) {
      console.log('✅ Article verification completed');
      return data;
    } else {
      throw new Error(data.error || 'Verification failed');
    }
  } catch (error) {
    console.error('❌ Failed to submit article for verification:', error);
    return null;
  }
}

/**
 * Get real-time price data from Pyth
 */
export async function getPriceData(symbol: string): Promise<PriceData | null> {
  try {
    return await apiRequest(`/api/price/${symbol}`);
  } catch (error) {
    console.error(`Failed to get price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Verify a web proof using vlayer
 */
export async function verifyWebProof(proofHash: string, url: string) {
  try {
    return await apiRequest('/api/verify-proof', {
      method: 'POST',
      body: JSON.stringify({ proofHash, url }),
    });
  } catch (error) {
    console.error('Failed to verify web proof:', error);
    return null;
  }
}

/**
 * Get Hedera topic information
 */
export async function getHederaTopics() {
  try {
    return await apiRequest('/api/hedera/topics');
  } catch (error) {
    console.error('Failed to get Hedera topics:', error);
    return {};
  }
}

/**
 * Get article verification status by ID
 */
export async function getArticleStatus(articleId: string) {
  try {
    return await apiRequest(`/api/article/${articleId}`);
  } catch (error) {
    console.error('Failed to get article status:', error);
    return null;
  }
}

/**
 * Batch analyze multiple articles
 */
export async function batchAnalyzeArticles(articles: ArticleSubmission[]) {
  try {
    return await apiRequest('/api/batch-analyze', {
      method: 'POST',
      body: JSON.stringify({ articles }),
    });
  } catch (error) {
    console.error('Failed to batch analyze articles:', error);
    return null;
  }
}

/**
 * Format truth score for display
 */
export function formatTruthScore(score: number): { 
  score: number; 
  level: string; 
  color: string; 
  description: string 
} {
  if (score >= 90) {
    return {
      score,
      level: 'EXCELLENT',
      color: 'text-green-600',
      description: 'Highly credible - verified across all systems'
    };
  } else if (score >= 75) {
    return {
      score,
      level: 'GOOD',
      color: 'text-blue-600', 
      description: 'Good credibility - verified by multiple sources'
    };
  } else if (score >= 60) {
    return {
      score,
      level: 'MODERATE',
      color: 'text-yellow-600',
      description: 'Moderate credibility - partial verification'
    };
  } else if (score >= 40) {
    return {
      score,
      level: 'LOW',
      color: 'text-orange-600',
      description: 'Low credibility - limited verification'
    };
  } else {
    return {
      score,
      level: 'POOR',
      color: 'text-red-600',
      description: 'Poor credibility - verification failed'
    };
  }
}

/**
 * Format verification level badge
 */
export function getVerificationBadge(level: string): {
  text: string;
  bgColor: string;
  textColor: string;
  icon: string;
} {
  switch (level) {
    case 'HIGH_CONFIDENCE':
      return {
        text: 'High Confidence',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: '✅'
      };
    case 'MEDIUM_CONFIDENCE':
      return {
        text: 'Medium Confidence',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: '⚠️'
      };
    case 'LOW_CONFIDENCE':
      return {
        text: 'Low Confidence',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: '❌'
      };
    default:
      return {
        text: 'Unknown',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: '❓'
      };
  }
}

/**
 * Format blockchain network names
 */
export function formatNetworkName(network: string): string {
  const networkMap: { [key: string]: string } = {
    'hedera_testnet': 'Hedera Testnet',
    'hedera_mainnet': 'Hedera Mainnet',
    'ethereum': 'Ethereum',
    'sepolia': 'Sepolia Testnet',
    'base': 'Base',
    'polygon': 'Polygon'
  };
  
  return networkMap[network] || network;
}

/**
 * Generate shareable verification URL
 */
export function generateShareableUrl(articleId: string, truthScore: number): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/verification/${articleId}?score=${truthScore}`;
}

/**
 * Download verification credential
 */
export async function downloadCredential(credentialHash: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/credential/${credentialHash}`);
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `verification-credential-${credentialHash.slice(0, 8)}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Failed to download credential:', error);
    return false;
  }
}

/**
 * Get supported price symbols
 */
export const SUPPORTED_PRICE_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'MATIC',
  'AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN',
  'EUR', 'GBP', 'JPY', 'GOLD', 'SILVER', 'OIL'
];

/**
 * Extract asset symbols from article text
 */
export function extractAssetSymbols(text: string): string[] {
  const symbols: string[] = [];
  const upperText = text.toUpperCase();
  
  // Check each supported symbol
  SUPPORTED_PRICE_SYMBOLS.forEach(symbol => {
    if (upperText.includes(symbol) || upperText.includes(symbol.toLowerCase())) {
      symbols.push(symbol);
    }
  });
  
  // Add common variations
  if (upperText.includes('BITCOIN')) symbols.push('BTC');
  if (upperText.includes('ETHEREUM')) symbols.push('ETH');
  if (upperText.includes('APPLE')) symbols.push('AAPL');
  if (upperText.includes('TESLA')) symbols.push('TSLA');
  if (upperText.includes('GOOGLE')) symbols.push('GOOGL');
  if (upperText.includes('MICROSOFT')) symbols.push('MSFT');
  if (upperText.includes('AMAZON')) symbols.push('AMZN');
  
  // Remove duplicates using Array.from and Set
  return Array.from(new Set(symbols));
}

/**
 * Format price display
 */
export function formatPrice(price: number, symbol: string): string {
  // Crypto prices
  if (['BTC', 'ETH', 'BNB', 'SOL'].includes(symbol)) {
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  // Stock prices
  if (['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN'].includes(symbol)) {
    return `$${price.toFixed(2)}`;
  }
  
  // Forex rates
  if (['EUR', 'GBP', 'JPY'].includes(symbol)) {
    return price < 1 ? price.toFixed(4) : price.toFixed(2);
  }
  
  // Commodities
  if (['GOLD', 'SILVER', 'OIL'].includes(symbol)) {
    return `$${price.toFixed(2)}`;
  }
  
  return price.toString();
}

/**
 * Get blockchain explorer URL for transaction
 */
export function getExplorerUrl(network: string, txHash: string): string {
  const explorerMap: { [key: string]: string } = {
    'hedera_testnet': `https://hashscan.io/testnet/transaction/${txHash}`,
    'hedera_mainnet': `https://hashscan.io/mainnet/transaction/${txHash}`,
    'ethereum': `https://etherscan.io/tx/${txHash}`,
    'sepolia': `https://sepolia.etherscan.io/tx/${txHash}`,
    'base': `https://basescan.org/tx/${txHash}`,
    'polygon': `https://polygonscan.com/tx/${txHash}`
  };
  
  return explorerMap[network] || '#';
}

/**
 * Real-time service status hook data
 */
export interface ServiceStatusData {
  isConnected: boolean;
  services: ServiceStatus;
  lastChecked: Date;
  isLoading: boolean;
}

// Mock real-time updates for development
let statusCallbacks: ((status: ServiceStatusData) => void)[] = [];

export function subscribeToServiceStatus(callback: (status: ServiceStatusData) => void) {
  statusCallbacks.push(callback);
  
  // Initial status check
  checkServicesHealth().then(services => {
    callback({
      isConnected: true,
      services,
      lastChecked: new Date(),
      isLoading: false
    });
  });
  
  // Return unsubscribe function
  return () => {
    statusCallbacks = statusCallbacks.filter(cb => cb !== callback);
  };
} 