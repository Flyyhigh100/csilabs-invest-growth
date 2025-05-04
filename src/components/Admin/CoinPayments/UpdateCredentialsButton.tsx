
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

const UpdateCredentialsButton = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState({
    public_key: '',
    private_key: '',
    ipn_secret: '',
    merchant_id: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      toast.info("Updating CoinPayments credentials...");
      
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
        console.error("Error updating credentials:", error);
        toast.error("Failed to update credentials", {
          description: error.message || "Please try again"
        });
        return;
      }
      
      toast.success("Credentials updated successfully", {
        description: "Your CoinPayments API keys have been updated"
      });
      
      // Close the dialog after successful update
      setOpen(false);
      
      // Reset the form
      setFormState({
        public_key: '',
        private_key: '',
        ipn_secret: '',
        merchant_id: '',
      });
      
      // Suggest validating the keys
      toast.info("Please validate your API keys", {
        description: "Go to Test Tools to validate the updated credentials",
        action: {
          label: "Go to Test Tools",
          onClick: () => window.location.href = "/admin/test-tools"
        }
      });
      
    } catch (err: any) {
      console.error("Error in credential update:", err);
      toast.error("Error updating credentials", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <RefreshCw className="mr-2 h-4 w-4" /> Update CoinPayments Credentials
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update CoinPayments Credentials</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveCredentials} className="space-y-4 mt-4">
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
            <p className="text-xs text-muted-foreground">
              This is essential for proper transaction verification
            </p>
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
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              {isLoading ? "Updating..." : "Update Credentials"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCredentialsButton;
