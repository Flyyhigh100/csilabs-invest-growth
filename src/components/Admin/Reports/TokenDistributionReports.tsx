import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TokenDistributionReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  const { data: distributionData, isLoading } = useQuery({
    queryKey: ['token-distribution-reports', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_test', false)
        .eq('status', 'completed')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for wallet address information
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, wallet_address, solana_wallet_address, preferred_network')
        .in('id', userIds);

      // Create profile map for quick lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Add profile data to transactions
      const enrichedTransactions = transactions.map(t => ({
        ...t,
        profile: profileMap.get(t.user_id)
      }));

      // Calculate distribution metrics
      const distributedTransactions = enrichedTransactions.filter(t => t.token_sent);
      const pendingDistributions = enrichedTransactions.filter(t => !t.token_sent);

      const totalTokensDistributed = distributedTransactions.reduce((sum, t) => 
        sum + (Number(t.token_amount) || 0), 0
      );

      const pendingTokensValue = pendingDistributions.reduce((sum, t) => 
        sum + Number(t.amount), 0
      );

      // Network breakdown
      const networkStats = enrichedTransactions.reduce((acc, t) => {
        const network = t.crypto_network || 
          (t.profile?.wallet_address?.startsWith('0x') ? 'polygon' : 
           t.profile?.solana_wallet_address ? 'solana' : 'unknown');
        
        if (!acc[network]) acc[network] = { 
          total: 0, 
          distributed: 0, 
          pending: 0,
          totalValue: 0,
          distributedValue: 0,
          pendingValue: 0
        };
        
        acc[network].total++;
        acc[network].totalValue += Number(t.amount);
        
        if (t.token_sent) {
          acc[network].distributed++;
          acc[network].distributedValue += Number(t.amount);
        } else {
          acc[network].pending++;
          acc[network].pendingValue += Number(t.amount);
        }
        
        return acc;
      }, {} as Record<string, any>);

      // Token price impact analysis
      const priceImpactTransactions = enrichedTransactions.filter(t => t.token_price && t.token_amount);
      const averageTokenPrice = priceImpactTransactions.length > 0 ? 
        priceImpactTransactions.reduce((sum, t) => sum + Number(t.token_price), 0) / priceImpactTransactions.length : 0;

      return {
        totalTransactions: enrichedTransactions.length,
        distributedCount: distributedTransactions.length,
        pendingCount: pendingDistributions.length,
        totalTokensDistributed,
        pendingTokensValue,
        averageTokenPrice,
        networkStats: Object.entries(networkStats).map(([network, stats]) => ({
          network,
          ...stats
        })),
        transactions: enrichedTransactions.slice(0, 50) // Recent 50 for the table
      };
    }
  });

  const exportDistributionReport = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_test', false)
        .eq('status', 'completed')
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
        .select('id, first_name, last_name, email, wallet_address, solana_wallet_address')
        .in('id', userIds);

      // Create profile map
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Create CSV content
      const headers = [
        'Date',
        'User Name',
        'User Email',
        'Purchase Amount (USD)',
        'Token Amount',
        'Token Price',
        'Network',
        'Wallet Address',
        'Token Sent',
        'Blockchain TX ID',
        'Distribution Status'
      ];

      const csvRows = transactions.map(tx => {
        const profile = profileMap.get(tx.user_id);
        return [
          new Date(tx.created_at).toLocaleDateString(),
          profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'N/A',
          profile?.email || 'N/A',
          Number(tx.amount).toFixed(2),
          tx.token_amount ? Number(tx.token_amount).toFixed(6) : 'TBD',
          tx.token_price ? Number(tx.token_price).toFixed(6) : 'N/A',
          tx.crypto_network || 'Auto-detected',
          profile?.wallet_address || profile?.solana_wallet_address || 'N/A',
          tx.token_sent ? 'Yes' : 'No',
          tx.blockchain_tx_id || 'Pending',
          tx.token_sent ? 'Completed' : 'Pending Distribution'
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
      console.error('Error exporting distribution report:', error);
      toast.error('Failed to export distribution report');
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
        </div>
        <Button onClick={exportDistributionReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Distribution Report
        </Button>
      </div>

      {/* Distribution Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-green-600" />
              Tokens Distributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {distributionData?.totalTokensDistributed?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {distributionData?.distributedCount || 0} distributions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              Pending Distributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {distributionData?.pendingCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              ${distributionData?.pendingTokensValue?.toLocaleString() || '0'} value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Token Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${distributionData?.averageTokenPrice?.toFixed(6) || '0.000000'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per token distributed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {distributionData?.totalTransactions ? 
                ((distributionData.distributedCount / distributionData.totalTransactions) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Network Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution by Network</CardTitle>
          <CardDescription>Token distribution breakdown by blockchain network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distributionData?.networkStats?.map((network, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={network.network === 'solana' ? 'default' : 'secondary'}>
                      {network.network === 'solana' ? 'Solana' : 
                       network.network === 'polygon' ? 'Polygon' : 
                       network.network.charAt(0).toUpperCase() + network.network.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {network.total} total transactions
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      ${network.totalValue?.toLocaleString()} total value
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distributed:</span>
                      <span className="font-medium text-green-600">
                        {network.distributed} (${network.distributedValue?.toLocaleString()})
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending:</span>
                      <span className="font-medium text-yellow-600">
                        {network.pending} (${network.pendingValue?.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(network.distributed / network.total) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {((network.distributed / network.total) * 100).toFixed(1)}% completion rate
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
