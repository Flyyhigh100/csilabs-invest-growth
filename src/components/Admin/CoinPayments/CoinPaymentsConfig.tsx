
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Coins, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import SyncCryptoPaymentButton from '@/components/Dashboard/Transactions/SyncCryptoPaymentButton';

const CoinPaymentsConfig = () => {
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [ipnSecret, setIpnSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!publicKey || !privateKey) {
      toast.error("Missing required fields", {
        description: "Public Key and Private Key are required"
      });
      return;
    }
    
    setIsSubmitting(true);
    const toastId = 'updating-coinpayments';
    
    toast.loading("Updating CoinPayments configuration...", {
      id: toastId,
    });

    try {
      // Call the admin-operations edge function to update the CoinPayments configuration
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'update_coinpayments_config',
          public_key: publicKey,
          private_key: privateKey,
          merchant_id: merchantId,
          ipn_secret: ipnSecret
        }
      });
      
      toast.dismiss(toastId);
      
      if (error) {
        console.error("Error updating CoinPayments configuration:", error);
        toast.error("Failed to update configuration", {
          description: error.message || "An error occurred while updating the configuration"
        });
        return;
      }

      if (data && data.message) {
        console.log("CoinPayments configuration updated successfully:", data);
        toast.success("Configuration updated", {
          description: "CoinPayments credentials have been successfully updated."
        });
        setShowSuccessMessage(true);
      } else {
        toast.error("Unexpected response", {
          description: "The server returned an unexpected response. Please try again."
        });
      }
    } catch (err) {
      console.error("Exception updating CoinPayments configuration:", err);
      toast.error("Error updating configuration", {
        description: (err as Error).message || "An unexpected error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Coins className="mr-2 h-5 w-5" />
          CoinPayments Configuration
        </CardTitle>
        <CardDescription>
          Update your CoinPayments API credentials and merchant settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <p className="font-medium">Configuration updated successfully!</p>
                <p className="text-sm mt-1">
                  Your CoinPayments credentials have been updated. You should now validate them using the API Key Validator.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SyncCryptoPaymentButton
                    transaction={{} as any}
                    validateApiKeysOnly={true}
                    variant="outline"
                    size="sm"
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  />
                  <Button
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowSuccessMessage(false)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="public-key" className="required">
                Public Key
              </Label>
              <Input
                id="public-key"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="Your CoinPayments API public key"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="private-key" className="required">
                Private Key
              </Label>
              <Input
                id="private-key"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Your CoinPayments API private key"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your private key is stored securely and never exposed in the frontend.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="merchant-id">
                Merchant ID
              </Label>
              <Input
                id="merchant-id"
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                placeholder="Your CoinPayments merchant ID (optional)"
              />
              <p className="text-xs text-muted-foreground">
                This is your merchant ID, not your account username.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ipn-secret">
                IPN Secret
              </Label>
              <Input
                id="ipn-secret"
                type="password"
                value={ipnSecret}
                onChange={(e) => setIpnSecret(e.target.value)}
                placeholder="Your CoinPayments IPN secret (optional)"
              />
              <p className="text-xs text-muted-foreground">
                Used to verify incoming payment notifications from CoinPayments.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-800 text-sm">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-medium">Important</p>
                  <p className="mt-1">
                    These credentials will update both the database secrets and Edge Function secrets.
                    This will affect all payment processing in your application immediately.
                  </p>
                </div>
              </div>
            </div>
            
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Updating..." : "Update CoinPayments Configuration"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CoinPaymentsConfig;
