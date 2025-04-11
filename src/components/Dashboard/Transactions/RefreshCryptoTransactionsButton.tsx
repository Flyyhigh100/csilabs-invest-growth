
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import { toast } from 'sonner';

interface RefreshCryptoTransactionsButtonProps {
  onRefreshComplete?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  forceUpdateAll?: boolean;
}

const RefreshCryptoTransactionsButton = ({
  onRefreshComplete,
  size = 'default',
  variant = 'default',
  forceUpdateAll = false
}: RefreshCryptoTransactionsButtonProps) => {
  const { refreshAllPendingTransactions, isChecking } = useCryptoStatusCheck();

  const handleRefresh = async () => {
    const success = await refreshAllPendingTransactions(forceUpdateAll);
    
    if (success && onRefreshComplete) {
      onRefreshComplete();
    }
  };
  
  return (
    <Button
      onClick={handleRefresh}
      size={size}
      variant={variant}
      disabled={isChecking}
    >
      <RefreshCcw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
      {forceUpdateAll ? 'Force Update All' : 'Sync Crypto Payments'}
    </Button>
  );
};

export default RefreshCryptoTransactionsButton;
