import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const FinancialReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-reports', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_test', false)
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate financial metrics
      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const pendingTransactions = transactions.filter(t => t.status === 'pending' || t.status === 'processing');
      const failedTransactions = transactions.filter(t => t.status === 'failed' || t.status === 'cancelled');

      const totalRevenue = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const pendingRevenue = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Payment method breakdown
      const paymentMethods = transactions.reduce((acc, t) => {
        const method = t.payment_method || 'Unknown';
        if (!acc[method]) acc[method] = { count: 0, amount: 0 };
        acc[method].count++;
        acc[method].amount += Number(t.amount);
        return acc;
      }, {} as Record<string, { count: number; amount: number }>);

      // Daily revenue trend
      const dailyRevenue = completedTransactions.reduce((acc, t) => {
        const date = new Date(t.created_at).toDateString();
        if (!acc[date]) acc[date] = 0;
        acc[date] += Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalRevenue,
        pendingRevenue,
        completedCount: completedTransactions.length,
        pendingCount: pendingTransactions.length,
        failedCount: failedTransactions.length,
        paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
          method,
          ...data
        })),
        dailyRevenue: Object.entries(dailyRevenue).map(([date, amount]) => ({
          date,
          amount
        })),
        averageTransactionValue: completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0
      };
    }
  });

  const exportFinancialReport = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch transactions
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

      // Fetch user profiles for the users in transactions
      const userIds = [...new Set(transactions.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      // Create a map for quick profile lookup
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Create CSV content
      const headers = [
        'Date',
        'Transaction ID',
        'User Name',
        'User Email',
        'Amount (USD)',
        'Payment Method',
        'Status',
        'Token Sent',
        'Blockchain TX ID'
      ];

      const csvRows = transactions.map(tx => {
        const profile = profileMap.get(tx.user_id);
        return [
          new Date(tx.created_at).toLocaleDateString(),
          tx.transaction_id,
          profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'N/A',
          profile?.email || 'N/A',
          Number(tx.amount).toFixed(2),
          tx.payment_method,
          tx.status,
          tx.token_sent ? 'Yes' : 'No',
          tx.blockchain_tx_id || 'N/A'
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
      link.download = `financial-report-${timeRange}days-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Financial report exported successfully');
    } catch (error) {
      console.error('Error exporting financial report:', error);
      toast.error('Failed to export financial report');
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
        <Button onClick={exportFinancialReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${financialData?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData?.completedCount || 0} completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${financialData?.pendingRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {financialData?.pendingCount || 0} pending transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${financialData?.averageTransactionValue?.toFixed(2) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {financialData?.failedCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires follow-up
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Breakdown</CardTitle>
          <CardDescription>Revenue and transaction count by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {financialData?.paymentMethods?.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{method.method}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {method.count} transactions
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-bold">${method.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(method.amount / method.count).toFixed(2)} avg
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

export default FinancialReports;
