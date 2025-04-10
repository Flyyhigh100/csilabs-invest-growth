
import React from 'react';
import { Transaction } from '@/types/transactions';

interface StatusBadgeProps {
  status: string;
}

// Support both direct status string or transaction object
interface ExtendedStatusBadgeProps extends Partial<StatusBadgeProps> {
  transaction?: Transaction;
}

const StatusBadge: React.FC<ExtendedStatusBadgeProps> = ({ status: directStatus, transaction }) => {
  // Get status either from direct prop or transaction object
  const status = directStatus || (transaction ? transaction.status : '');

  const getStatusStyles = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
