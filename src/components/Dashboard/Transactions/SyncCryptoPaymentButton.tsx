
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useCryptoStatusCheck } from '@/hooks/payments/useCryptoStatusCheck';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { checkTransactionStatus, forceUpdateTransaction, isChecking } = useCryptoStatusCheck();
  
  // Only show for coinpayments transactions
  if (transaction.payment_method !== 'coinpayments') {
    return null;
  }

  // Don't show for completed transactions with tokens sent
  if (transaction.status === 'completed' && transaction.token_sent) {
    return null;
  }

  const handleSync = async () => {
    let updatedTransaction;
    
    if (forceUpdate) {
      // Use force update function when explicitly requested
      updatedTransaction = await forceUpdateTransaction(transaction);
    } else {
      // Use regular check function by default
      updatedTransaction = await checkTransactionStatus(transaction);
    }
    
    if (onSyncComplete && updatedTransaction) {
      onSyncComplete(updatedTransaction);
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
