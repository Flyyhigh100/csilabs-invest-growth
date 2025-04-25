
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { TOKEN_ADDRESS, MORALIS_CHAIN, MORALIS_BASE_URL } from '@/services/api/config';
import { supabase } from '@/integrations/supabase/client';

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    keyLength?: number;
    keyPrefix?: string;
    requestUrl?: string;
    headers?: any;
  } | null>(null);

  const validateMoralisAPIKey = async () => {
    setIsValidating(true);
    setTestResponse(null);
    setDebugInfo(null);

    try {
      toast.info("Validating Moralis API key...");
      
      const { data: apiKey, error: keyError } = await supabase
        .rpc('get_secret', { secret_name: 'MORALIS_API_KEY' });

      if (keyError || !apiKey) {
        console.error('Error fetching API key:', keyError);
        toast.error('Failed to retrieve Moralis API key');
        setTestResponse({
          isValid: false,
          error: keyError?.message || 'API key not found'
        });
        return;
      }

      // Store debug info about the key
      const debugKeyInfo = {
        keyLength: apiKey?.length,
        keyPrefix: apiKey?.substring(0, 10) + '...' + apiKey?.substring(apiKey.length - 5),
      };

      console.log('API Key Debug Info:', debugKeyInfo);
      
      // Test the API key with a price request
      console.log('Testing API key with token:', TOKEN_ADDRESS);
      const testUrl = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price?chain=${MORALIS_CHAIN}`;
      console.log('Full request URL:', testUrl);
      
      const headers = {
        'Accept': 'application/json',
        'X-API-Key': apiKey
      };
      
      console.log('Request headers:', {
        'Accept': headers.Accept,
        'X-API-Key': `${headers['X-API-Key'].substring(0, 10)}...${headers['X-API-Key'].substring(headers['X-API-Key'].length - 5)}`
      });

      // Set debug info
      setDebugInfo({
        ...debugKeyInfo,
        requestUrl: testUrl,
        headers: {
          'Accept': headers.Accept,
          'X-API-Key': `${headers['X-API-Key'].substring(0, 10)}...${headers['X-API-Key'].substring(headers['X-API-Key'].length - 5)}`
        }
      });

      const response = await fetch(testUrl, {
        method: 'GET',
        headers
      });

      const responseData = await response.json();
      console.log('API Response:', response.status, responseData);
      
      setTestResponse({
        isValid: response.ok,
        status: response.status,
        data: responseData
      });

      if (response.ok && responseData.usdPrice) {
        toast.success('Moralis API key is valid', {
          description: `Current price: $${responseData.usdPrice}`
        });
      } else {
        const error = responseData.message || 'Invalid response from API';
        toast.error('API key validation failed', {
          description: error
        });
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setTestResponse({
        isValid: false,
        error: err.message || 'Unknown error occurred'
      });
      toast.error('API key validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moralis API Key Validator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will validate your Moralis API key by making a test request to fetch the current token price.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={validateMoralisAPIKey} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Validate Moralis API Key'}
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
              onClick={() => setShowDetails(!showDetails)}
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
                <p>Key Length: {debugInfo.keyLength || 'Unknown'}</p>
                <p>Key Format: {debugInfo.keyPrefix || 'Unknown'}</p>
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
            <p>Chain ID: {MORALIS_CHAIN} (Polygon)</p>
            <p>Base URL: {MORALIS_BASE_URL}</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default APIKeyValidator;
