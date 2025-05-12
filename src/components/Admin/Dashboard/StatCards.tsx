
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  CreditCard, 
  DollarSign, 
  Activity 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard';

interface StatCardsProps {
  kycCounts: {
    pending: number;
    approved: number;
  };
  pendingTokensCount: number;
  totalTransactionValue: number;
  isLoading: boolean;
}

const StatCards: React.FC<StatCardsProps> = ({ 
  kycCounts, 
  pendingTokensCount, 
  totalTransactionValue, 
  isLoading 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      <StatCard
        title="Pending KYC Reviews"
        value={isLoading ? '...' : kycCounts.pending}
        icon={<Clock className="h-8 w-8 text-amber-500" />}
        linkTo="/admin/kyc?status=pending"
        linkText="View pending reviews"
      />
      
      <StatCard
        title="Pending Token Transfers"
        value={isLoading ? '...' : pendingTokensCount}
        icon={<CreditCard className="h-8 w-8 text-blue-500" />}
        linkTo="/admin/transactions?pending_tokens=true"
        linkText="Process transfers"
        highlight={pendingTokensCount > 0}
      />
      
      <StatCard
        title="Approved KYCs"
        value={isLoading ? '...' : kycCounts.approved}
        icon={<CheckCircle className="h-8 w-8 text-green-500" />}
        linkTo="/admin/kyc?status=approved"
        linkText="View all KYCs"
      />
      
      <StatCard
        title="Total Transaction Value"
        value={isLoading ? '...' : `$${totalTransactionValue.toFixed(2)}`}
        icon={<DollarSign className="h-8 w-8 text-emerald-500" />}
        linkTo="/admin/transactions"
        linkText="View transactions"
      />
      
      <StatCard
        title="Transactions Ready for Distribution"
        value={isLoading ? '...' : pendingTokensCount}
        icon={<Activity className="h-8 w-8 text-purple-500" />}
        linkTo="/admin/transactions?status=completed&tokens_sent=false"
        linkText="Distribute tokens"
        highlight={pendingTokensCount > 0}
      />
    </div>
  );
};

export default StatCards;
