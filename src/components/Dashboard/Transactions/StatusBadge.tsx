
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StatusBadgeProps {
  transaction: Transaction;
}

const StatusBadge = ({ transaction }: StatusBadgeProps) => {
  switch (transaction.status) {
    case 'completed':
      return transaction.token_sent ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Tokens sent to wallet</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-amber-500">
                <Clock className="h-3 w-3 mr-1" />
                Processing
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Payment confirmed, tokens pending</p>
              {transaction.blockchain_tx_id && (
                <p className="text-xs mt-1">TX: {transaction.blockchain_tx_id.substring(0, 10)}...</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    case 'pending':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="max-w-xs">
                <p className="text-xs">Payment is being processed</p>
                {transaction.transaction_id && (
                  <p className="text-xs mt-1 opacity-75">ID: {transaction.transaction_id.substring(0, 10)}...</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    case 'failed':
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Payment processing failed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    default:
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {transaction.status}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Unknown status: {transaction.status}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
  }
};

export default StatusBadge;
