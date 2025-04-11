
import React from 'react';
import { Transaction } from '@/types/transactions';
import { CheckCircle2, Clock, ExternalLink, CircleDollarSign, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface StatusBadgeProps {
  status: string;
  tokenSent?: boolean;
  blockchainTxId?: string;
}

// Support both direct status string or transaction object
interface ExtendedStatusBadgeProps extends Partial<StatusBadgeProps> {
  transaction?: Transaction;
}

const StatusBadge: React.FC<ExtendedStatusBadgeProps> = ({ 
  status: directStatus, 
  tokenSent: directTokenSent,
  blockchainTxId: directBlockchainTxId,
  transaction 
}) => {
  // Get status either from direct prop or transaction object
  const status = directStatus || (transaction ? transaction.status : '');
  const tokenSent = directTokenSent || (transaction ? transaction.token_sent : false);
  const blockchainTxId = directBlockchainTxId || (transaction ? transaction.blockchain_tx_id : undefined);

  const getStatusStyles = () => {
    if (tokenSent) {
      return 'bg-green-100 text-green-800 border-green-300';
    }

    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
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
    if (tokenSent) {
      return (
        <span className="flex items-center">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Tokens Delivered
        </span>
      );
    }

    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Processing Delivery
          </span>
        );
      case 'confirmed':
        return (
          <span className="flex items-center">
            <CircleDollarSign className="h-3 w-3 mr-1" />
            Payment Received
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        );
      case 'canceled':
        return (
          <span className="flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Canceled
          </span>
        );
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getPolygonScanUrl = (txId: string) => {
    return `https://polygonscan.com/tx/${txId}`;
  };

  // If we have a blockchain tx ID, show it in the tooltip or display
  if (tokenSent && blockchainTxId) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a 
            href={getPolygonScanUrl(blockchainTxId)} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles()} hover:underline`}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Tokens Delivered
              <ExternalLink className="h-2 w-2 ml-1" />
            </span>
          </a>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <div>Transaction ID: {blockchainTxId.slice(0, 8)}...{blockchainTxId.slice(-6)}</div>
            <div className="text-muted-foreground">Click to view on PolygonScan</div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
}

export default StatusBadge;
