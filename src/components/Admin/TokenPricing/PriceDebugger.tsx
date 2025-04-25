
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';

const PriceDebugger = () => {
  const { currentPrice, error, lastUpdated, timeUntilNextUpdate } = useTokenPrice();
  
  const isDemoData = error !== null;
  
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
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1">Error Details</h4>
              <p className="text-xs text-red-600">{error.message}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDebugger;
