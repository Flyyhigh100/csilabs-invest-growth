
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { TOKEN_ADDRESS, CHAIN_ID } from '@/services/api/config';
import { RefreshCw, AlertCircle, Clock, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const PriceDebugger = () => {
  const { 
    currentPrice, 
    error, 
    lastUpdated, 
    timeUntilNextUpdate, 
    refreshPrice, 
    dataSource 
  } = useTokenPrice();
  
  const isDemoData = error !== null;
  
  // Helper function to get source display name
  const getSourceDisplayName = (source: string | null) => {
    switch(source) {
      case 'on-chain': return "Uniswap V4 TWAP";
      case 'on-chain-v4': return "Uniswap V4 Spot";
      case 'on-chain-v3': return "Uniswap V3 TWAP";
      case 'defined.fi': return "Defined.fi API";
      case 'dexscreener': return "DexScreener API";
      case 'cache': return "Cached Data";
      default: return "Unknown Source";
    }
  };

  // Helper function to get badge variant based on source
  const getSourceBadgeVariant = (source: string | null) => {
    switch(source) {
      case 'on-chain':
      case 'on-chain-v4':
      case 'on-chain-v3':
        return "success";
      case 'defined.fi':
      case 'dexscreener':
        return "warning";
      case 'cache':
        return "outline";
      default:
        return "default";
    }
  };
  
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
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Data Source:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Badge variant={getSourceBadgeVariant(dataSource)}>
                      {getSourceDisplayName(dataSource)}
                    </Badge>
                    <Info className="h-3.5 w-3.5 ml-1 opacity-70" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p className="text-xs max-w-xs">
                    {dataSource?.includes('on-chain') ? 
                      'Price data comes directly from the blockchain - highest reliability' :
                      dataSource === 'defined.fi' || dataSource === 'dexscreener' ?
                      'Price data comes from third-party API - medium reliability' :
                      dataSource === 'cache' ?
                      'Using cached price data - may be outdated' :
                      'Source information unavailable'
                    }
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
          
          <Alert className={`mt-4 ${
            dataSource?.includes('on-chain') ? 'bg-green-50 border-green-200' :
            dataSource === 'defined.fi' || dataSource === 'dexscreener' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <AlertDescription className="text-xs">
              <div className="space-y-1">
                <p><strong>Token Address:</strong> {TOKEN_ADDRESS}</p>
                <p><strong>Chain ID:</strong> {CHAIN_ID}</p>
                <p><strong>Cache Duration:</strong> 60s</p>
                <p><strong>Primary Data Source:</strong> {getSourceDisplayName(dataSource)}</p>
                <p><strong>Fallback Order:</strong> V4 TWAP → V4 Spot → V3 TWAP → Defined.fi → DexScreener</p>
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
              <p className="text-xs text-red-500 mt-2">Check API connection in the Diagnostics tab</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDebugger;
