
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Send } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Transaction } from '@/types/transactions';
import SyncCryptoPaymentButton from '../Dashboard/Transactions/SyncCryptoPaymentButton';

const TestIPNForm: React.FC = () => {
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState('100'); // Default to "Complete"
  const [foundTransaction, setFoundTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Status options for test IPN
  const statusOptions = [
    { value: '0', label: 'Waiting for funds' },
    { value: '1', label: 'Confirming (Pending)' },
    { value: '2', label: 'Confirmed (Still Pending)' },
    { value: '100', label: 'Complete' }
  ];

  // Handle transaction search by ID
  const handleSearch = async () => {
    if (!transactionId) {
      toast.error("Please enter a transaction ID");
      return;
    }

    setIsSearching(true);
    setError(null);
    setFoundTransaction(null);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('external_transaction_id', transactionId)
        .maybeSingle();
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data) {
        setError(`No transaction found with ID: ${transactionId}`);
        return;
      }
      
      setFoundTransaction(data);
      toast.success("Transaction found");
    } catch (err: any) {
      console.error("Error searching for transaction:", err);
      setError(err.message || "An error occurred while searching for the transaction");
      toast.error("Error searching for transaction");
    } finally {
      setIsSearching(false);
    }
  };

  // Send test IPN notification
  const sendTestIPN = async () => {
    if (!transactionId) {
      toast.error("Please enter a transaction ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      toast.info("Sending test IPN notification...");
      
      const { data, error } = await supabase.functions.invoke('test-ipn-webhook', {
        body: { 
          transactionId,
          status
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new Error(data.message || "Failed to send test IPN");
      }
      
      toast.success("Test IPN notification sent", {
        description: "The transaction should be updated shortly."
      });
      
      console.log("Test IPN response:", data);
      
      // Update the transaction in state if we found it
      if (foundTransaction) {
        // Wait a moment for the status update to process
        setTimeout(async () => {
          try {
            const { data: updatedTx, error: txError } = await supabase
              .from('transactions')
              .select('*')
              .eq('id', foundTransaction.id)
              .single();
            
            if (!txError && updatedTx) {
              setFoundTransaction(updatedTx);
            }
          } catch (refreshError) {
            console.error("Error refreshing transaction data:", refreshError);
          }
        }, 2000);
      }
      
    } catch (err: any) {
      console.error("Error sending test IPN:", err);
      toast.error("Error sending test IPN", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle API key validation
  const validateApiKeys = async () => {
    try {
      setIsLoading(true);
      
      toast.info("Validating API keys...");
      
      const { data, error } = await supabase.functions.invoke('validate-api-keys', {
        body: { 
          service: 'coinpayments',
          debug: true
        }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to validate API keys");
      }
      
      if (data.isValid) {
        toast.success("API Keys Valid", {
          description: data.details || "Your CoinPayments API keys are configured correctly."
        });
      } else {
        toast.error("API Key Configuration Issue", {
          description: data.details || "The CoinPayments API keys appear to be invalid or misconfigured."
        });
      }
      
      console.log("API key validation result:", data);
    } catch (err: any) {
      console.error("Error validating API keys:", err);
      toast.error("Error validating API keys", {
        description: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>CoinPayments Test Tools</CardTitle>
        <CardDescription>Tools for testing CoinPayments integration and IPN notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Key Validator Tool */}
        <div className="border p-4 rounded-md bg-gray-50">
          <h3 className="text-md font-medium mb-4">API Key Validation</h3>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Validate your CoinPayments API keys and merchant configuration
            </p>
            <Button
              onClick={validateApiKeys}
              variant="outline"
              disabled={isLoading}
              className="bg-white hover:bg-gray-100"
            >
              Validate API Keys
            </Button>
          </div>
        </div>
        
        {/* Transaction Search Form */}
        <div className="border p-4 rounded-md">
          <h3 className="text-md font-medium mb-4">Find Transaction</h3>
          <div className="grid gap-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label htmlFor="transactionId">External Transaction ID (CP...)</Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter CoinPayments transaction ID (CP...)"
                  className="font-mono"
                  disabled={isSearching || isLoading}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!transactionId || isSearching || isLoading}
              >
                Search
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        
        {/* Transaction Details and IPN Test Form */}
        {foundTransaction && (
          <div className="border p-4 rounded-md bg-blue-50">
            <h3 className="text-md font-medium mb-4">Transaction Found</h3>
            
            <div className="mb-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Internal ID:</span>
                <span className="font-mono">{foundTransaction.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">External ID:</span>
                <span className="font-mono">{foundTransaction.external_transaction_id}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Amount:</span>
                <span>${foundTransaction.amount}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Currency:</span>
                <span>{foundTransaction.currency}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{foundTransaction.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <span className="font-medium">Created:</span>
                <span>{new Date(foundTransaction.created_at).toLocaleString()}</span>
              </div>
            </div>
            
            <div className="grid gap-4 mt-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Test Status to Send</Label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={sendTestIPN}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isLoading ? "Sending..." : "Send Test IPN"}
                </Button>
                
                <SyncCryptoPaymentButton
                  transaction={foundTransaction}
                  onSyncComplete={(updatedTx) => {
                    if (updatedTx) {
                      setFoundTransaction(updatedTx);
                      toast.success("Transaction status updated");
                    }
                  }}
                  forceUpdate={true}
                  className="w-full"
                  size="default"
                  variant="outline"
                />
                
                <SyncCryptoPaymentButton
                  transaction={foundTransaction}
                  validateApiKeysOnly={true}
                  className="w-full"
                  size="sm"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Instructions */}
        <div className="text-sm text-muted-foreground border-t pt-4 mt-4">
          <h4 className="font-medium mb-2">About This Tool</h4>
          <p className="mb-2">
            This tool lets you test your CoinPayments integration by:
          </p>
          <ol className="list-decimal list-inside space-y-1 pl-2">
            <li>Validating your API key configuration</li>
            <li>Sending test IPN notifications to simulate payment status changes</li>
            <li>Manually checking transaction status via the API</li>
          </ol>
          <p className="mt-2">
            When you send a test IPN, the system will update the transaction status in the database
            just like a real CoinPayments notification would.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestIPNForm;
