
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { TOKEN_ADDRESS, MORALIS_CHAIN } from '@/services/api/config';
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
  // Use the prop or fall back to context
  const { currentPrice: contextCurrentPrice, error } = useTokenPrice();
  const currentPrice = propCurrentPrice ?? contextCurrentPrice;
  const [apiKeyStatus, setApiKeyStatus] = useState<{isConfigured: boolean, details?: string, isValidFormat?: boolean}>({isConfigured: false});
  
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
      // Use the RPC function directly for consistency
      const { data, error } = await supabase
        .rpc('get_secret', { secret_name: 'MORALIS_API_KEY' });
      
      if (error) {
        console.error('Error checking API key status:', error);
        setApiKeyStatus({ 
          isConfigured: false, 
          details: `Error: ${error.message}`
        });
      } else {
        // Check if API key has valid format
        const isValidFormat = typeof data === 'string' && data.length >= 30;
        
        setApiKeyStatus({ 
          isConfigured: Boolean(data), 
          isValidFormat: isValidFormat,
          details: data 
            ? (isValidFormat 
                ? 'API key is configured and has valid format' 
                : 'API key is configured but has invalid format')
            : 'API key is not configured'
        });
      }
    } catch (error: any) {
      console.error('Error checking API key status:', error);
      setApiKeyStatus({
        isConfigured: false,
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
                <h3 className="font-medium text-sm text-gray-700 mb-2">API Key Status</h3>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    apiKeyStatus.isConfigured && apiKeyStatus.isValidFormat
                      ? 'bg-green-500' 
                      : apiKeyStatus.isConfigured 
                        ? 'bg-amber-500' 
                        : 'bg-red-500'
                  }`}></div>
                  <span>
                    {apiKeyStatus.isConfigured && apiKeyStatus.isValidFormat
                      ? 'Configured' 
                      : apiKeyStatus.isConfigured 
                        ? 'Invalid Format' 
                        : 'Missing'}
                  </span>
                </div>
                {apiKeyStatus.details && (
                  <p className="text-xs text-gray-500 mt-1">{apiKeyStatus.details}</p>
                )}
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={checkApiKeyStatus}
                  className="w-full mt-2 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Status
                </Button>
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
                  <span className="font-medium">{MORALIS_CHAIN} (Polygon)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Address:</span>
                  <span className="font-medium text-xs break-all">{TOKEN_ADDRESS}</span>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>API Error:</strong> {error.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceDebugger;
