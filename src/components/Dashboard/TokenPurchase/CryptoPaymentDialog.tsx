
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import DialogContentComponent from './CryptoPayment/DialogContent';
import { DialogFooterActions } from './CryptoPayment/DialogFooterActions';
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import { useCryptoStatusCheck } from '@/hooks/payments/useCryptoStatusCheck';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/types/transactions';

interface CryptoPaymentDialogProps {
  open: boolean;
  onOpenChange?: (show: boolean) => void;
  onClose?: () => void;
  paymentDetails: CryptoPaymentDetails;
  amount?: number;
  selectedCurrency?: string;
}

const CryptoPaymentDialog: React.FC<CryptoPaymentDialogProps> = ({ 
  open, 
  onOpenChange,
  onClose, 
  paymentDetails,
  amount,
  selectedCurrency
}) => {
  const { user } = useAuth();
  const { data: transactions, refetch } = useTransactions(user?.id);
  const { checkTransactionStatus, isChecking } = useCryptoStatusCheck();
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);

  // Add amount to payment details if not already provided
  const enhancedPaymentDetails = paymentDetails ? {
    ...paymentDetails,
    amount: paymentDetails.amount !== undefined ? paymentDetails.amount : amount
  } : null;

  // Handle the close event from either prop
  const handleClose = () => {
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  // Find matching transaction when transactions load
  useEffect(() => {
    if (!transactions || !paymentDetails?.transactionId) return;
    
    const matchingTx = transactions.find(tx => 
      tx.transaction_id === paymentDetails.transactionId
    );
    
    if (matchingTx) {
      setPendingTransaction(matchingTx);
    }
  }, [transactions, paymentDetails]);

  // Set up automatic status check
  useEffect(() => {
    if (!open || !pendingTransaction) return;
    
    // Clear any existing interval
    if (statusCheckInterval) {
      window.clearInterval(statusCheckInterval);
    }
    
    // Don't set up checks for completed transactions
    if (pendingTransaction.status === 'completed') return;
    
    // Check every 60 seconds
    const interval = window.setInterval(() => {
      checkTransactionStatus(pendingTransaction)
        .then(updatedTx => {
          if (updatedTx && updatedTx.status === 'completed') {
            // Clear interval if completed
            window.clearInterval(interval);
            setStatusCheckInterval(null);
            
            // Refresh transactions list
            refetch();
          }
        });
    }, 60000); // 60 seconds
    
    setStatusCheckInterval(interval);
    
    // Initial check
    checkTransactionStatus(pendingTransaction);
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [open, pendingTransaction, checkTransactionStatus, refetch]);

  // Clear interval when dialog is closed
  useEffect(() => {
    if (!open && statusCheckInterval) {
      window.clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  }, [open, statusCheckInterval]);

  const handleCheckStatus = async () => {
    if (!pendingTransaction) return;
    
    await checkTransactionStatus(pendingTransaction);
    refetch();
  };

  // Dialog title based on whether we have a currency
  const dialogTitle = selectedCurrency 
    ? `Complete Your ${selectedCurrency} Payment` 
    : 'Complete Your Crypto Payment';

  return (
    <Dialog open={open} onOpenChange={onOpenChange || (() => handleClose())}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Follow the instructions below to complete your purchase with crypto.
          </DialogDescription>
        </DialogHeader>

        <DialogContentComponent paymentDetails={enhancedPaymentDetails} />
        
        <DialogFooter>
          <DialogFooterActions 
            onClose={handleClose}
            onCheckStatus={handleCheckStatus}
            isChecking={isChecking}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;
