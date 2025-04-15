
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import APIKeyValidator from '@/components/Admin/APIKeyValidator';
import { supabase } from '@/integrations/supabase/client';

interface ApiConfigTabProps {
  apiUrl: string;
  setApiUrl: (value: string) => void;
  apiTimeout: string;
  setApiTimeout: (value: string) => void;
  onSave: () => void;
}

const ApiConfigTab: React.FC<ApiConfigTabProps> = ({
  apiUrl,
  setApiUrl,
  apiTimeout,
  setApiTimeout,
  onSave,
}) => {
  const [definedfiApiKey, setDefinedfiApiKey] = useState<string>('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Load the API key from localStorage on component mount
  React.useEffect(() => {
    const storedApiKey = localStorage.getItem('definedfi_api_key');
    if (storedApiKey) {
      setDefinedfiApiKey(storedApiKey);
    }
  }, []);
  
  const validateDefinedfiApiKey = async () => {
    if (!definedfiApiKey.trim()) {
      toast.error("API key required", {
        description: "Please enter your Defined.fi API key"
      });
      return;
    }
    
    try {
      setIsValidating(true);
      
      // Store the API key in localStorage for persistence
      localStorage.setItem('definedfi_api_key', definedfiApiKey);
      
      toast.success("API key saved", {
        description: "Your Defined.fi API key has been saved successfully."
      });
    } catch (error) {
      console.error("Error validating API key:", error);
      toast.error("Error saving API key", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <APIKeyValidator />
      
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>
            Configure the API integrations and parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="api-url">Defined.fi API URL</Label>
              <Input 
                id="api-url" 
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.defined.fi/api/v1"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
              <Input 
                id="api-timeout"
                type="number"
                value={apiTimeout}
                onChange={(e) => setApiTimeout(e.target.value)}
                placeholder="30"
              />
            </div>
            
            <div className="grid gap-2 mt-4 pt-4 border-t">
              <Label htmlFor="definedfi-api-key">Defined.fi API Key</Label>
              <Input 
                id="definedfi-api-key"
                value={definedfiApiKey}
                onChange={(e) => setDefinedfiApiKey(e.target.value)}
                placeholder="Enter your Defined.fi API key"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Your Defined.fi API key for accessing token price and market data. 
                This will be stored securely in your browser's local storage.
              </p>
              <Button 
                onClick={validateDefinedfiApiKey}
                className="mt-2 w-fit"
                disabled={isValidating}
                variant="outline"
              >
                {isValidating ? "Saving..." : "Save Defined.fi API Key"}
              </Button>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={onSave}>
                Save API Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ApiConfigTab;
