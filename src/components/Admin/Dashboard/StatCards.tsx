
import React from 'react';
import StatCard from './StatCard';
import TokenDistributionCard from './TokenDistributionCard';
import KycSummaryCard from './KycSummaryCard';
import WalletPortfolioCard from './WalletPortfolioCard';
import { useDashboardStats } from './useDashboardStats';

const StatCards: React.FC = () => {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toString() || '0'}
          description="Registered users"
          trend="up"
          icon="users"
        />
        <StatCard
          title="Pending Transactions"
          value={stats?.pendingTransactions?.toString() || '0'}
          description="Awaiting distribution"
          trend="neutral"
          icon="clock"
        />
        <StatCard
          title="Total Volume"
          value={`$${stats?.totalVolume?.toLocaleString() || '0'}`}
          description="All-time transactions"
          trend="up"
          icon="dollar"
        />
        <StatCard
          title="Pending KYC"
          value={stats?.pendingKyc?.toString() || '0'}
          description="Awaiting review"
          trend="neutral"
          icon="shield"
        />
      </div>

      {/* Feature cards row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <TokenDistributionCard />
        <KycSummaryCard />
        <WalletPortfolioCard />
      </div>
    </div>
  );
};

export default StatCards;
