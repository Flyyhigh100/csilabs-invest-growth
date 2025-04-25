
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { TOKEN_ADDRESS, CHAIN_ID } from '@/services/api/config';
import { supabase } from '@/integrations/supabase/client';

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    requestUrl?: string;
    headers?: any;
  } | null>(null);

  const validateDefinedConnection = async () => {
    setIsValidating(true);
    setTestResponse(null);
    setDebugInfo(null);

    try {
      toast.info("Testing Defined.fi API connection...");
      
      // Call our edge function to test the connection
      const { data, error } = await supabase.functions.invoke('get-token-price', {
        body: {
          tokenAddress: TOKEN_ADDRESS,
          chainId: CHAIN_ID
        }
      });

      console.log('API Response:', data);
      
      if (error) {
        console.error('Function error:', error);
        setTestResponse({
          isValid: false,
          status: 500,
          data: null,
          error: error.message
        });
        
        toast.error('Defined.fi connection failed', {
          description: error.message
        });
      } else if (data?.price) {
        setTestResponse({
          isValid: true,
          status: 200,
          data: data
        });
        
        toast.success('Defined.fi connection is valid', {
          description: `Current price: $${data.price.toFixed(5)}`
        });
      } else {
        setTestResponse({
          isValid: false,
          status: data?.status || 400,
          data: data
        });
        
        const error = data?.error || 'Invalid response from API';
        toast.error('Defined.fi connection failed', {
          description: error
        });
      }

      setDebugInfo({
        requestUrl: `Supabase Function: get-token-price`,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err: any) {
      console.error('Validation error:', err);
      setTestResponse({
        isValid: false,
        error: err.message || 'Unknown error occurred'
      });
      toast.error('Defined.fi connection failed');
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
        <CardTitle>Defined.fi API Validator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This will validate your connection to the Defined.fi API by making a test request to fetch the current token price.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={validateDefinedConnection} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? 'Validating...' : 'Test Defined.fi Connection'}
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
                <p>Request: {debugInfo.requestUrl}</p>
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
            <p>API: Defined.fi</p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default APIKeyValidator;
