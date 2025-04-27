
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { TOKEN_ADDRESS, CHAIN_ID, UNISWAP_SUBGRAPH_URL } from '@/services/api/config';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

const PriceDebugger = () => {
  const { currentPrice, error, lastUpdated, timeUntilNextUpdate, refreshPrice } = useTokenPrice();
  
  const isDemoData = error !== null;
  const apiStatus = useDefinedApiStatus();
  
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
            <span className="text-sm text-gray-500">API Status:</span>
            <span className="font-mono">{apiStatus.isConnected ? '✅ Connected' : '❌ Error'}</span>
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
                <p><strong>Chain ID:</strong> {CHAIN_ID}</p>
                <p><strong>Cache Duration:</strong> 60s</p>
                <p><strong>Primary Data Source:</strong> Defined.fi API</p>
                <p><strong>Fallback Source:</strong> DexScreener</p>
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

// Custom hook to check Defined.fi API status
function useDefinedApiStatus() {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Just attempt to fetch the price as a connectivity test
        await fetch('https://api.defined.fi/api/v0/healthcheck');
        setIsConnected(true);
      } catch (error) {
        console.error('Error checking API status:', error);
        setIsConnected(false);
      }
    };
    
    checkApiStatus();
  }, []);
  
  return { isConnected };
}

export default PriceDebugger;
