
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface SyncCryptoPaymentButtonProps {
  transaction: Transaction;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showTooltip?: boolean;
  forceUpdate?: boolean;
}

const SyncCryptoPaymentButton = ({ 
  transaction, 
  onSyncComplete,
  size = 'sm',
  variant = 'ghost',
  showTooltip = true,
  forceUpdate = false
}: SyncCryptoPaymentButtonProps) => {
  const [localIsChecking, setLocalIsChecking] = useState(false);
  const { checkTransactionStatus, forceUpdateTransaction, isChecking: hookIsChecking } = useCryptoStatusCheck();
  
  // Combined checking state from both sources
  const isChecking = hookIsChecking || localIsChecking;
  
  // Only show for coinpayments transactions
  if (transaction.payment_method !== 'coinpayments') {
    return null;
  }

  // Don't show for completed transactions with tokens sent
  if (transaction.status === 'completed' && transaction.token_sent) {
    return null;
  }

  const handleSync = async () => {
    try {
      setLocalIsChecking(true);
      
      const toastId = `sync-crypto-${transaction.id}`;
      toast.info(forceUpdate ? "Force updating status..." : "Checking payment status...", {
        id: toastId,
      });
      
      let updatedTransaction;
      let errorOccurred = false;
      
      try {
        console.log(`Starting transaction check for ID: ${transaction.id}, forceUpdate: ${forceUpdate}`);
        
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

  const buttonLabel = isChecking 
    ? 'Checking...' 
    : forceUpdate 
      ? 'Force Update' 
      : 'Check Status';

  const tooltipContent = forceUpdate
    ? 'Force sync with CoinPayments API regardless of current status'
    : 'Check payment status with CoinPayments';

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isChecking}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
      {buttonLabel}
    </Button>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export default SyncCryptoPaymentButton;
