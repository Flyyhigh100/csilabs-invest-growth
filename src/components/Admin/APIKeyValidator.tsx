
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface APIKeyValidationResult {
  isValid: boolean;
  details: string;
  rawResponse?: any;
  service: string;
}

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<APIKeyValidationResult[]>([]);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const validateCoinPaymentsKeys = async () => {
    setIsValidating(true);
    setResults([]);
    
    try {
      toast.info("Validating CoinPayments API keys...");
      
      const { data, error } = await supabase.functions.invoke('validate-api-keys', {
        body: {
          service: 'coinpayments'
        }
      });
      
      if (error) {
        console.error("Error validating API keys:", error);
        setResults([{
          isValid: false,
          details: `Function error: ${error.message || "Unknown error"}`,
          service: 'coinpayments'
        }]);
        toast.error("API key validation failed");
        return;
      }
      
      setResults([data]);
      
      if (data.isValid) {
        toast.success(`${data.service} API keys valid`, {
          description: data.details
        });
      } else {
        toast.error(`${data.service} API keys invalid`, {
          description: data.details
        });
      }
    } catch (err: any) {
      console.error("Exception during validation:", err);
      setResults([{
        isValid: false,
        details: `Exception: ${err.message || "Unknown error"}`,
        service: 'coinpayments'
      }]);
      toast.error("API key validation failed");
    } finally {
      setIsValidating(false);
    }
  };

  const toggleDetails = (service: string) => {
    setShowDetails(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Key Validator</CardTitle>
        <CardDescription>
          Check if your API keys are properly configured and working
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className={`p-4 rounded-md ${result.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {result.isValid ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="font-medium">
                    {result.service.charAt(0).toUpperCase() + result.service.slice(1)}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => toggleDetails(result.service)}
                >
                  {showDetails[result.service] ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
              
              {showDetails[result.service] && (
                <div className="mt-3 text-sm bg-white p-3 rounded border">
                  <p className="mb-2">{result.details}</p>
                  {result.rawResponse && (
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.rawResponse, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {results.length === 0 && !isValidating && (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>No validation results yet. Click the button below to check your API keys.</span>
            </div>
          )}
          
          {isValidating && (
            <div className="flex items-center gap-2 text-blue-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating API keys...</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          onClick={validateCoinPaymentsKeys}
          disabled={isValidating}
        >
          {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Validate CoinPayments API Keys
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APIKeyValidator;
