
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCryptoStatusCheck } from '@/hooks/payments/useCryptoStatusCheck';

interface RefreshCryptoTransactionsButtonProps {
  onRefreshComplete?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const RefreshCryptoTransactionsButton = ({
  onRefreshComplete,
  size = 'sm',
  variant = 'outline'
}: RefreshCryptoTransactionsButtonProps) => {
  const { refreshAllPendingTransactions, isChecking } = useCryptoStatusCheck();
  
  const handleRefresh = async () => {
    const success = await refreshAllPendingTransactions();
    if (success && onRefreshComplete) {
      onRefreshComplete();
    }
  };
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size={size}
          onClick={handleRefresh}
          disabled={isChecking}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
          {isChecking ? 'Syncing...' : 'Sync Crypto Payments'}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Sync all pending crypto transactions with CoinPayments</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default RefreshCryptoTransactionsButton;
