
import React, { useState } from 'react';
import { RefreshCw, Lock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SyncCryptoPaymentButtonProps {
  transaction: Transaction;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showTooltip?: boolean;
  forceUpdate?: boolean;
  validateApiKeysOnly?: boolean;
  testIpnMode?: boolean;
}

const SyncCryptoPaymentButton = ({ 
  transaction, 
  onSyncComplete,
  size = 'sm',
  variant = 'ghost',
  showTooltip = true,
  forceUpdate = false,
  validateApiKeysOnly = false,
  testIpnMode = false
}: SyncCryptoPaymentButtonProps) => {
  const [localIsChecking, setLocalIsChecking] = useState(false);
  const { checkTransactionStatus, forceUpdateTransaction, isChecking: hookIsChecking } = useCryptoStatusCheck();
  
  // Combined checking state from both sources
  const isChecking = hookIsChecking || localIsChecking;
  
  // For API key validation only option
  if (validateApiKeysOnly) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleApiKeyValidation}
        disabled={isChecking}
        className="border-amber-500 text-amber-700 hover:bg-amber-50"
      >
        <Lock className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Validating...' : 'Validate API Keys'}
      </Button>
    );
  }
  
  // For test IPN mode
  if (testIpnMode && transaction.external_transaction_id) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => handleTestIpn(transaction.external_transaction_id)}
        disabled={isChecking}
        className="border-purple-500 text-purple-700 hover:bg-purple-50"
      >
        <Send className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Sending...' : 'Test IPN'}
      </Button>
    );
  }
  
  // Only show for coinpayments transactions
  if (transaction.payment_method !== 'coinpayments') {
    return null;
  }

  // FIXED: Don't hide the button for completed transactions without tokens sent
  // Show button for any status except when tokens were already sent
  if (transaction.token_sent) {
    console.log('Not showing button - tokens already sent');
    return null;
  }

  async function handleApiKeyValidation() {
    try {
      setLocalIsChecking(true);
      
      const toastId = 'validate-api-keys';
      toast.info("Validating API keys configuration...", {
        id: toastId,
      });
      
      const { data, error } = await supabase.functions.invoke('validate-api-keys', {
        body: { service: 'coinpayments' }
      });
      
      toast.dismiss(toastId);
      
      if (error) {
        console.error("API key validation error:", error);
        toast.error("Error validating API keys", {
          description: error.message || "Could not validate API keys configuration."
        });
        return;
      }
      
      if (!data.isValid) {
        toast.error("API Key Configuration Issue", {
          description: data.details || "The CoinPayments API keys appear to be invalid or misconfigured."
        });
        console.error("API key validation details:", data);
        return;
      }
      
      toast.success("API Keys Validated", {
        description: "Your CoinPayments API keys are correctly configured."
      });
      
      if (data.rawResponse) {
        console.log("API key validation response:", data.rawResponse);
      }
    } catch (error) {
      console.error("Error validating API keys:", error);
      toast.error("Error validating API keys", {
        description: (error as Error).message || "An unexpected error occurred"
      });
    } finally {
      setLocalIsChecking(false);
    }
  }

  async function handleTestIpn(transactionId: string) {
    if (!transactionId) {
      toast.error("No transaction ID provided");
      return;
    }
    
    try {
      setLocalIsChecking(true);
      
      const toastId = 'test-ipn';
      toast.info("Sending test IPN notification...", {
        id: toastId,
      });
      
      const { data, error } = await supabase.functions.invoke('test-ipn-notification', {
        body: { 
          transactionId: transactionId,
          status: '100', // Complete status
          amount: transaction.amount
        }
      });
      
      toast.dismiss(toastId);
      
      if (error) {
        console.error("Error sending test IPN:", error);
        toast.error("Error sending test IPN", {
          description: error.message || "Could not send test IPN notification."
        });
        return;
      }
      
      toast.success("Test IPN Sent", {
        description: "A test IPN notification was sent to simulate a completed payment."
      });
      
      console.log("Test IPN response:", data);
      
      // Refresh transaction data after a delay
      setTimeout(() => {
        if (transaction.id) {
          handleSync();
        }
      }, 2000);
      
    } catch (error) {
      console.error("Error sending test IPN:", error);
      toast.error("Error sending test IPN", {
        description: (error as Error).message || "An unexpected error occurred"
      });
    } finally {
      setLocalIsChecking(false);
    }
  }

  const handleSync = async () => {
    try {
      setLocalIsChecking(true);
      
      const toastId = `sync-crypto-${transaction.id}`;
      toast.info(forceUpdate ? "Force updating status..." : "Checking payment status...", {
        id: toastId,
      });
      
      console.log(`Starting transaction check for transaction with:`, {
        id: transaction.id, 
        transaction_id: transaction.transaction_id,
        external_id: transaction.external_transaction_id,
        forceUpdate: forceUpdate
      });
      
      let updatedTransaction;
      let errorOccurred = false;
      
      try {
        if (forceUpdate) {
          // Use force update function when explicitly requested
          updatedTransaction = await forceUpdateTransaction(transaction);
        } else {
          // Use regular check function by default
          updatedTransaction = await checkTransactionStatus(transaction);
        }
        
        toast.dismiss(toastId);
        console.log(`Transaction check completed, result:`, updatedTransaction ? 'success' : 'no result');
        
        // Handle null result but still show proper notification
        if (!updatedTransaction && !forceUpdate) {
          // If regular check failed, try force update as fallback
          console.log("Regular check failed, trying force update as fallback");
          toast.info("Trying force update as fallback...", {
            id: `${toastId}-fallback`
          });
          updatedTransaction = await forceUpdateTransaction(transaction);
          toast.dismiss(`${toastId}-fallback`);
        }
      } catch (innerError) {
        errorOccurred = true;
        console.error("Error during transaction check:", innerError);
        toast.error('Error checking transaction status', {
          description: innerError.message || 'An unexpected error occurred'
        });
      }
      
      if (onSyncComplete) {
        onSyncComplete(updatedTransaction);
      }
      
      if (!updatedTransaction && !errorOccurred) {
        toast.error("Failed to update transaction status", {
          description: "Please try again later or contact support if the issue persists.",
          duration: 5000
        });
        
        console.log("Detailed transaction information for debugging:");
        console.log(JSON.stringify({
          transactionId: transaction.id,
          transaction_id: transaction.transaction_id,
          paymentMethod: transaction.payment_method,
          status: transaction.status,
          externalId: transaction.external_transaction_id,
          createdAt: transaction.created_at
        }));
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      toast.error("Failed to check payment status", {
        description: "Please try again later or contact support.",
        duration: 5000
      });
    } finally {
      setLocalIsChecking(false);
    }
  };

  // Always show both buttons - regular check and force update
  if (forceUpdate) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleSync}
        disabled={isChecking}
        className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300"
      >
        <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
        {isChecking ? 'Updating...' : 'Force Update'}
      </Button>
    );
  }

  // Regular check button (non-force update)
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isChecking}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
      {isChecking ? 'Checking...' : 'Check Status'}
    </Button>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Check payment status with CoinPayments</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export default SyncCryptoPaymentButton;
