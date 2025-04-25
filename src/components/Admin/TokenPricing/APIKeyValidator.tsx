
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { TOKEN_ADDRESS, MORALIS_CHAIN } from '@/services/api/config';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const APIKeyValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const validateDefinedfiAPIKey = async () => {
    setIsValidating(true);
    setKeyStatus(null);
    setTestResponse(null);

    try {
      // Use the RPC method for consistency
      const { data: apiKey, error: keyError } = await supabase
        .rpc('get_secret', { secret_name: 'MORALIS_API_KEY' });

      if (keyError) {
        console.error('Error fetching API key:', keyError);
        setKeyStatus('Error fetching API key');
        toast.error('Failed to retrieve Defined.fi API key', {
          description: keyError.message
        });
        setIsValidating(false);
        return;
      }

      if (!apiKey) {
        setKeyStatus('No API key found');
        toast.warning('No Defined.fi API key configured');
        setIsValidating(false);
        return;
      }

      // Validate key format first - Moralis API keys should be 32 characters or longer
      if (typeof apiKey !== 'string' || apiKey.length < 30) {
        console.error('API key has invalid format, length:', apiKey?.length);
        setKeyStatus('API Key has invalid format');
        toast.error('Defined.fi API key has invalid format', {
          description: 'Please check that you have entered a valid API key'
        });
        setIsValidating(false);
        return;
      }

      // Validate key by making a test request to Defined.fi
      console.log(`Testing API key with token address: ${TOKEN_ADDRESS}`);
      const testUrl = `https://deep-index.moralis.io/api/v2/erc20/${TOKEN_ADDRESS}/price?chain=${MORALIS_CHAIN}`;
      
      console.log('Sending test request to:', testUrl);
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey
        }
      });

      // Store the full response for debugging
      let responseData;
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw: responseText };
      }

      setTestResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      });
      
      console.log('API test response:', response.status, responseData);

      if (response.ok) {
        setKeyStatus('API Key is valid');
        toast.success('Defined.fi API key successfully validated', {
          description: `Current price: $${responseData.usdPrice || 'N/A'}`
        });
      } else {
        let errorMessage = 'Unknown error';
        if (responseData) {
          errorMessage = responseData.message || responseData.error || 'API validation failed';
        }
        
        setKeyStatus('API Key validation failed');
        toast.error('Defined.fi API key validation failed', {
          description: errorMessage
        });
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      setKeyStatus('Validation error');
      setTestResponse({ error: error.toString() });
      toast.error('Error validating Defined.fi API key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Defined.fi API Key Validator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={validateDefinedfiAPIKey} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Defined.fi API Key'
          )}
        </Button>
        
        {keyStatus && (
          <div 
            className={`p-3 rounded-md ${
              keyStatus.includes('valid') && !keyStatus.includes('invalid')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center">
              {keyStatus.includes('valid') && !keyStatus.includes('invalid') ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span>{keyStatus}</span>
            </div>
          </div>
        )}
        
        {testResponse && (
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full"
            >
              {showDetails ? 'Hide' : 'Show'} API Response Details
            </Button>
            
            {showDetails && (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs border border-gray-200 overflow-auto max-h-60">
                <pre>{JSON.stringify(testResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
        
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="font-medium">Testing configuration:</span>
          </div>
          <div className="ml-6 mt-1 text-xs">
            <p><strong>Token Address:</strong> {TOKEN_ADDRESS}</p>
            <p><strong>Chain ID:</strong> {MORALIS_CHAIN} (Polygon)</p>
            <p><strong>API Endpoint:</strong> https://deep-index.moralis.io</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default APIKeyValidator;
