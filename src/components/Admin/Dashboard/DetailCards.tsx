
import React from 'react';
import KycSummaryCard from './KycSummaryCard';
import TokenDistributionCard from './TokenDistributionCard';

interface DetailCardsProps {
  kycCounts: {
    pending: number;
    approved: number;
    rejected: number;
    not_started: number;
    needs_clarification: number;
  };
  pendingTokensCount: number;
  totalTransactionValue: number;
  isLoading: boolean;
}

const DetailCards: React.FC<DetailCardsProps> = ({
  kycCounts,
  pendingTokensCount,
  totalTransactionValue,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <KycSummaryCard kycCounts={kycCounts} isLoading={isLoading} />
      <TokenDistributionCard 
        pendingTokensCount={pendingTokensCount}
        totalTransactionValue={totalTransactionValue}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DetailCards;
