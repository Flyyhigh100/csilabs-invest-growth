
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';
import { StatusCheckOptions } from './types';
import { checkCryptoPaymentStatus } from '../cryptoStatusService';

// Handle detailed error message
export const handleStatusCheckError = (error: string, details?: string) => {
  console.error('Status check error:', error, details ? `Details: ${details}` : '');
  
  if (error.includes('Transaction not found')) {
    toast.error("Unable to verify payment", {
      description: "We couldn't find this transaction. Please try again later or contact support if this persists."
    });
  } else if (error.includes('API key') || error.includes('credentials')) {
    toast.error("Verification system unavailable", {
      description: "Our payment system is temporarily unavailable. Please try again later."
    });
  } else if (error.includes('Network error')) {
    toast.error("Connection issue", {
      description: "Unable to connect to payment verification service. Please check your connection and try again."
    });
  } else if (error.includes('Failed to send a request')) {
    toast.error("Verification failed", {
      description: "We're having trouble with our payment verification system. Please try again later or contact support."
    });
  } else {
    // Generic user-friendly message without technical details
    toast.error(`Payment verification failed`, {
      description: "We couldn't verify the payment status at this time. Please try again later."
    });
    
    // Still log the full details for admins/debugging
    console.error(`Detailed error info (not shown to user):`, { error, details });
  }
};

// Check a single transaction status
export async function checkSingleTransaction(
  transaction: Transaction, 
  options: StatusCheckOptions = {}
): Promise<Transaction | null> {
  if (!transaction || !transaction.id) {
    console.error('Invalid transaction provided to checkSingleTransaction');
    return null;
  }
  
  const { forceUpdate = false, showToast = true } = options;
  
  try {
    // Use a unique toast ID based on the transaction ID
    const toastId = `check-crypto-${transaction.id}`;
    
    if (showToast) {
      toast.info(forceUpdate ? "Force updating status..." : "Checking payment status...", {
        id: toastId,
      });
    }
    
    console.log(`Initiating status check for transaction ${transaction.id}`);
    
    // Get status from API
    const result = await checkCryptoPaymentStatus(transaction.id, forceUpdate);
    
    console.log(`Status check result for ${transaction.id}:`, result);
    
    if (showToast) {
      toast.dismiss(toastId);
    }
    
    if (result.error) {
      handleStatusCheckError(result.error, result.details);
      return null;
    }
    
    return result.transaction || null;
  } catch (err) {
    console.error('Exception in checkSingleTransaction:', err);
    
    if (showToast) {
      toast.error('Error checking payment status', {
        description: (err as Error).message || 'An unexpected error occurred during the status check'
      });
    }
    
    return null;
  }
}
