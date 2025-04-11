
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';

interface RefreshCryptoTransactionsButtonProps {
  onRefreshComplete?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  forceUpdateAll?: boolean;
}

const RefreshCryptoTransactionsButton: React.FC<RefreshCryptoTransactionsButtonProps> = ({ 
  onRefreshComplete,
  size = 'default',
  variant = 'default',
  forceUpdateAll = false
}) => {
  const { refreshAllPendingTransactions, isChecking } = useCryptoStatusCheck();
  
  const handleRefresh = async () => {
    try {
      // Call the hook function to refresh all pending transactions
      const result = await refreshAllPendingTransactions();
      
      // If refresh was successful and callback provided, call it
      if (result && onRefreshComplete) {
        onRefreshComplete();
      }
    } catch (err) {
      console.error('Error refreshing crypto transactions:', err);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleRefresh}
      disabled={isChecking}
      className={size === 'sm' ? 'text-xs' : ''}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
      {forceUpdateAll ? 'Force Resync All' : 'Sync Crypto Payments'}
    </Button>
  );
};

export default RefreshCryptoTransactionsButton;
