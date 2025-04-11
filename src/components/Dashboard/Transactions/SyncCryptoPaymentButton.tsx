
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
}

const SyncCryptoPaymentButton = ({ 
  transaction, 
  onSyncComplete,
  size = 'sm',
  variant = 'ghost',
  showTooltip = true
}: SyncCryptoPaymentButtonProps) => {
  const { checkTransactionStatus, isChecking } = useCryptoStatusCheck();
  
  // Only show for coinpayments transactions
  if (transaction.payment_method !== 'coinpayments') {
    return null;
  }

  // Don't show for completed transactions
  if (transaction.status === 'completed' && transaction.token_sent) {
    return null;
  }

  const handleSync = async () => {
    const updatedTransaction = await checkTransactionStatus(transaction);
    if (onSyncComplete && updatedTransaction) {
      onSyncComplete(updatedTransaction);
    }
  };

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

  if (showTooltip && transaction.status === 'pending') {
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
