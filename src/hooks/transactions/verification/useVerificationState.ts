
import { useState } from 'react';
import { Transaction } from '@/types/transactions';
import { VerificationState } from './types';

/**
 * Hook to manage the state for transaction verification
 */
export const useVerificationState = (): VerificationState => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  return {
    transaction,
    isRefreshing,
    hasCheckedStatus,
    pollingCount,
  };
};

export const useVerificationActions = (
  state: VerificationState
) => {
  const { 
    transaction: currentTransaction,
    hasCheckedStatus: currentHasCheckedStatus,
    pollingCount: currentPollingCount
  } = state;
  
  const setState = {
    setTransaction: useState<Transaction | null>(currentTransaction)[1],
    setIsRefreshing: useState<boolean>(false)[1],
    setHasCheckedStatus: useState<boolean>(currentHasCheckedStatus)[1],
    setPollingCount: useState<number>(currentPollingCount)[1],
  };

  return setState;
};
