
import React, { useState } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';
import { Link } from 'react-router-dom';
import { useTransactionAnalytics } from '@/hooks/admin/useTransactionAnalytics';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';
import TestDataToggle from '@/components/Admin/TestDataToggle';

const VolumeDetails: React.FC = () => {
  const [timeRange, setTimeRange] = useState('all-time');
  const [groupBy, setGroupBy] = useState('day');
  const { includeTestData, setIncludeTestData } = useTestDataToggle();

  // Use the shared analytics hook with flexible date filtering
  const analyticsOptions = React.useMemo(() => {
    if (timeRange === 'all-time') {
      // Return empty options to use default (all-time since March 2025)
      return {};
    } else {
      return { timeRange: timeRange };
    }
  }, [timeRange]);

  const { data: analyticsData, isLoading, refetch } = useTransactionAnalytics(analyticsOptions);

  // Process the data for charting based on groupBy selection
  const processedData = React.useMemo(() => {
    if (!analyticsData?.transactions) return [];

    const groupedData = analyticsData.transactions.reduce((acc, tx) => {
      const date = new Date(tx.completed_at || tx.created_at);
      let key: string;
      
      switch (groupBy) {
        case 'week':
          key = format(startOfWeek(date), 'MMM dd');
          break;
        case 'month':
          key = format(startOfMonth(date), 'MMM yyyy');
          break;
        default: // day
          key = format(date, 'MMM dd');
      }
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          totalVolume: 0,
          transactionCount: 0,
          byPaymentMethod: {},
          byCurrency: {}
        };
      }
      
      const amount = Number(tx.amount);
      acc[key].totalVolume += amount;
      acc[key].transactionCount += 1;
      
      // Group by payment method
      if (!acc[key].byPaymentMethod[tx.payment_method]) {
        acc[key].byPaymentMethod[tx.payment_method] = 0;
      }
      acc[key].byPaymentMethod[tx.payment_method] += amount;
      
      // Group by currency
      const currency = tx.currency || 'USD';
      if (!acc[key].byCurrency[currency]) {
        acc[key].byCurrency[currency] = 0;
      }
      acc[key].byCurrency[currency] += amount;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort
    return Object.values(groupedData).sort((a: any, b: any) => 
      new Date(a.period).getTime() - new Date(b.period).getTime()
    );
  }, [analyticsData?.transactions, groupBy]);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'all-time':
        return 'since platform launch (March 2025)';
      case '7':
        return 'last 7 days';
      case '30':
        return 'last 30 days';
      case '90':
        return 'last 90 days';
      case '365':
        return 'last year';
      default:
        return timeRange;
    }
  };

  return (
    <AdminLayout title="Transaction Volume Details">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Transaction Volume Analysis
            </h1>
            <p className="text-muted-foreground">
              Comprehensive breakdown of transaction volume trends and patterns
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TestDataToggle 
              checked={includeTestData} 
              onCheckedChange={setIncludeTestData} 
            />
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground">
          <Link to="/admin" className="hover:text-primary">Dashboard</Link>
          <span className="mx-2">›</span>
          <span>Volume Details</span>
        </div>

        {/* Data info notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            <strong>📊 Data Range:</strong> Showing data {getTimeRangeLabel()}. 
            Test data: {includeTestData ? 'INCLUDED' : 'EXCLUDED'} • 
            Total transactions: {analyticsData?.totalTransactions || 0}
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-time">All Time (Since Launch)</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Group By</label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                ${analyticsData?.totalVolume.toLocaleString() || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Volume</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData?.totalTransactions || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">
                ${analyticsData?.averageTransactionSize.toLocaleString() || 0}
              </div>
              <p className="text-sm text-muted-foreground">Average Size</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">
                {processedData?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Active Periods</p>
            </CardContent>
          </Card>
        </div>

        {/* Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Volume Over Time</CardTitle>
            <CardDescription>Transaction volume grouped by {groupBy} - {getTimeRangeLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
            ) : processedData && processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Volume']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="totalVolume" fill="#3b82f6" name="Volume" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No volume data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Count Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Count Over Time</CardTitle>
            <CardDescription>Number of transactions grouped by {groupBy} - {getTimeRangeLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-80 animate-pulse bg-gray-200 rounded"></div>
            ) : processedData && processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [`${value}`, 'Transactions']}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="transactionCount" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Transaction Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No transaction data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Volume by Payment Method</CardTitle>
            <CardDescription>Breakdown of transaction volume by payment method - {getTimeRangeLabel()}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                ))}
              </div>
            ) : analyticsData?.paymentMethodBreakdown ? (
              <div className="space-y-4">
                {Object.entries(analyticsData.paymentMethodBreakdown).map(([method, data]: [string, any]) => (
                  <div key={method} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium capitalize">{method}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.count} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${data.volume.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {((data.volume / analyticsData.totalVolume) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No payment method data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default VolumeDetails;
