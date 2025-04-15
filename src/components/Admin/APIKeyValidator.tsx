
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ApiKeyStatus {
  coinpayments: boolean;
  definedfi: boolean;
}

const APIKeyValidator: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiKeyStatus>({
    coinpayments: false,
    definedfi: false
  });
  const [showResults, setShowResults] = useState(false);
  
  const checkApiKeys = async () => {
    setIsChecking(true);
    setShowResults(true);
    
    try {
      // Check CoinPayments API status
      const { data: cpData, error: cpError } = await supabase.functions.invoke('validate-api-keys', {
        body: { service: 'coinpayments' }
      });
      
      if (cpError) {
        console.error("Error checking CoinPayments API:", cpError);
        setApiStatus(prev => ({ ...prev, coinpayments: false }));
      } else {
        setApiStatus(prev => ({ ...prev, coinpayments: cpData?.isValid || false }));
      }
      
      // Check Defined.fi API key from localStorage
      const definedfiKey = localStorage.getItem('definedfi_api_key');
      setApiStatus(prev => ({ ...prev, definedfi: !!definedfiKey }));
      
    } catch (error) {
      console.error("Error checking API keys:", error);
      toast.error("Error checking API keys", {
        description: "There was a problem validating your API keys. Please try again."
      });
    } finally {
      setIsChecking(false);
    }
  };
  
  // Check keys on component mount
  useEffect(() => {
    checkApiKeys();
  }, []);
  
  if (!showResults) {
    return null;
  }
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API Key Status</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkApiKeys}
          disabled={isChecking}
        >
          <KeyRound className={`h-3.5 w-3.5 mr-1.5 ${isChecking ? 'animate-pulse' : ''}`} />
          {isChecking ? 'Checking...' : 'Validate API Keys'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Alert className={apiStatus.coinpayments ? "border-green-200 text-green-800 bg-green-50" : "border-amber-200 text-amber-800 bg-amber-50"}>
          {apiStatus.coinpayments ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <AlertCircle className="h-4 w-4 text-amber-500" />
          }
          <AlertTitle>CoinPayments API</AlertTitle>
          <AlertDescription>
            {apiStatus.coinpayments ? 
              "API key is valid and properly configured." : 
              "API key not configured or invalid. Please check environment variables."
            }
          </AlertDescription>
        </Alert>
        
        <Alert className={apiStatus.definedfi ? "border-green-200 text-green-800 bg-green-50" : "border-amber-200 text-amber-800 bg-amber-50"}>
          {apiStatus.definedfi ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <AlertCircle className="h-4 w-4 text-amber-500" />
          }
          <AlertTitle>Defined.fi API</AlertTitle>
          <AlertDescription>
            {apiStatus.definedfi ? 
              "API key is configured in browser storage." : 
              "API key not found in local storage. Please configure it below."
            }
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default APIKeyValidator;
