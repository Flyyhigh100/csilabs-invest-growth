
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const APIKeyValidator: React.FC = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<string | null>(null);

  const validateMoralisAPIKey = async () => {
    setIsValidating(true);
    setKeyStatus(null);

    try {
      const { data, error } = await supabase
        .rpc('get_secret', { secret_name: 'MORALIS_API_KEY' });

      if (error) {
        console.error('Error fetching API key:', error);
        setKeyStatus('Error fetching API key');
        toast.error('Failed to retrieve Moralis API key', {
          description: error.message
        });
        return;
      }

      if (!data) {
        setKeyStatus('No API key found');
        toast.warning('No Moralis API key configured');
        return;
      }

      // Validate key by making a test request
      const testUrl = `https://deep-index.moralis.io/api/v2/erc20/0xcba5ca199bca0af3f6046da01169035f2c6a7ff0/price?chain=0x89`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': data
        }
      });

      if (response.ok) {
        const result = await response.json();
        setKeyStatus('API Key is valid');
        toast.success('Moralis API key successfully validated', {
          description: `Current price: $${result.usdPrice || 'N/A'}`
        });
      } else {
        const errorText = await response.text();
        setKeyStatus('API Key validation failed');
        toast.error('Moralis API key validation failed', {
          description: errorText
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setKeyStatus('Validation error');
      toast.error('Error validating Moralis API key', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
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
        <Button 
          onClick={validateMoralisAPIKey} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Validate Moralis API Key'}
        </Button>
        {keyStatus && (
          <div 
            className={`p-3 rounded-md ${
              keyStatus.includes('valid') 
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {keyStatus}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default APIKeyValidator;
