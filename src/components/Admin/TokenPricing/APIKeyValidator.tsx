
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { TOKEN_ADDRESS, MORALIS_CHAIN, MORALIS_BASE_URL } from '@/services/api/config';
import { supabase } from '@/integrations/supabase/client';

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const validateMoralisAPIKey = async () => {
    setIsValidating(true);
    setTestResponse(null);

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

      // Validate key format first
      if (typeof apiKey !== 'string' || apiKey.length < 30) {
        console.error('API key has invalid format, length:', apiKey?.length);
        toast.error('Invalid Moralis API key format');
        setTestResponse({
          isValid: false,
          error: 'Invalid API key format'
        });
        return;
      }

      // Test the API key with a price request
      console.log('Testing API key with token:', TOKEN_ADDRESS);
      const testUrl = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price?chain=${MORALIS_CHAIN}`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': apiKey
        }
      });

      const responseData = await response.json();
      
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
            <Button 
              variant="outline" 
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
        
        <Alert variant="default" className="mt-4">
          <AlertDescription className="text-xs space-y-1">
            <p><strong>Testing Configuration:</strong></p>
            <p>Token Address: {TOKEN_ADDRESS}</p>
            <p>Chain ID: {MORALIS_CHAIN} (Polygon)</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default APIKeyValidator;
