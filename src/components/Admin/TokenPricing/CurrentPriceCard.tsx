
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, RefreshCw, Loader2, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CurrentPriceCardProps {
  currentPrice: number | null;
  isPriceLoading: boolean;
  refreshPrice: () => void;
  formattedLastUpdated: string;
  secondsUntilRefresh: number;
  dataSource?: 'on-chain' | 'on-chain-v4' | 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache' | null;
}

const CurrentPriceCard: React.FC<CurrentPriceCardProps> = ({
  currentPrice,
  isPriceLoading,
  refreshPrice,
  formattedLastUpdated,
  secondsUntilRefresh,
  dataSource = null
}) => {
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

  // Helper function for tooltip content
  const getSourceTooltip = (source: string | null) => {
    switch(source) {
      case 'on-chain':
        return "Using Uniswap V4 TWAP data directly from blockchain";
      case 'on-chain-v4':
        return "Using Uniswap V4 spot price directly from blockchain";
      case 'on-chain-v3':
        return "Using Uniswap V3 TWAP data directly from blockchain";
      case 'defined.fi':
        return "Using third-party API data from Defined.fi";
      case 'dexscreener':
        return "Using third-party API data from DexScreener";
      case 'cache':
        return "Using cached price data";
      default:
        return "Source information unavailable";
    }
  };

  return (
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
                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
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
        
        <Alert className={`${
          dataSource?.includes('on-chain') ? 'bg-green-50 border-green-200 text-green-800' :
          dataSource === 'defined.fi' || dataSource === 'dexscreener' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <AlertDescription className="flex flex-col space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span>Primary data source:</span>
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
                  <TooltipContent side="top">
                    <p className="text-xs">{getSourceTooltip(dataSource)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex justify-between">
              <span>Last updated:</span>
              <span className="font-medium">{formattedLastUpdated}</span>
            </div>
            <div className="flex justify-between">
              <span>Cache duration:</span>
              <span className="font-medium">60 seconds</span>
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
  );
};

export default CurrentPriceCard;
