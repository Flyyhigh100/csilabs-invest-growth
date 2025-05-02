
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CoinPaymentsSetup: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    public_key: '',
    private_key: '',
    ipn_secret: '',
    merchant_id: ''
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    
    try {
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
        toast.error("Failed to save configuration");
        setStatus('error');
        return;
      }
      
      toast.success("CoinPayments configuration saved successfully");
      setStatus('success');
      
      // Clear form and hide it after successful save
      setTimeout(() => {
        setShowForm(false);
        setFormState({
          public_key: '',
          private_key: '',
          ipn_secret: '',
          merchant_id: ''
        });
        setStatus('idle');
      }, 3000);
      
    } catch (err: any) {
      console.error("Error in CoinPayments config update:", err);
      toast.error("Error updating configuration");
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">CoinPayments Setup</h1>
      
      {!showForm ? (
        <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-lg">
          <h2 className="text-lg mb-4">Update your CoinPayments API credentials</h2>
          <Button
            size="lg"
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Enter CoinPayments Credentials
          </Button>
        </div>
      ) : (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enter CoinPayments Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="public_key">Public Key</Label>
                <Input
                  id="public_key"
                  name="public_key"
                  value={formState.public_key}
                  onChange={handleInputChange}
                  placeholder="Enter CoinPayments public key"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="private_key">Private Key</Label>
                <Input
                  id="private_key"
                  name="private_key"
                  value={formState.private_key}
                  onChange={handleInputChange}
                  type="password"
                  placeholder="Enter CoinPayments private key"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="merchant_id">Merchant ID</Label>
                <Input
                  id="merchant_id"
                  name="merchant_id"
                  value={formState.merchant_id}
                  onChange={handleInputChange}
                  placeholder="Enter CoinPayments merchant ID"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ipn_secret">IPN Secret</Label>
                <Input
                  id="ipn_secret"
                  name="ipn_secret"
                  value={formState.ipn_secret}
                  onChange={handleInputChange}
                  type="password"
                  placeholder="Enter IPN secret"
                  required
                />
              </div>

              {status === 'success' && (
                <Alert variant="success" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    Credentials saved successfully!
                  </AlertDescription>
                </Alert>
              )}
              
              {status === 'error' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to save credentials. Please try again.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {isSubmitting ? "Saving..." : "Save Credentials"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoinPaymentsSetup;
