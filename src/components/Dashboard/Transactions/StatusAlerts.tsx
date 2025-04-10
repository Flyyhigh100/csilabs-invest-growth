
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Transaction } from '@/types/transactions';

interface SuccessAlertProps {
  transaction: Transaction | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const SuccessAlert = ({ transaction, isRefreshing, onRefresh }: SuccessAlertProps) => {
  if (!transaction) return null;

  return (
    <Alert className={`mb-6 ${
      transaction.status === 'completed' 
        ? 'bg-green-50 text-green-800 border-green-200'
        : 'bg-amber-50 text-amber-800 border-amber-200'
    }`}>
      {transaction.status === 'completed' ? (
        <CheckCircle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <AlertTitle>
        {transaction.status === 'completed' 
          ? 'Payment Successful' 
          : 'Payment Processing'}
      </AlertTitle>
      <AlertDescription>
        {transaction.status === 'completed'
          ? 'Your payment was processed successfully. Your tokens will be sent to your wallet shortly.'
          : 'Your payment is being processed. This may take a few moments to complete.'}
        {transaction.status !== 'completed' && (
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Check Status
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export const PendingVerificationAlert = ({ isRefreshing, onRefresh }: { isRefreshing: boolean; onRefresh: () => void }) => (
  <Alert className="mb-6 bg-amber-50 text-amber-800 border-amber-200">
    <Clock className="h-5 w-5" />
    <AlertTitle>Payment Being Verified</AlertTitle>
    <AlertDescription>
      We're still verifying your payment. This process may take a few moments to complete.
      <div className="mt-2">
        <Button size="sm" variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Check Status
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

export const CanceledAlert = () => (
  <Alert className="mb-6 bg-red-50 text-red-800 border-red-200">
    <XCircle className="h-5 w-5" />
    <AlertTitle>Payment Canceled</AlertTitle>
    <AlertDescription>
      Your payment was canceled. No charges were made to your card.
    </AlertDescription>
  </Alert>
);
