
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Download, RefreshCw, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const CompletedTransactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('30');

  const { data: transactions, isLoading, refetch } = useQuery({
    queryKey: ['completed-transactions', searchTerm, paymentMethodFilter, dateFilter],
    queryFn: async () => {
      console.log('🔄 Fetching completed transactions...');
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateFilter));
      
      let query = supabase
        .from('transactions')
        .select(`
          id,
          created_at,
          completed_at,
          amount,
          currency,
          payment_method,
          wallet_address,
          token_amount,
          token_price,
          blockchain_tx_id,
          external_transaction_id,
          user_id,
          profiles:user_id (first_name, last_name, email)
        `)
        .eq('status', 'completed')
        .gte('created_at', daysAgo.toISOString())
        .order('completed_at', { ascending: false });

      if (paymentMethodFilter !== 'all') {
        query = query.eq('payment_method', paymentMethodFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      // Filter by search term if provided
      let filteredData = data || [];
      if (searchTerm) {
        filteredData = filteredData.filter(tx => 
          tx.external_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.blockchain_tx_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      console.log('✅ Completed transactions fetched:', filteredData.length);
      return filteredData;
    },
    refetchInterval: 30000,
  });

  const totalValue = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
  const totalTokens = transactions?.reduce((sum, tx) => sum + Number(tx.token_amount || 0), 0) || 0;

  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) return;

    const headers = ['Date', 'Amount', 'Currency', 'Payment Method', 'Tokens', 'Wallet Address', 'Transaction ID', 'User Email'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(tx => [
        format(new Date(tx.completed_at || tx.created_at), 'yyyy-MM-dd HH:mm:ss'),
        tx.amount,
        tx.currency || 'USD',
        tx.payment_method,
        tx.token_amount || '0',
        tx.wallet_address,
        tx.external_transaction_id || tx.blockchain_tx_id || tx.id,
        tx.profiles?.email || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `completed-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Completed Transactions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              Completed Transactions
            </h1>
            <p className="text-muted-foreground">
              Detailed view of all successfully completed transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportToCSV} disabled={!transactions?.length}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          <Link to="/admin" className="hover:text-primary">Dashboard</Link>
          <span className="mx-2">›</span>
          <span>Completed Transactions</span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {transactions?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                {totalTokens.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Tokens Distributed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Transaction ID, wallet, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="coinpayments">CoinPayments</SelectItem>
                    <SelectItem value="direct_crypto">Direct Crypto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
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
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${transactions?.length || 0} completed transactions found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Payment Method</th>
                      <th className="text-left py-3 px-4">Tokens</th>
                      <th className="text-left py-3 px-4">Transaction ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {format(new Date(transaction.completed_at || transaction.created_at), 'MMM dd, yyyy')}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(transaction.completed_at || transaction.created_at), 'HH:mm:ss')}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {transaction.profiles?.first_name} {transaction.profiles?.last_name}
                            <div className="text-xs text-muted-foreground">
                              {transaction.profiles?.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            ${Number(transaction.amount).toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.currency || 'USD'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize">
                            {transaction.payment_method}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {Number(transaction.token_amount || 0).toLocaleString()}
                          </div>
                          {transaction.token_price && (
                            <div className="text-xs text-muted-foreground">
                              @ ${Number(transaction.token_price).toFixed(4)}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm font-mono">
                            {transaction.external_transaction_id || 
                             transaction.blockchain_tx_id || 
                             transaction.id.slice(0, 8)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed transactions found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CompletedTransactions;
