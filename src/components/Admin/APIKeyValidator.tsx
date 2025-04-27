import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface APIKeyValidationResult {
  isValid: boolean;
  details: string;
  rawResponse?: any;
  service: string;
  debugInfo?: Record<string, any>;
}

const APIKeyValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<APIKeyValidationResult[]>([]);
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({});

  const validateApiKeys = async (service: string) => {
    setIsValidating(true);
    setResults([]);
    
    try {
      toast.info(`Validating ${service === 'defined.fi' ? 'Defined.fi' : 'CoinPayments'} API keys...`, {
        description: 'Attempting to connect and verify API credentials'
      });
      
      const { data, error } = await supabase.functions.invoke('validate-api-keys', {
        body: {
          service: service,
          debug: true
        }
      });
      
      if (error) {
        console.error("Error validating API keys:", error);
        const errorResult: APIKeyValidationResult = {
          isValid: false,
          details: `Function invocation error: ${error.message || "Unknown error"}`,
          service: service,
          debugInfo: {
            errorObject: error
          }
        };
        setResults([errorResult]);
        toast.error("API key validation failed", {
          description: errorResult.details
        });
        return;
      }
      
      if (data) {
        const validationResult: APIKeyValidationResult = {
          isValid: !!data.isValid,
          details: data.details || "No details provided",
          rawResponse: data,
          service: data.service || service,
          debugInfo: data.debugInfo || {}
        };
        
        setResults([validationResult]);
        
        if (data.isValid) {
          toast.success(`${data.service || service} API keys valid`, {
            description: data.details
          });
        } else {
          toast.error(`${data.service || service} API keys invalid`, {
            description: data.details
          });
        }
      } else {
        const noDataResult: APIKeyValidationResult = {
          isValid: false,
          details: "No validation result returned",
          service: service
        };
        setResults([noDataResult]);
        toast.error("API key validation failed - no data returned");
      }
    } catch (err: any) {
      console.error("Exception during validation:", err);
      const exceptionResult: APIKeyValidationResult = {
        isValid: false,
        details: `Exception: ${err.message || "Unknown error"}`,
        service: service,
        debugInfo: {
          stack: err.stack
        }
      };
      setResults([exceptionResult]);
      toast.error("API key validation failed", {
        description: exceptionResult.details
      });
    } finally {
      setIsValidating(false);
    }
  };

  const validateCoinPaymentsKeys = () => validateApiKeys('coinpayments');
  const validateDefinedFiKey = () => validateApiKeys('defined.fi');

  const toggleDetails = (service: string) => {
    setShowDetails(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  return (
    <Tabs defaultValue="coinpayments" className="space-y-4">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="coinpayments">CoinPayments</TabsTrigger>
        <TabsTrigger value="defined">Defined.fi</TabsTrigger>
      </TabsList>
      
      <TabsContent value="coinpayments">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>CoinPayments API Key Validator</CardTitle>
            <CardDescription>
              Check if your CoinPayments API keys are properly configured and working
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
                        {result.service ? result.service.charAt(0).toUpperCase() + result.service.slice(1) : 'Unknown Service'}
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
                      {result.debugInfo && (
                        <div className="mt-2 bg-blue-50 p-2 rounded">
                          <p className="font-medium text-blue-700">Debug Information:</p>
                          <pre className="text-xs text-blue-800 overflow-auto max-h-40">
                            {JSON.stringify(result.debugInfo, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {(results.length === 0 || !results.some(r => r.service === 'coinpayments')) && !isValidating && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>No validation results yet. Click the button below to check your CoinPayments API keys.</span>
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
          <CardFooter>
            <Button
              onClick={validateCoinPaymentsKeys}
              disabled={isValidating}
              className="w-full"
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate CoinPayments API Keys
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="defined">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Defined.fi API Key Validator</CardTitle>
            <CardDescription>
              Check if your Defined.fi API key is properly configured and working
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
                      <span className="font-medium">{result.service || 'Defined.fi'}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleDetails('defined.fi')}
                    >
                      {showDetails['defined.fi'] ? 'Hide Details' : 'Show Details'}
                    </Button>
                  </div>
                  
                  {showDetails['defined.fi'] && (
                    <div className="mt-3 text-sm bg-white p-3 rounded border">
                      <p className="mb-2">{result.details}</p>
                      {result.rawResponse && (
                        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                          {JSON.stringify(result.rawResponse, null, 2)}
                        </pre>
                      )}
                      {result.debugInfo && (
                        <div className="mt-2 bg-blue-50 p-2 rounded">
                          <p className="font-medium text-blue-700">Debug Information:</p>
                          <pre className="text-xs text-blue-800 overflow-auto max-h-40">
                            {JSON.stringify(result.debugInfo, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {(results.length === 0 || !results.some(r => r.service === 'defined.fi')) && !isValidating && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>No validation results yet. Click the button below to check your Defined.fi API key.</span>
                </div>
              )}
              
              {isValidating && (
                <div className="flex items-center gap-2 text-blue-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating API key...</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={validateDefinedFiKey}
              disabled={isValidating}
              className="w-full"
            >
              {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Validate Defined.fi API Key
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default APIKeyValidator;
