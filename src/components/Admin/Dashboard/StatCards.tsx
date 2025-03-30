
import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  CreditCard, 
  DollarSign 
} from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Pending KYC Reviews"
        value={isLoading ? '...' : kycCounts.pending}
        icon={<Clock className="h-8 w-8 text-amber-500" />}
        linkTo="/admin/kyc"
        linkText="View pending reviews"
      />
      
      <StatCard
        title="Pending Token Transfers"
        value={isLoading ? '...' : pendingTokensCount}
        icon={<CreditCard className="h-8 w-8 text-blue-500" />}
        linkTo="/admin/transactions"
        linkText="Process transfers"
      />
      
      <StatCard
        title="Approved KYCs"
        value={isLoading ? '...' : kycCounts.approved}
        icon={<CheckCircle className="h-8 w-8 text-green-500" />}
        linkTo="/admin/kyc"
        linkText="View all KYCs"
      />
      
      <StatCard
        title="Total Transaction Value"
        value={isLoading ? '...' : `$${totalTransactionValue.toFixed(2)}`}
        icon={<DollarSign className="h-8 w-8 text-emerald-500" />}
        linkTo="/admin/transactions"
        linkText="View transactions"
      />
    </div>
  );
};

export default StatCards;
