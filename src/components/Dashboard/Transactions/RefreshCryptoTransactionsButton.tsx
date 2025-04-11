
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCryptoStatusCheck } from '@/hooks/payments/useCryptoStatusCheck';

interface RefreshCryptoTransactionsButtonProps {
  onRefreshComplete?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  forceUpdateAll?: boolean;
}

const RefreshCryptoTransactionsButton = ({
  onRefreshComplete,
  size = 'sm',
  variant = 'outline',
  forceUpdateAll = false
}: RefreshCryptoTransactionsButtonProps) => {
  const { refreshAllPendingTransactions, isChecking } = useCryptoStatusCheck();
  
  const handleRefresh = async () => {
    const success = await refreshAllPendingTransactions();
    if (success && onRefreshComplete) {
      onRefreshComplete();
    }
  };
  
  const buttonLabel = isChecking 
    ? 'Syncing...' 
    : forceUpdateAll 
      ? 'Force Sync All Crypto' 
      : 'Sync Crypto Payments';

  const tooltipContent = forceUpdateAll
    ? 'Force synchronize all crypto transactions with CoinPayments'
    : 'Sync all pending crypto transactions with CoinPayments';
  
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
          {buttonLabel}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default RefreshCryptoTransactionsButton;
