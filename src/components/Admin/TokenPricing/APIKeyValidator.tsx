
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchDexScreenerPrice } from '@/services/api/dexScreenerPriceService';

const APIKeyValidator: React.FC = () => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  
  const checkApiKey = async () => {
    setIsChecking(true);
    
    try {
      await fetchDexScreenerPrice();
      setIsValid(true);
    } catch (error) {
      console.error('API validation error:', error);
      setIsValid(false);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };
  
  useEffect(() => {
    checkApiKey();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          API Configuration
          {isValid !== null && (
            <Badge variant={isValid ? "success" : "destructive"}>
              {isValid ? 'Valid' : 'Invalid'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            {isValid === true ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : isValid === false ? (
              <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            ) : (
              <RefreshCw className="h-6 w-6 text-blue-500 animate-spin flex-shrink-0" />
            )}
            
            <div>
              <h4 className="text-sm font-medium">DexScreener API</h4>
              <p className="text-xs text-gray-500">
                {isValid === true
                  ? 'API connection is working correctly'
                  : isValid === false
                  ? 'API validation failed, check network connectivity'
                  : 'Checking API connection...'}
              </p>
              {lastChecked && (
                <p className="text-xs text-gray-400 mt-1">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={checkApiKey} 
          disabled={isChecking} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Validate Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default APIKeyValidator;
