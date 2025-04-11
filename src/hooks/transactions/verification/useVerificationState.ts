
import { useState, useRef } from 'react';
import { Transaction } from '@/types/transactions';

// State interface for the transaction verification process
interface VerificationState {
  transaction: Transaction | null;
  isRefreshing: boolean;
  hasCheckedStatus: boolean;
  pollingCount: number;
}

// Initial state for transaction verification
const initialState: VerificationState = {
  transaction: null,
  isRefreshing: false,
  hasCheckedStatus: false,
  pollingCount: 0
};

// Custom hook to manage transaction verification state
export function useVerificationState() {
  const [transaction, setTransaction] = useState<Transaction | null>(initialState.transaction);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(initialState.isRefreshing);
  const [hasCheckedStatus, setHasCheckedStatus] = useState<boolean>(initialState.hasCheckedStatus);
  const [pollingCount, setPollingCount] = useState<number>(initialState.pollingCount);
  
  return {
    transaction,
    isRefreshing,
    hasCheckedStatus,
    pollingCount,
    setTransaction,
    setIsRefreshing,
    setHasCheckedStatus,
    setPollingCount
  };
}

// Custom hook to get verification actions based on state
export function useVerificationActions(state: ReturnType<typeof useVerificationState>) {
  return {
    setTransaction: state.setTransaction,
    setIsRefreshing: state.setIsRefreshing,
    setHasCheckedStatus: state.setHasCheckedStatus,
    setPollingCount: state.setPollingCount
  };
}
