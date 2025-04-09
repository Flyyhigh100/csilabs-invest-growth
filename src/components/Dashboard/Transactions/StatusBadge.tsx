
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Transaction } from '@/types/transactions';

interface StatusBadgeProps {
  transaction: Transaction;
}

const StatusBadge = ({ transaction }: StatusBadgeProps) => {
  switch (transaction.status) {
    case 'completed':
      return transaction.token_sent ? (
        <Badge className="bg-green-500">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      ) : (
        <Badge className="bg-amber-500">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline">
          {transaction.status}
        </Badge>
      );
  }
};

export default StatusBadge;
