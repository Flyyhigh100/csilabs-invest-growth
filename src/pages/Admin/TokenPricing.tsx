
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, AlertTriangle, Settings, Clock } from 'lucide-react';
import { useTokenPrice } from '@/context/TokenPriceContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Spinner } from "@/components/ui/spinner";
import { useTokenData } from '@/hooks/useTokenData';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from '@/components/ui/alert';

const TokenPricingPage = () => {
  const { 
    currentPrice, 
    isLoading: isPriceLoading, 
    refreshPrice,
    lastUpdated,
    timeUntilNextUpdate
  } = useTokenPrice();
  
  const { 
    priceData, 
    isLoading: isHistoryLoading,
    refreshAllData
  } = useTokenData();
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString() 
    : 'Not yet updated';
    
  // Calculate time until next refresh in seconds
  const secondsUntilRefresh = Math.ceil(timeUntilNextUpdate / 1000);
    
  return (
    <AdminLayout title="Token Pricing">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Token Price History</span>
              <Button variant="outline" size="sm" onClick={refreshAllData} disabled={isHistoryLoading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${isHistoryLoading ? 'animate-spin' : ''}`} />
                {isHistoryLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </CardTitle>
            <CardDescription>Historical price data for the CSi token from Defined.fi</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] relative">
            {isHistoryLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Spinner className="h-8 w-8" />
                <span className="ml-2 text-gray-500">Loading price data...</span>
              </div>
            ) : priceData && priceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value.toFixed(5)}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(5)}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-amber-500 mr-2" />
                <span className="text-gray-500">No price data available</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Token Price</span>
              <Badge variant={isPriceLoading ? "outline" : "secondary"}>
                {isPriceLoading ? 'Loading...' : 'Live'}
              </Badge>
            </CardTitle>
            <CardDescription>Current pricing for token purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {isPriceLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner className="h-6 w-6 mr-2" />
                    Loading...
                  </div>
                ) : currentPrice ? (
                  `$${currentPrice.toFixed(5)}`
                ) : (
                  'Not available'
                )}
              </div>
              
              <div className="mt-2 text-sm text-gray-500 flex items-center justify-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {secondsUntilRefresh > 0 ? 
                    `Auto-refresh in ${secondsUntilRefresh}s` : 
                    'Refreshing...'
                  }
                </span>
              </div>
            </div>
            
            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription className="flex flex-col space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Data source:</span>
                  <span className="font-medium">Defined.fi API</span>
                </div>
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span className="font-medium">{formattedLastUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache duration:</span>
                  <span className="font-medium">30 seconds</span>
                </div>
              </AlertDescription>
            </Alert>

            <div className="pt-4">
              <Button 
                className="w-full" 
                onClick={refreshPrice} 
                disabled={isPriceLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isPriceLoading ? 'animate-spin' : ''}`} />
                {isPriceLoading ? 'Refreshing...' : 'Refresh Price Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Price Configuration
                </CardTitle>
                <CardDescription>
                  Configure token price settings for the payment system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval">Auto-refresh Interval (seconds)</Label>
                    <Input 
                      id="refresh-interval" 
                      type="number" 
                      min="5" 
                      max="300" 
                      value="30" 
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Modify in TokenPriceContext.tsx</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price-deviation">Max Price Deviation (%)</Label>
                    <Input 
                      id="price-deviation" 
                      type="number" 
                      min="1" 
                      max="50" 
                      value="20"
                      disabled={true}
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Modify in priceService.ts</p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Alert variant="warning" className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Current pricing configuration can only be modified in the source code.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full sm:w-auto">
                  Save Configuration
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Service Diagnostics</CardTitle>
                <CardDescription>
                  Check the status of the token pricing service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-medium text-sm text-gray-700 mb-2">Price Source Status</h3>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${currentPrice ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span>{currentPrice ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="font-medium text-sm text-gray-700 mb-2">Price Caching</h3>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Working</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Price Service Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Provider:</span>
                        <span className="font-medium">Defined.fi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chain ID:</span>
                        <span className="font-medium">137 (Polygon)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token Address:</span>
                        <span className="font-medium text-xs">0x4e5f276d29a122d787a8b345b1bc4bd5dd0f40c3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TokenPricingPage;
