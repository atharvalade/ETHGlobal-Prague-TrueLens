"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  submitArticleForVerification, 
  formatTruthScore, 
  getVerificationBadge,
  checkServicesHealth,
  getPriceData,
  extractAssetSymbols,
  formatPrice,
  getExplorerUrl,
  formatNetworkName
} from '@/lib/blockchain-utils';

interface VerificationState {
  step: 'input' | 'processing' | 'results';
  currentStep: string;
  progress: number;
}

interface ServiceHealth {
  hedera: boolean;
  vlayer: boolean;
  pyth: boolean;
  veritas: boolean;
}

export default function VeritasDashboard() {
  const [verificationState, setVerificationState] = useState<VerificationState>({
    step: 'input',
    currentStep: 'Ready to verify',
    progress: 0
  });

  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>({
    hedera: false,
    vlayer: false,
    pyth: false,
    veritas: false
  });

  const [articleForm, setArticleForm] = useState({
    title: '',
    url: '',
    content: '',
    source: ''
  });

  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [extractedSymbols, setExtractedSymbols] = useState<string[]>([]);
  const [priceData, setPriceData] = useState<{[key: string]: any}>({});

  // Check service health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const health = await checkServicesHealth();
      setServiceHealth(health);
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Extract symbols and fetch price data when article content changes
  useEffect(() => {
    if (articleForm.content || articleForm.title) {
      const symbols = extractAssetSymbols(articleForm.title + ' ' + articleForm.content);
      setExtractedSymbols(symbols);

      // Fetch price data for extracted symbols
      symbols.forEach(async (symbol) => {
        const price = await getPriceData(symbol);
        if (price) {
          setPriceData(prev => ({ ...prev, [symbol]: price }));
        }
      });
    }
  }, [articleForm.content, articleForm.title]);

  const handleSubmitVerification = async () => {
    if (!articleForm.title || !articleForm.url || !articleForm.content || !articleForm.source) {
      alert('Please fill in all required fields');
      return;
    }

    setVerificationState({
      step: 'processing',
      currentStep: 'Starting verification process...',
      progress: 10
    });

    try {
      // Simulate verification steps with progress updates
      const steps = [
        { step: 'Initializing Veritas AI Agent...', progress: 20 },
        { step: 'Generating vlayer Web Proof...', progress: 40 },
        { step: 'Validating with Pyth Price Feeds...', progress: 60 },
        { step: 'Logging to Hedera Consensus Service...', progress: 80 },
        { step: 'Creating Verification Credential...', progress: 90 },
        { step: 'Verification Complete!', progress: 100 }
      ];

      for (const stepInfo of steps) {
        setVerificationState(prev => ({
          ...prev,
          currentStep: stepInfo.step,
          progress: stepInfo.progress
        }));
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const result = await submitArticleForVerification(articleForm);
      
      if (result) {
        setVerificationResults(result);
        setVerificationState({
          step: 'results',
          currentStep: 'Verification completed successfully',
          progress: 100
        });
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationState({
        step: 'input',
        currentStep: 'Verification failed - please try again',
        progress: 0
      });
    }
  };

  const handleReset = () => {
    setVerificationState({
      step: 'input',
      currentStep: 'Ready to verify',
      progress: 0
    });
    setVerificationResults(null);
    setArticleForm({
      title: '',
      url: '',
      content: '',
      source: ''
    });
    setExtractedSymbols([]);
    setPriceData({});
  };

  const ServiceStatusIndicator = ({ service, name }: { service: boolean, name: string }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${service ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
      <span className={`text-sm ${service ? 'text-green-700' : 'text-red-700'}`}>
        {name}
      </span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-4"
        >
          🔍 TrueLens Veritas
        </motion.h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-Chain News Verification System
        </p>
      </div>

      {/* Service Status Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">🌐</span>
          Blockchain Services Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ServiceStatusIndicator service={serviceHealth.hedera} name="Hedera HCS" />
          <ServiceStatusIndicator service={serviceHealth.vlayer} name="vlayer Proofs" />
          <ServiceStatusIndicator service={serviceHealth.pyth} name="Pyth Oracles" />
          <ServiceStatusIndicator service={serviceHealth.veritas} name="Veritas AI" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {verificationState.step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Submit Article for Verification</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the article title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article URL *
                </label>
                <input
                  type="url"
                  value={articleForm.url}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Domain *
                </label>
                <input
                  type="text"
                  value={articleForm.source}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="reuters.com, bloomberg.com, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Article Content *
                </label>
                <textarea
                  value={articleForm.content}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Paste the article content here..."
                />
              </div>

              {/* Extracted Symbols Preview */}
              {extractedSymbols.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    📊 Detected Financial Assets
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extractedSymbols.map(symbol => (
                      <span
                        key={symbol}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {symbol}
                        {priceData[symbol] && (
                          <span className="ml-2 text-blue-600">
                            {formatPrice(priceData[symbol].price, symbol)}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmitVerification}
                disabled={!articleForm.title || !articleForm.url || !articleForm.content || !articleForm.source}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                🚀 Start Multi-Chain Verification
              </button>
            </div>
          </motion.div>
        )}

        {verificationState.step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <svg className="w-24 h-24 animate-spin" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${verificationState.progress * 0.628} 62.8`}
                    className="text-blue-600"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">
                    {verificationState.progress}%
                  </span>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold mb-4">
                {verificationState.currentStep}
              </h2>
              
              <p className="text-gray-600">
                Verifying across Hedera, vlayer, and Pyth networks...
              </p>
            </div>
          </motion.div>
        )}

        {verificationState.step === 'results' && verificationResults && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="space-y-6"
          >
            {/* Truth Score Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="mb-6">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {verificationResults.verification.truthScore}
                </div>
                <div className="text-xl text-gray-600 mt-2">Truth Score</div>
              </div>
              
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getVerificationBadge(verificationResults.summary.level).bgColor} ${getVerificationBadge(verificationResults.summary.level).textColor}`}>
                <span className="mr-2">{getVerificationBadge(verificationResults.summary.level).icon}</span>
                {getVerificationBadge(verificationResults.summary.level).text}
              </div>
              
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                {verificationResults.summary.summary}
              </p>
            </div>

            {/* Verification Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* AI Analysis */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🤖</span>
                  <h3 className="text-lg font-semibold">AI Analysis</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {verificationResults.verification.aiAnalysis}%
                </div>
                <p className="text-sm text-gray-600">
                  Veritas AI credibility assessment
                </p>
                {verificationResults.results.hedera.topicId && (
                  <div className="mt-3 text-xs text-gray-500">
                    Logged to Hedera: {verificationResults.results.hedera.topicId}
                  </div>
                )}
              </div>

              {/* Web Proof */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🌐</span>
                  <h3 className="text-lg font-semibold">Web Proof</h3>
                </div>
                <div className={`text-2xl font-bold mb-2 ${verificationResults.verification.webProofValid ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationResults.verification.webProofValid ? '✅ Valid' : '❌ Invalid'}
                </div>
                <p className="text-sm text-gray-600">
                  vlayer source verification
                </p>
                {verificationResults.results.webProof.proofHash && (
                  <div className="mt-3 text-xs font-mono text-gray-500 truncate">
                    {verificationResults.results.webProof.proofHash.slice(0, 16)}...
                  </div>
                )}
              </div>

              {/* Price Validation */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">📊</span>
                  <h3 className="text-lg font-semibold">Price Check</h3>
                </div>
                <div className={`text-2xl font-bold mb-2 ${verificationResults.verification.pythValidated ? 'text-green-600' : 'text-yellow-600'}`}>
                  {verificationResults.verification.pythValidated ? '✅ Valid' : '⚠️ N/A'}
                </div>
                <p className="text-sm text-gray-600">
                  Pyth oracle validation
                </p>
                {verificationResults.results.priceValidation.assets && (
                  <div className="mt-3 text-xs text-gray-500">
                    {verificationResults.results.priceValidation.assets.length} assets checked
                  </div>
                )}
              </div>

              {/* Blockchain Log */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🏗️</span>
                  <h3 className="text-lg font-semibold">Blockchain</h3>
                </div>
                <div className={`text-2xl font-bold mb-2 ${verificationResults.verification.hederaLogged ? 'text-green-600' : 'text-red-600'}`}>
                  {verificationResults.verification.hederaLogged ? '✅ Logged' : '❌ Failed'}
                </div>
                <p className="text-sm text-gray-600">
                  Hedera consensus service
                </p>
                {verificationResults.results.hedera.transactionId && (
                  <a 
                    href={getExplorerUrl('hedera_testnet', verificationResults.results.hedera.transactionId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-blue-600 hover:underline block"
                  >
                    View on Hashscan →
                  </a>
                )}
              </div>
            </div>

            {/* Verification Checks */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Verification Checks</h3>
              <div className="space-y-3">
                {verificationResults.summary.checks.map((check: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-lg">
                      {check.startsWith('✅') ? '✅' : check.startsWith('⚠️') ? '⚠️' : '❌'}
                    </span>
                    <span className="text-gray-700">{check.slice(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                🔄 Verify Another Article
              </button>
              
              {verificationResults.results.credential && (
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(new Blob([JSON.stringify(verificationResults.results.credential.credential, null, 2)]));
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `verification-credential-${verificationResults.articleId}.json`;
                    a.click();
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  📄 Download Credential
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 