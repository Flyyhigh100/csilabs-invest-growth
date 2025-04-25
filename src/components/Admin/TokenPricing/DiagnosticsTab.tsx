
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOKEN_ADDRESS, CHAIN_ID, UNISWAP_SUBGRAPH_URL } from '@/services/api/config';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import APIKeyValidator from './APIKeyValidator';
import { supabase } from '@/integrations/supabase/client';

// Add an interface for the component props
interface DiagnosticsTabProps {
  // Make currentPrice optional since we might get it from context too
  currentPrice?: number | null;
}

const PriceDebugger: React.FC<DiagnosticsTabProps> = ({ currentPrice: propCurrentPrice }) => {
  const [apiStatus, setApiStatus] = useState<{isConnected: boolean, details?: string}>({isConnected: false});
  
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      // Simple test to check if Uniswap Subgraph is accessible
      const response = await fetch(UNISWAP_SUBGRAPH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `{ _meta { block { number } } }`
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data?.data?._meta) {
        setApiStatus({ 
          isConnected: true, 
          details: `Connected to Uniswap Subgraph. Latest block: ${data.data._meta.block.number}`
        });
      } else {
        setApiStatus({
          isConnected: false,
          details: `Error connecting to Uniswap: ${data?.errors?.[0]?.message || 'Unknown error'}`
        });
      }
    } catch (error: any) {
      console.error('Error checking API status:', error);
      setApiStatus({
        isConnected: false,
        details: `Exception: ${error.message || "Unknown error"}`
      });
    }
  };

  return (
    <div className="space-y-6">
      <APIKeyValidator />
      
      <Card>
        <CardHeader>
          <CardTitle>Price Service Diagnostics</CardTitle>
          <CardDescription>
            Check the status of the Uniswap token pricing service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Uniswap API Status</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    apiStatus.isConnected
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}></div>
                  <span>
                    {apiStatus.isConnected
                      ? 'Connected' 
                      : 'Not Connected'}
                  </span>
                </div>
                {apiStatus.details && (
                  <p className="text-xs text-gray-500 mt-1">{apiStatus.details}</p>
                )}
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={checkApiStatus}
                  className="w-full mt-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Status
                </Button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Network Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Chain ID:</span>
                    <span className="text-xs font-medium">{CHAIN_ID} (Polygon)</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Token:</span>
                    <span className="text-xs font-mono block mt-1 break-all">{TOKEN_ADDRESS}</span>
                  </div>
                </div>
              </div>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Token price data is provided by the Uniswap V2 Subgraph API for Polygon.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceDebugger;
