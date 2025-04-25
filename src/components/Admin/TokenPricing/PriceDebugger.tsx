
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { API_KEY, TOKEN_ADDRESS, MORALIS_CHAIN } from '@/services/api/config';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PriceDebugger = () => {
  const { currentPrice, error, lastUpdated, timeUntilNextUpdate, refreshPrice } = useTokenPrice();
  
  const isDemoData = error !== null;
  const apiKeyConfigured = !!API_KEY;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Price Debug Information</span>
          {isDemoData && (
            <Badge variant="destructive">Using Demo Data</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Debug information for price updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Current Price:</span>
            <span className="font-mono">${currentPrice?.toFixed(8) || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Last Updated:</span>
            <span className="font-mono">{lastUpdated?.toLocaleString() || 'Never'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Next Update In:</span>
            <span className="font-mono">{Math.ceil(timeUntilNextUpdate / 1000)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">API Key Status:</span>
            <span className="font-mono">{apiKeyConfigured ? '✅ Configured' : '❌ Missing'}</span>
          </div>
          
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => refreshPrice()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh Price
            </Button>
          </div>
          
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <AlertDescription className="text-xs">
              <div className="space-y-1">
                <p><strong>Token Address:</strong> {TOKEN_ADDRESS}</p>
                <p><strong>Chain ID:</strong> {MORALIS_CHAIN}</p>
                <p><strong>Cache Duration:</strong> {Math.ceil(timeUntilNextUpdate / 1000)}s</p>
              </div>
            </AlertDescription>
          </Alert>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Error Details
              </h4>
              <p className="text-xs text-red-600">{error.message}</p>
              <p className="text-xs text-red-500 mt-2">Check that your API key is properly configured in config.ts</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDebugger;
