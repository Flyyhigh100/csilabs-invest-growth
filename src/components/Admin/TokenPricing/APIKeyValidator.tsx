
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { TOKEN_ADDRESS, CHAIN_ID, UNISWAP_SUBGRAPH_URL } from '@/services/api/config';
import { supabase } from '@/integrations/supabase/client';

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    requestUrl?: string;
    headers?: any;
  } | null>(null);

  const validateUniswapConnection = async () => {
    setIsValidating(true);
    setTestResponse(null);
    setDebugInfo(null);

    try {
      toast.info("Testing Uniswap Subgraph connection...");
      
      // Test the Uniswap connection with a simple query
      const testUrl = UNISWAP_SUBGRAPH_URL;
      console.log('Testing Uniswap connection with token:', TOKEN_ADDRESS);
      console.log('Full request URL:', testUrl);
      
      const query = `{
        token(id: "${TOKEN_ADDRESS.toLowerCase()}") {
          derivedETH
          totalLiquidity
        }
        bundle(id: "1") {
          ethPrice
        }
      }`;
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      console.log('Request headers:', headers);

      // Set debug info
      setDebugInfo({
        requestUrl: testUrl,
        headers: headers
      });

      const response = await fetch(testUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query })
      });

      const responseData = await response.json();
      console.log('API Response:', response.status, responseData);
      
      setTestResponse({
        isValid: response.ok && responseData?.data?.token && responseData?.data?.bundle,
        status: response.status,
        data: responseData
      });

      if (response.ok && responseData?.data?.token) {
        const tokenDerivedETH = parseFloat(responseData.data.token.derivedETH);
        const ethPriceUSD = parseFloat(responseData.data.bundle.ethPrice);
        const tokenPriceUSD = tokenDerivedETH * ethPriceUSD;
        
        toast.success('Uniswap connection is valid', {
          description: `Current price: $${tokenPriceUSD.toFixed(5)}`
        });
      } else {
        const error = responseData.errors?.[0]?.message || 'Invalid response from API';
        toast.error('Uniswap connection failed', {
          description: error
        });
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setTestResponse({
        isValid: false,
        error: err.message || 'Unknown error occurred'
      });
      toast.error('Uniswap connection failed');
    } finally {
      setIsValidating(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uniswap Connection Validator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will validate your connection to the Uniswap Subgraph API by making a test request to fetch the current token price.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={validateUniswapConnection} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Test Uniswap Connection'}
        </Button>
        
        {testResponse && (
          <div className="mt-4">
            <div className="p-3 bg-gray-50 rounded-md mb-2">
              <div className="flex items-center">
                <span className={`mr-2 px-2 py-0.5 text-white text-xs font-bold rounded ${testResponse.isValid ? 'bg-green-500' : 'bg-red-500'}`}>
                  {testResponse.isValid ? 'SUCCESS' : 'FAILED'}
                </span>
                <span className="text-sm">
                  Status: {testResponse.status || 'Unknown'}
                </span>
              </div>
            </div>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={toggleDetails}
              className="w-full"
            >
              {showDetails ? 'Hide' : 'Show'} Response Details
            </Button>
            
            {showDetails && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs font-mono overflow-auto max-h-60">
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
        
        {debugInfo && (
          <div className="mt-4">
            <Alert variant="default" className="bg-amber-50 border-amber-200">
              <Bug className="h-4 w-4 text-amber-600 mr-2" />
              <AlertDescription className="text-xs space-y-1">
                <p><strong>Debug Info:</strong></p>
                <p>Request URL: {debugInfo.requestUrl}</p>
                {debugInfo.headers && (
                  <details>
                    <summary className="cursor-pointer">Headers</summary>
                    <pre className="mt-1 bg-gray-100 p-1 rounded">{JSON.stringify(debugInfo.headers, null, 2)}</pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Alert variant="default" className="mt-4">
          <AlertDescription className="text-xs space-y-1">
            <p><strong>Testing Configuration:</strong></p>
            <p>Token Address: {TOKEN_ADDRESS}</p>
            <p>Chain ID: {CHAIN_ID} (Polygon)</p>
            <p>Subgraph URL: {UNISWAP_SUBGRAPH_URL}</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default APIKeyValidator;
