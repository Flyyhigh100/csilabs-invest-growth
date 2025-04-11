
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, RefreshCw, CircleDollarSign } from "lucide-react";
import { Transaction } from '@/types/transactions';

interface SuccessAlertProps {
  transaction: Transaction | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const SuccessAlert = ({ transaction, isRefreshing, onRefresh }: SuccessAlertProps) => {
  if (!transaction) return null;

  // Handle different transaction statuses
  const getAlertStyles = () => {
    switch (transaction.status) {
      case 'completed':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  const getAlertIcon = () => {
    switch (transaction.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'confirmed':
        return <CircleDollarSign className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getAlertTitle = () => {
    switch (transaction.status) {
      case 'completed':
        return 'Payment Successful';
      case 'confirmed':
        return 'Payment Received';
      default:
        return 'Payment Processing';
    }
  };

  const getAlertDescription = () => {
    switch (transaction.status) {
      case 'completed':
        return 'Your payment was processed successfully. Your tokens will be sent to your wallet shortly.';
      case 'confirmed':
        return 'Your payment has been received and is being processed. Your tokens will be sent to your wallet soon.';
      default:
        return 'Your payment is being processed. This may take a few moments to complete.';
    }
  };

  const showRefreshButton = transaction.status !== 'completed';

  return (
    <Alert className={`mb-6 ${getAlertStyles()}`}>
      {getAlertIcon()}
      <AlertTitle>{getAlertTitle()}</AlertTitle>
      <AlertDescription>
        {getAlertDescription()}
        {showRefreshButton && (
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
