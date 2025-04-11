
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import { toast } from 'sonner';

interface RefreshCryptoTransactionsButtonProps {
  onRefreshComplete?: () => void;
  forceUpdateAll?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const RefreshCryptoTransactionsButton: React.FC<RefreshCryptoTransactionsButtonProps> = ({
  onRefreshComplete,
  forceUpdateAll = false,
  size = 'default',
  variant = 'default'
}) => {
  const [localIsChecking, setLocalIsChecking] = useState(false);
  const { refreshAllPendingTransactions, isChecking: hookIsChecking } = useCryptoStatusCheck();
  
  // Combined checking state from both sources
  const isChecking = hookIsChecking || localIsChecking;

  const handleRefresh = async () => {
    try {
      setLocalIsChecking(true);
      const toastId = "refresh-crypto-all";
      
      toast.info(forceUpdateAll ? 'Force updating all transactions...' : 'Syncing crypto payments...', {
        id: toastId,
      });
      
      const success = await refreshAllPendingTransactions(forceUpdateAll);
      
      toast.dismiss(toastId);
      
      if (success && onRefreshComplete) {
        onRefreshComplete();
      } else if (!success) {
        console.error('Failed to refresh all transactions');
      }
    } catch (error) {
      console.error('Error in refreshing crypto transactions:', error);
      toast.error('Failed to refresh transactions', {
        description: 'Please try again later or contact support if the issue persists.'
      });
    } finally {
      setLocalIsChecking(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleRefresh}
      disabled={isChecking}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
      {isChecking 
        ? 'Checking...' 
        : forceUpdateAll 
          ? 'Force Update All' 
          : 'Sync Crypto Payments'}
    </Button>
  );
};

export default RefreshCryptoTransactionsButton;
