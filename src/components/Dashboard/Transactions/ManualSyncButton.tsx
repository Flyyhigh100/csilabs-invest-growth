
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';

interface ManualSyncButtonProps {
  transactionId: string;
  onSuccess?: () => void;
}

const ManualSyncButton = ({ transactionId, onSuccess }: ManualSyncButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { forceUpdateTransaction } = useCryptoStatusCheck();

  const handleForceSync = async () => {
    setIsProcessing(true);
    
    try {
      toast.info("Forcing transaction sync...");
      
      // Create a mock transaction object with just the ID we need
      const mockTransaction = {
        id: transactionId,
        payment_method: 'coinpayments'
      } as any;
      
      const updatedTransaction = await forceUpdateTransaction(mockTransaction);
      
      if (updatedTransaction) {
        toast.success("Transaction status updated successfully!");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error forcing transaction sync:", error);
      toast.error("Failed to update transaction status");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleForceSync} 
      disabled={isProcessing}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isProcessing ? 'animate-spin' : ''}`} />
      Force Sync
    </Button>
  );
};

export default ManualSyncButton;
