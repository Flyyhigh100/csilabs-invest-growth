
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const [apiKeyStatus, setApiKeyStatus] = useState<{isConfigured: boolean, details?: string, isValidFormat?: boolean}>({isConfigured: false});
  
  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    try {
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
                ? 'Moralis API key is configured and has valid format' 
                : 'Moralis API key is configured but has invalid format')
            : 'Moralis API key is not configured'
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
            Check the status of the Moralis token pricing service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Moralis API Status</h3>
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
                      ? 'Connected' 
                      : apiKeyStatus.isConfigured 
                        ? 'Invalid Format' 
                        : 'Not Connected'}
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
              
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-sm text-gray-700 mb-2">Network Info</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Chain ID:</span>
                    <span className="text-xs font-medium">{MORALIS_CHAIN} (Polygon)</span>
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
                Token price data is provided by the Moralis API. Make sure your API key is properly configured 
                in the Supabase secrets panel.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PriceDebugger;
