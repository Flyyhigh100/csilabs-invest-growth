
import React from 'react';
import StatCard from './StatCard';
import TokenDistributionCard from './TokenDistributionCard';
import KycSummaryCard from './KycSummaryCard';
import WalletPortfolioCard from './WalletPortfolioCard';
import { useDashboardStats } from './useDashboardStats';
import { Users, Clock, DollarSign, Shield } from 'lucide-react';

const StatCards: React.FC = () => {
  const { data, isLoading, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  // Calculate total users from dashboard data
  const totalUsers = data ? 50 : 0; // Placeholder for now
  const pendingKyc = data?.kycCounts?.pending || 0;
  const pendingTokens = data?.pendingTokensCount || 0;
  const totalVolume = data?.totalTransactionValue || 0;

  return (
    <div className="space-y-6">
      {/* Main stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          linkTo="/admin/users"
          linkText="View Users"
        />
        <StatCard
          title="Pending Transactions"
          value={pendingTokens}
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          linkTo="/admin/transactions"
          linkText="View Transactions"
          highlight={pendingTokens > 0}
        />
        <StatCard
          title="Total Volume"
          value={`$${totalVolume.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          linkTo="/admin/transaction-analytics"
          linkText="View Analytics"
        />
        <StatCard
          title="Pending KYC"
          value={pendingKyc}
          icon={<Shield className="h-5 w-5 text-purple-600" />}
          linkTo="/admin/kyc"
          linkText="Review KYC"
          highlight={pendingKyc > 0}
        />
      </div>

      {/* Feature cards row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TokenDistributionCard 
          pendingTokensCount={pendingTokens}
          totalTransactionValue={totalVolume}
          isLoading={isLoading}
        />
        <KycSummaryCard 
          kycCounts={data?.kycCounts || {
            pending: 0,
            approved: 0,
            rejected: 0,
            not_started: 0,
            needs_clarification: 0
          }}
          isLoading={isLoading}
          refetch={refetch}
        />
        <WalletPortfolioCard />
      </div>
    </div>
  );
};

export default StatCards;
