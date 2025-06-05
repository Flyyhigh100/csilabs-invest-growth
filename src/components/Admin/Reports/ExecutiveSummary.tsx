
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';

const ExecutiveSummary: React.FC = () => {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['executive-summary'],
    queryFn: async () => {
      const [transactionsResult, usersResult, kycResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount, status, token_sent, created_at')
          .eq('is_test', false),
        supabase
          .from('profiles')
          .select('wallet_address, solana_wallet_address, created_at'),
        supabase
          .from('kyc_verifications')
          .select('status, created_at')
          .eq('is_test', false)
      ]);

      const transactions = transactionsResult.data || [];
      const users = usersResult.data || [];
      const kycVerifications = kycResult.data || [];

      // Calculate metrics
      const totalRevenue = transactions
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const pendingDistributions = transactions
        .filter(t => t.status === 'completed' && !t.token_sent)
        .length;

      const usersWithoutWallets = users
        .filter(u => !u.wallet_address && !u.solana_wallet_address)
        .length;

      const pendingKyc = kycVerifications
        .filter(k => k.status === 'pending')
        .length;

      // Calculate 30-day metrics
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRevenue = transactions
        .filter(t => t.status === 'completed' && new Date(t.created_at) > thirtyDaysAgo)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const newUsers = users
        .filter(u => new Date(u.created_at) > thirtyDaysAgo)
        .length;

      return {
        totalRevenue,
        recentRevenue,
        newUsers,
        pendingDistributions,
        usersWithoutWallets,
        pendingKyc,
        totalUsers: users.length,
        totalTransactions: transactions.length
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 bg-muted animate-pulse rounded mb-1" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const summaryCards = [
    {
      title: "Total Revenue",
      value: `$${summary?.totalRevenue?.toLocaleString() || '0'}`,
      description: `+$${summary?.recentRevenue?.toLocaleString() || '0'} last 30 days`,
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Total Users",
      value: summary?.totalUsers?.toLocaleString() || '0',
      description: `+${summary?.newUsers || '0'} new users last 30 days`,
      icon: Users,
      trend: "up"
    },
    {
      title: "Pending Distributions",
      value: summary?.pendingDistributions?.toLocaleString() || '0',
      description: "Tokens ready for distribution",
      icon: TrendingUp,
      trend: summary?.pendingDistributions ? "warning" : "neutral"
    },
    {
      title: "Users Need Follow-up",
      value: (summary?.usersWithoutWallets || 0) + (summary?.pendingKyc || 0),
      description: `${summary?.usersWithoutWallets || 0} missing wallets, ${summary?.pendingKyc || 0} pending KYC`,
      icon: AlertTriangle,
      trend: "warning"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${
              card.trend === 'up' ? 'text-green-600' : 
              card.trend === 'warning' ? 'text-yellow-600' : 
              'text-muted-foreground'
            }`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExecutiveSummary;
