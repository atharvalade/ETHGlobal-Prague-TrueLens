"use client";

import React, { useEffect, useState } from "react";
import FeatureCard from "../../components/marketplace/feature-card";
import HowItWorks from "../../components/marketplace/how-it-works";
import CtaSection from "../../components/marketplace/cta-section";
import ScrollToTop from "../../components/marketplace/scroll-to-top";
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Check, 
  TrendingUp, 
  Clock, 
  Database,
  Network,
  Cpu,
  Globe,
  BarChart3,
  Coins,
  CheckCircle,
  Activity,
  Zap,
  ArrowRight,
  Eye,
  FileCheck,
  DollarSign,
  Users,
  Lock,
  Layers,
  Target
} from 'lucide-react';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              TrueLens Veritas
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Multi-chain news verification system combating fake news in financial markets
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Network className="w-4 h-4 mr-2" />
                Hedera Consensus
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Globe className="w-4 h-4 mr-2" />
                vlayer Web Proofs
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2">
                <Coins className="w-4 h-4 mr-2" />
                Pyth Price Feeds
              </Badge>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <p className="text-lg">
                Leveraging AI, blockchain consensus, web proofs, and real-time price feeds to create 
                the most comprehensive news verification system for financial markets.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="process">Verification Process</TabsTrigger>
              <TabsTrigger value="technology">Technology Stack</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              {/* Problem Statement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-6 h-6 mr-2 text-red-500" />
                    The Problem We Solve
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-red-600">Financial Market Manipulation</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Fake news causes billions in market losses annually
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Social media amplifies misinformation at unprecedented speed
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Retail investors suffer disproportionate losses
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-blue-600">Our Solution</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Real-time AI-powered credibility analysis
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Blockchain-verified source authentication
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          Cross-referenced price data validation
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Cpu className="w-8 h-8 text-blue-600 mr-3" />
                      <h3 className="text-lg font-semibold">AI-Powered Analysis</h3>
                    </div>
                    <p className="text-gray-700">
                      Advanced OpenAI models analyze news sentiment, credibility, and trading implications 
                      with 94.2% accuracy.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Shield className="w-8 h-8 text-green-600 mr-3" />
                      <h3 className="text-lg font-semibold">Blockchain Consensus</h3>
          </div>
                    <p className="text-gray-700">
                      Hedera Consensus Service provides immutable logging and transparency 
                      for all verification decisions.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
                      <h3 className="text-lg font-semibold">Real-time Validation</h3>
                    </div>
                    <p className="text-gray-700">
                      Pyth Network price feeds validate financial claims in real-time 
                      across 1,247+ assets.
                    </p>
                  </CardContent>
                </Card>
            </div>
            </TabsContent>

            <TabsContent value="process" className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>6-Step Verification Process</CardTitle>
                  <CardDescription>
                    How TrueLens Veritas analyzes and verifies news articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Step 1 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Article Submission & Asset Detection</h3>
                        <p className="text-gray-700 mb-3">
                          News articles are submitted to the system, and our AI automatically detects 
                          financial symbols (stocks, crypto, commodities) mentioned in the content.
                        </p>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <code className="text-sm">
                            Input: &quot;Tesla stock surges 15% after Q4 earnings beat expectations&quot;<br/>
                            Detected: TSLA, automotive sector indicators
                          </code>
                        </div>
                      </div>
            </div>
            
                    {/* Step 2 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Veritas AI Analysis</h3>
                        <p className="text-gray-700 mb-3">
                          Our AI agent analyzes the article for credibility, sentiment, and trading implications. 
                          Results are logged to Hedera Consensus Service for transparency.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-green-800">Credibility Score</h4>
                            <p className="text-sm text-green-700">Based on source reliability, fact consistency</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <h4 className="font-medium text-blue-800">Sentiment Analysis</h4>
                            <p className="text-sm text-blue-700">Positive, negative, or neutral market impact</p>
                          </div>
                        </div>
                      </div>
            </div>
            
                    {/* Step 3 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">vlayer Web Proof Generation</h3>
                        <p className="text-gray-700 mb-3">
                          vlayer generates cryptographic proofs of the article&apos;s source, verifying URL authenticity 
                          and calculating a trust index based on domain reputation.
                        </p>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Source Verification</span>
                            <Badge className="bg-purple-500">96.8% Trust Score</Badge>
                          </div>
                        </div>
                      </div>
            </div>
            
                    {/* Step 4 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Pyth Price Feed Validation</h3>
                        <p className="text-gray-700 mb-3">
                          Real-time price data from Pyth Network validates any financial claims made in the article. 
                          Historical data is cross-referenced for accuracy.
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-yellow-50 p-2 rounded text-center">
                            <div className="font-bold text-yellow-800">TSLA</div>
                            <div className="text-sm text-yellow-700">$248.50</div>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded text-center">
                            <div className="font-bold text-yellow-800">BTC</div>
                            <div className="text-sm text-yellow-700">$43,250</div>
                          </div>
                          <div className="bg-yellow-50 p-2 rounded text-center">
                            <div className="font-bold text-yellow-800">ETH</div>
                            <div className="text-sm text-yellow-700">$2,580</div>
                          </div>
            </div>
          </div>
        </div>

                    {/* Step 5 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Hedera Consensus Logging</h3>
                        <p className="text-gray-700 mb-3">
                          All analysis results are logged to Hedera Consensus Service topics, creating an 
                          immutable audit trail for transparency and accountability.
                        </p>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-sm font-mono text-indigo-800">
                            Topic: 0.0.123456 | Message: AI_ANALYSIS_COMPLETE<br/>
                            Timestamp: {new Date().toISOString()}<br/>
                            Hash: 0x7f8a9b2c...
                          </div>
                        </div>
                      </div>
          </div>
          
                    {/* Step 6 */}
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold">
                        6
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Truth Score & Verifiable Credential</h3>
                        <p className="text-gray-700 mb-3">
                          A composite truth score (0-100) is calculated and a verifiable credential is generated, 
                          providing users with a downloadable proof certificate.
                        </p>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">Truth Score</span>
                            <span className="text-2xl font-bold text-red-600">87.3</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            AI Analysis: 40% • Web Proof: 30% • Price Validation: 20% • Blockchain: 10%
                          </div>
                        </div>
                      </div>
                </div>
              </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technology" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hedera */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Network className="w-8 h-8 text-purple-500" />
                      <div>
                        <CardTitle>Hedera Consensus Service</CardTitle>
                        <CardDescription>Immutable logging and transparency</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Key Features</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Consensus logging for AI decisions</li>
                        <li>• Topic-based message organization</li>
                        <li>• 99.97% uptime guarantee</li>
                        <li>• 120ms average latency</li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">12</div>
                        <div className="text-sm text-gray-600">Active Topics</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">45.6K</div>
                        <div className="text-sm text-gray-600">Messages Logged</div>
                </div>
              </div>
                  </CardContent>
                </Card>

                {/* vlayer */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-8 h-8 text-blue-500" />
                      <div>
                        <CardTitle>vlayer Web Proofs</CardTitle>
                        <CardDescription>Cryptographic source verification</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Capabilities</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• URL authenticity verification</li>
                        <li>• Domain trust scoring</li>
                        <li>• Cryptographic proof generation</li>
                        <li>• 245ms proof generation time</li>
                      </ul>
                </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">8.9K</div>
                        <div className="text-sm text-gray-600">Proofs Generated</div>
              </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">96.8%</div>
                        <div className="text-sm text-gray-600">Trust Score</div>
          </div>
        </div>
                  </CardContent>
                </Card>

                {/* Pyth */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Coins className="w-8 h-8 text-yellow-500" />
                      <div>
                        <CardTitle>Pyth Price Feeds</CardTitle>
                        <CardDescription>Real-time financial data</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Data Sources</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 1,247+ price feeds</li>
                        <li>• Crypto, stocks, forex, commodities</li>
                        <li>• 400 updates per second</li>
                        <li>• 45ms ultra-low latency</li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">1.2K</div>
                        <div className="text-sm text-gray-600">Price Feeds</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">99.99%</div>
                        <div className="text-sm text-gray-600">Uptime</div>
                      </div>
          </div>
                  </CardContent>
                </Card>

                {/* Veritas AI */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-8 h-8 text-green-500" />
                      <div>
                        <CardTitle>Veritas AI Agent</CardTitle>
                        <CardDescription>Advanced credibility analysis</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">AI Capabilities</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• OpenAI GPT-4 powered analysis</li>
                        <li>• Sentiment & credibility scoring</li>
                        <li>• Trading impact assessment</li>
                        <li>• 1.2s average processing time</li>
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">23.4K</div>
                        <div className="text-sm text-gray-600">AI Analyses</div>
                      </div>
                      <div className="bg-white p-3 rounded border">
                        <div className="font-bold text-lg">91.2%</div>
                        <div className="text-sm text-gray-600">Avg Confidence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benefits" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* For Investors */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-green-500" />
                      For Investors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Risk Reduction</h4>
                          <p className="text-sm text-gray-600">Avoid losses from fake news and market manipulation</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Informed Decisions</h4>
                          <p className="text-sm text-gray-600">Make trading decisions based on verified information</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Real-time Alerts</h4>
                          <p className="text-sm text-gray-600">Get notified about verified market-moving news</p>
                        </div>
                      </div>
              </div>
                  </CardContent>
                </Card>

                {/* For News Organizations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileCheck className="w-6 h-6 mr-2 text-blue-500" />
                      For News Organizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Credibility Verification</h4>
                          <p className="text-sm text-gray-600">Prove the authenticity of your reporting</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Trust Building</h4>
                          <p className="text-sm text-gray-600">Build reader trust through transparent verification</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Competitive Advantage</h4>
                          <p className="text-sm text-gray-600">Stand out with blockchain-verified content</p>
                        </div>
                      </div>
              </div>
                  </CardContent>
                </Card>

                {/* For Regulators */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-6 h-6 mr-2 text-purple-500" />
                      For Regulators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Market Integrity</h4>
                          <p className="text-sm text-gray-600">Maintain fair and transparent financial markets</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Audit Trail</h4>
                          <p className="text-sm text-gray-600">Immutable records for regulatory compliance</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Early Detection</h4>
                          <p className="text-sm text-gray-600">Identify and prevent market manipulation attempts</p>
              </div>
          </div>
        </div>
                  </CardContent>
                </Card>

                {/* For Developers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Layers className="w-6 h-6 mr-2 text-orange-500" />
                      For Developers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">API Integration</h4>
                          <p className="text-sm text-gray-600">Easy integration with existing applications</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Multi-chain Support</h4>
                          <p className="text-sm text-gray-600">Built on multiple blockchain networks</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Open Source</h4>
                          <p className="text-sm text-gray-600">Transparent and community-driven development</p>
                </div>
              </div>
            </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardContent className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Ready to Experience TrueLens?</h2>
                  <p className="text-lg mb-6 text-blue-100">
                    Join the fight against financial misinformation with our cutting-edge verification system.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button className="bg-white text-blue-600 hover:bg-gray-100">
                      Try Demo
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      View Documentation
                    </Button>
          </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 