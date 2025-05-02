
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, Copy, Key, RefreshCw, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FormState {
  public_key: string;
  private_key: string;
  ipn_secret: string;
  merchant_id: string;
}

const CoinPaymentsConfig: React.FC = () => {
  const [formState, setFormState] = useState<FormState>({
    public_key: '',
    private_key: '',
    ipn_secret: '',
    merchant_id: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{isValid?: boolean; details?: string} | null>(null);
  
  // Handle form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  // Save API keys to Supabase secrets
  const handleSaveKeys = async () => {
    try {
      setIsLoading(true);
      toast.info("Saving CoinPayments configuration...");
      
      // Use admin edge function to update secrets
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'update_coinpayments_config',
          public_key: formState.public_key,
          private_key: formState.private_key,
          ipn_secret: formState.ipn_secret,
          merchant_id: formState.merchant_id
        }
      });
      
      if (error) {
        console.error("Error saving CoinPayments config:", error);
        toast.error("Failed to save configuration", {
          description: error.message || "Please try again or contact support"
        });
        return;
      }
      
      toast.success("CoinPayments configuration saved", {
        description: "Your API keys and settings have been securely stored"
      });
      
      // If successful, automatically validate the keys
      validateApiKeys();
      
    } catch (err: any) {
      console.error("Error in CoinPayments config update:", err);
      toast.error("Error updating configuration", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validate the API keys with CoinPayments
  const validateApiKeys = async () => {
    try {
      setIsValidating(true);
      setValidationResult(null);
      
      toast.info("Validating CoinPayments API keys...");
      
      const { data, error } = await supabase.functions.invoke('validate-api-keys', {
        body: { 
          service: 'coinpayments',
          debug: true
        }
      });
      
      if (error) {
        console.error("Error validating API keys:", error);
        toast.error("Validation request failed", {
          description: error.message || "Could not validate API keys"
        });
        setValidationResult({
          isValid: false,
          details: "Connection error: Could not reach validation service"
        });
        return;
      }
      
      setValidationResult(data);
      
      if (data.isValid) {
        toast.success("API Keys Valid", {
          description: "Your CoinPayments API keys are correctly configured."
        });
      } else {
        toast.error("API Key Configuration Issue", {
          description: data.details || "The CoinPayments API keys appear to be invalid or misconfigured."
        });
      }
      
    } catch (err: any) {
      console.error("API key validation error:", err);
      toast.error("Validation Error", {
        description: err.message || "An unexpected error occurred during validation"
      });
      setValidationResult({
        isValid: false,
        details: err.message || "Unknown error during validation"
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Copy IPN URL to clipboard
  const copyIpnUrl = () => {
    const ipnUrl = `https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/coinpayments-ipn-webhook`;
    navigator.clipboard.writeText(ipnUrl);
    toast.success("IPN URL copied to clipboard");
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          CoinPayments Integration
        </CardTitle>
        <CardDescription>
          Configure your CoinPayments API keys and settings for crypto payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {/* API Keys Section */}
          <div className="space-y-3">
            <h3 className="text-md font-medium">API Credentials</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="public_key">Public Key</Label>
              <Input
                id="public_key"
                name="public_key"
                value={formState.public_key}
                onChange={handleInputChange}
                placeholder="Enter your CoinPayments public key"
                className="font-mono text-sm"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="private_key">Private Key</Label>
              <Input
                id="private_key"
                name="private_key"
                value={formState.private_key}
                onChange={handleInputChange}
                placeholder="Enter your CoinPayments private key"
                className="font-mono text-sm"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Your private key is stored securely and never exposed to the frontend.
              </p>
            </div>
          </div>
          
          <Separator />
          
          {/* Additional Settings Section */}
          <div className="space-y-3">
            <h3 className="text-md font-medium">Merchant Settings</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="merchant_id">Merchant ID</Label>
              <Input
                id="merchant_id"
                name="merchant_id"
                value={formState.merchant_id}
                onChange={handleInputChange}
                placeholder="Enter your CoinPayments merchant ID"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Your merchant ID can be found in your CoinPayments account settings.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ipn_secret">IPN Secret</Label>
              <Input
                id="ipn_secret"
                name="ipn_secret"
                value={formState.ipn_secret}
                onChange={handleInputChange}
                placeholder="Enter your IPN secret word"
                className="font-mono text-sm"
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                Create a secret word in your CoinPayments Merchant Settings &gt; IPN Settings.
              </p>
            </div>
          </div>
          
          <Separator />
          
          {/* IPN Configuration Helper */}
          <div className="space-y-3">
            <h3 className="text-md font-medium">IPN Configuration</h3>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="block mb-2">
                  Set up your IPN URL in the CoinPayments merchant dashboard:
                </span>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-md font-mono text-sm">
                  <span className="truncate text-gray-600">https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/coinpayments-ipn-webhook</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={copyIpnUrl}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Validation Result */}
          {validationResult !== null && (
            <Alert variant={validationResult.isValid ? "success" : "destructive"}>
              {validationResult.isValid ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
              <AlertDescription>
                {validationResult.isValid 
                  ? "API keys validated successfully."
                  : validationResult.details || "API keys validation failed."}
              </AlertDescription>
            </Alert>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="setup-guide">
              <AccordionTrigger>CoinPayments Setup Guide</AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal ml-5">
                  <li>Log in to your CoinPayments merchant account.</li>
                  <li>Go to <strong>Account &gt; API Keys</strong> and create a new API key pair.</li>
                  <li>Enable "Create Transaction" and "Get Basic Account Information" permissions.</li>
                  <li>Go to <strong>Account &gt; Merchant Settings &gt; IPN Settings</strong>.</li>
                  <li>Add the IPN URL shown above.</li>
                  <li>Create an IPN secret word and enter it in the form above.</li>
                  <li>Under <strong>Account &gt; Account Info</strong>, find your Merchant ID.</li>
                  <li>Add all the information to the form above and click Save Configuration.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={handleSaveKeys}
            disabled={isLoading}
            className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white"
          >
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
          
          <Button 
            onClick={validateApiKeys}
            disabled={isValidating || isLoading}
            variant="outline"
          >
            {isValidating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Key className="mr-2 h-4 w-4" />
            )}
            {isValidating ? "Validating..." : "Validate API Keys"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoinPaymentsConfig;
