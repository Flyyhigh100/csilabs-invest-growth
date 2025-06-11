
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Coins, Send, Clock, Network, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import TokenDistributionCharts from './Charts/TokenDistributionCharts';

const TokenDistributionReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  const { data: tokenData, isLoading, refetch } = useQuery({
    queryKey: ['token-distribution-reports', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch transactions
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_test', false)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate token distribution metrics
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const pendingDistribution = transactions.filter(t => 
        t.status === 'completed' && !t.token_sent
      ).length;

      const totalTokensDistributed = completedTransactions
        .filter(t => t.token_sent)
        .reduce((sum, t) => sum + Number(t.token_amount || 0), 0);

      // Distribution by network
      const networkDistribution = transactions.reduce((acc, t) => {
        const network = t.crypto_network || 'Unknown';
        if (!acc[network]) acc[network] = { amount: 0, count: 0 };
        if (t.token_sent) {
          acc[network].amount += Number(t.token_amount || 0);
        }
        acc[network].count++;
        return acc;
      }, {} as Record<string, { amount: number; count: number }>);

      const distributionByNetwork = Object.entries(networkDistribution).map(([network, data]) => ({
        network,
        ...data
      }));

      // Monthly distribution trend
      const monthlyDistribution = completedTransactions.reduce((acc, t) => {
        const month = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[month]) acc[month] = { tokens: 0, value: 0 };
        if (t.token_sent) {
          acc[month].tokens += Number(t.token_amount || 0);
          acc[month].value += Number(t.amount);
        }
        return acc;
      }, {} as Record<string, { tokens: number; value: number }>);

      // Distribution status
      const distributionStatus = [
        { status: 'Distributed', count: transactions.filter(t => t.token_sent).length, percentage: 0 },
        { status: 'Pending', count: pendingDistribution, percentage: 0 },
        { status: 'Processing', count: transactions.filter(t => t.status === 'processing').length, percentage: 0 },
        { status: 'Failed', count: transactions.filter(t => t.status === 'failed').length, percentage: 0 }
      ];

      const totalDistributions = distributionStatus.reduce((sum, status) => sum + status.count, 0);
      distributionStatus.forEach(status => {
        status.percentage = totalDistributions > 0 ? (status.count / totalDistributions) * 100 : 0;
      });

      const averageTokensPerUser = completedTransactions.length > 0 
        ? totalTokensDistributed / completedTransactions.length 
        : 0;

      return {
        totalTokensDistributed,
        pendingDistribution,
        distributionByNetwork,
        monthlyDistribution: Object.entries(monthlyDistribution).map(([month, data]) => ({
          month,
          ...data
        })),
        distributionStatus: distributionStatus.filter(status => status.count > 0),
        averageTokensPerUser
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const exportTokenReport = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch transactions with user details
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_test', false)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!transactions) {
        toast.error('No data to export');
        return;
      }

      // Fetch user profiles
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, wallet_address')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Create CSV content
      const headers = [
        'Date',
        'Transaction ID',
        'User Name',
        'User Email',
        'Wallet Address',
        'Token Amount',
        'USD Value',
        'Network',
        'Token Sent',
        'Blockchain TX ID',
        'Status'
      ];

      const csvRows = transactions.map(tx => {
        const profile = profileMap.get(tx.user_id);
        return [
          new Date(tx.created_at).toLocaleDateString(),
          tx.transaction_id,
          profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'N/A',
          profile?.email || 'N/A',
          profile?.wallet_address || tx.wallet_address || 'N/A',
          Number(tx.token_amount || 0).toFixed(2),
          Number(tx.amount).toFixed(2),
          tx.crypto_network || 'N/A',
          tx.token_sent ? 'Yes' : 'No',
          tx.blockchain_tx_id || 'N/A',
          tx.status
        ];
      });

      const csvContent = [headers, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `token-distribution-report-${timeRange}days-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Token distribution report exported successfully');
    } catch (error) {
      console.error('Error exporting token report:', error);
      toast.error('Failed to export token report');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <Button onClick={exportTokenReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Token Distribution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-blue-600" />
              Total Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tokenData?.totalTokensDistributed?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens sent to users
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tokenData?.pendingDistribution || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting token distribution
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Send className="h-4 w-4 text-green-600" />
              Average per User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tokenData?.averageTokensPerUser?.toFixed(2) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens per user
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-600" />
              Networks Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tokenData?.distributionByNetwork?.length || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Different networks used
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      {tokenData && <TokenDistributionCharts tokenData={tokenData} />}

      {/* Network Distribution Details */}
      <Card>
        <CardHeader>
          <CardTitle>Network Distribution Details</CardTitle>
          <CardDescription>Token distribution breakdown by blockchain network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tokenData?.distributionByNetwork?.map((network, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <span className="font-medium">{network.network}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {network.count} transactions
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{network.amount.toLocaleString()} tokens</div>
                  <div className="text-sm text-muted-foreground">
                    {network.count > 0 ? (network.amount / network.count).toFixed(2) : '0'} avg/tx
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenDistributionReports;
