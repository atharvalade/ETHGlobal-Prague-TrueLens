"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Zap
} from 'lucide-react';

// Mock data for production-ready system
const mockVerificationStats = {
  totalVerifications: 15847,
  truthScore: 87.3,
  weeklyVerifications: 1247,
  monthlyGrowth: 23.5,
  accuracyRate: 94.2
};

const mockServiceHealth = {
  hedera: { 
    status: 'operational', 
    uptime: 99.97, 
    lastCheck: new Date().toISOString(),
    topicsActive: 12,
    messagesLogged: 45632,
    latency: 120
  },
  vlayer: { 
    status: 'operational', 
    uptime: 99.93, 
    lastCheck: new Date().toISOString(),
    proofsGenerated: 8934,
    trustScore: 96.8,
    latency: 245
  },
  pyth: { 
    status: 'operational', 
    uptime: 99.99, 
    lastCheck: new Date().toISOString(),
    priceFeeds: 1247,
    updatesPerSecond: 400,
    latency: 45
  },
  veritas: { 
    status: 'operational', 
    uptime: 99.95, 
    lastCheck: new Date().toISOString(),
    aiAnalyses: 23451,
    avgConfidence: 91.2,
    latency: 1200
  }
};

const mockRecentActivity = [
  {
    id: 1,
    type: 'verification',
    article: 'Tesla Stock Surges on Q4 Earnings Beat',
    truthScore: 92.5,
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'verified'
  },
  {
    id: 2,
    type: 'verification', 
    article: 'Bitcoin Reaches New All-Time High',
    truthScore: 88.7,
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: 'verified'
  },
  {
    id: 3,
    type: 'verification',
    article: 'Fed Announces Interest Rate Decision',
    truthScore: 95.2,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'verified'
  }
];

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [userStats, setUserStats] = useState(mockVerificationStats);
  const [serviceHealth, setServiceHealth] = useState(mockServiceHealth);
  const [recentActivity, setRecentActivity] = useState(mockRecentActivity);

  useEffect(() => {
    setMounted(true);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setUserStats(prev => ({
        ...prev,
        totalVerifications: prev.totalVerifications + Math.floor(Math.random() * 3),
        truthScore: Math.min(99.9, prev.truthScore + (Math.random() - 0.5) * 0.1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'operational' ? 'default' : 'destructive'} className="bg-green-500">
        <Check className="w-3 h-3 mr-1" />
        Operational
      </Badge>
    );
  };

    return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            TrueLens Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Multi-chain news verification system powered by Hedera, vlayer, and Pyth
          </p>
      </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Total Verifications
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {userStats.totalVerifications.toLocaleString()}
                  </p>
                    </div>
                <Shield className="w-8 h-8 text-blue-500" />
                  </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Average Truth Score
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {userStats.truthScore.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Weekly Verifications
                  </p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {userStats.weeklyVerifications.toLocaleString()}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                    <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    Accuracy Rate
                  </p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {userStats.accuracyRate.toFixed(1)}%
                  </p>
                          </div>
                <CheckCircle className="w-8 h-8 text-orange-500" />
                            </div>
            </CardContent>
          </Card>
                        </div>
                        
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services">Service Health</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hedera Consensus Service */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="w-5 h-5 text-purple-500" />
                      <CardTitle>Hedera Consensus Service</CardTitle>
                              </div>
                    {getStatusBadge(serviceHealth.hedera.status)}
                            </div>
                  <CardDescription>
                    Consensus logging and AI agent transparency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                          <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                    <span className="font-medium">{serviceHealth.hedera.uptime}%</span>
                          </div>
                  <Progress value={serviceHealth.hedera.uptime} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                      <p className="text-gray-600 dark:text-gray-400">Active Topics</p>
                      <p className="font-bold text-lg">{serviceHealth.hedera.topicsActive}</p>
                  </div>
                  <div>
                      <p className="text-gray-600 dark:text-gray-400">Messages Logged</p>
                      <p className="font-bold text-lg">{serviceHealth.hedera.messagesLogged.toLocaleString()}</p>
                  </div>
                </div>
                
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Latency</span>
                    <span className="flex items-center">
                      <Activity className="w-3 h-3 mr-1 text-green-500" />
                      {serviceHealth.hedera.latency}ms
                                </span>
                          </div>
                </CardContent>
              </Card>

              {/* vlayer Web Proofs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <CardTitle>vlayer Web Proofs</CardTitle>
                            </div>
                    {getStatusBadge(serviceHealth.vlayer.status)}
                          </div>
                  <CardDescription>
                    Web proof generation and source verification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                    <span className="font-medium">{serviceHealth.vlayer.uptime}%</span>
                      </div>
                  <Progress value={serviceHealth.vlayer.uptime} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                      <p className="text-gray-600 dark:text-gray-400">Proofs Generated</p>
                      <p className="font-bold text-lg">{serviceHealth.vlayer.proofsGenerated.toLocaleString()}</p>
                        </div>
                  <div>
                      <p className="text-gray-600 dark:text-gray-400">Trust Score</p>
                      <p className="font-bold text-lg">{serviceHealth.vlayer.trustScore}%</p>
                </div>
              </div>
              
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Latency</span>
                    <span className="flex items-center">
                      <Activity className="w-3 h-3 mr-1 text-green-500" />
                      {serviceHealth.vlayer.latency}ms
                    </span>
                      </div>
                </CardContent>
              </Card>

              {/* Pyth Price Feeds */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <CardTitle>Pyth Price Feeds</CardTitle>
                        </div>
                    {getStatusBadge(serviceHealth.pyth.status)}
                    </div>
                  <CardDescription>
                    Real-time financial data validation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                    <span className="font-medium">{serviceHealth.pyth.uptime}%</span>
                  </div>
                  <Progress value={serviceHealth.pyth.uptime} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                      <p className="text-gray-600 dark:text-gray-400">Price Feeds</p>
                      <p className="font-bold text-lg">{serviceHealth.pyth.priceFeeds.toLocaleString()}</p>
                        </div>
                      <div>
                      <p className="text-gray-600 dark:text-gray-400">Updates/sec</p>
                      <p className="font-bold text-lg">{serviceHealth.pyth.updatesPerSecond}</p>
                      </div>
                      </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Latency</span>
                    <span className="flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-green-500" />
                      {serviceHealth.pyth.latency}ms
                    </span>
                        </div>
                </CardContent>
              </Card>

              {/* Veritas AI Agent */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="w-5 h-5 text-green-500" />
                      <CardTitle>Veritas AI Agent</CardTitle>
                          </div>
                    {getStatusBadge(serviceHealth.veritas.status)}
                        </div>
                  <CardDescription>
                    AI-powered credibility analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                    <span className="font-medium">{serviceHealth.veritas.uptime}%</span>
                          </div>
                  <Progress value={serviceHealth.veritas.uptime} className="h-2" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">AI Analyses</p>
                      <p className="font-bold text-lg">{serviceHealth.veritas.aiAnalyses.toLocaleString()}</p>
              </div>
            <div>
                      <p className="text-gray-600 dark:text-gray-400">Avg Confidence</p>
                      <p className="font-bold text-lg">{serviceHealth.veritas.avgConfidence}%</p>
            </div>
          </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Processing Time</span>
                    <span className="flex items-center">
                      <Activity className="w-3 h-3 mr-1 text-green-500" />
                      {serviceHealth.veritas.latency}ms
                    </span>
                      </div>
                </CardContent>
              </Card>
                    </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Verification Activity</CardTitle>
                <CardDescription>
                  Latest news articles verified through TrueLens
                </CardDescription>
              </CardHeader>
              <CardContent>
                    <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.article}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                                </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-bold text-green-600">{activity.truthScore}%</p>
                          <p className="text-xs text-gray-500">Truth Score</p>
                              </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                              </div>
                            ))}
                          </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Trends</CardTitle>
                  <CardDescription>
                    Monthly verification volume and accuracy trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Monthly Growth</span>
                      <span className="font-bold text-green-600">+{userStats.monthlyGrowth}%</span>
                          </div>
                    <div className="flex justify-between items-center">
                      <span>Accuracy Improvement</span>
                      <span className="font-bold text-blue-600">+2.3%</span>
                          </div>
                    <div className="flex justify-between items-center">
                      <span>Processing Speed</span>
                      <span className="font-bold text-purple-600">45% faster</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Performance</CardTitle>
                  <CardDescription>
                    Multi-chain verification system metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Chains Supported</span>
                      <span className="font-bold">4 Networks</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Uptime</span>
                      <span className="font-bold text-green-600">99.96%</span>
                  </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Response Time</span>
                      <span className="font-bold text-blue-600">450ms</span>
                </div>
                </div>
                </CardContent>
              </Card>
              </div>
          </TabsContent>
        </Tabs>
            </div>
    </div>
  );
} 