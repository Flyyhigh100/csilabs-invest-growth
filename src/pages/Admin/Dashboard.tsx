
import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, Receipt, Circle, AlertCircle, Users, Activity, TrendingUp } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';
import TestDataToggle from '@/components/Admin/TestDataToggle';
import { format, startOfMonth, subMonths } from 'date-fns';
import { useTransactionAnalytics } from '@/hooks/admin/useTransactionAnalytics';
import { useUserGrowthData } from '@/hooks/admin/useUserGrowthData';
import { useTransactionVolumeData } from '@/hooks/admin/useTransactionVolumeData';
import RecentMessagesWidget from '@/components/Admin/Communications/RecentMessagesWidget';

const AdminDashboard: React.FC = () => {
  const { includeTestData, setIncludeTestData } = useTestDataToggle();
  
  // Get all-time analytics (since platform launch)
  const { data: allTimeAnalytics, isLoading: allTimeLoading } = useTransactionAnalytics({});
  
  // Get recent analytics (last 30 days)
  const { data: recentAnalytics, isLoading: recentLoading } = useTransactionAnalytics({
    timeRange: '30'
  });
  
  // Get real user growth data
  const { data: userGrowthData, isLoading: userGrowthLoading } = useUserGrowthData();
  
  // Get real transaction volume data
  const { data: volumeData, isLoading: volumeLoading } = useTransactionVolumeData();
  
  // Fetch summary data with consistent filtering
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['admin-dashboard-summary', includeTestData],
    queryFn: async () => {
      try {
        console.log('Fetching admin dashboard summary with includeTestData:', includeTestData);
        
        // Get user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Get KYC stats with test data filtering
        let kycQuery = supabase.from('kyc_verifications').select('status');
        if (!includeTestData) {
          kycQuery = kycQuery.eq('is_test', false);
        }
        
        const { data: kycData, error: kycError } = await kycQuery;
        if (kycError) throw kycError;
        
        // Get pending token transfers with test data filtering
        let pendingTokensQuery = supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .eq('token_sent', false);
          
        if (!includeTestData) {
          pendingTokensQuery = pendingTokensQuery.eq('is_test', false);
        }
        
        const { count: pendingTokensCount, error: pendingTokensError } = await pendingTokensQuery;
        if (pendingTokensError) throw pendingTokensError;
        
        // Calculate stats
        const pendingKyc = kycData?.filter(k => k.status === 'pending').length || 0;
        
        console.log(`Dashboard summary: ${userCount} users, pending KYC: ${pendingKyc}`);
        
        return {
          userCount: userCount || 0,
          pendingKyc,
          pendingTokensCount: pendingTokensCount || 0
        };
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        throw error;
      }
    },
    staleTime: 60000
  });
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Chart config
  const chartConfig = {
    users: {
      label: "Users",
      theme: {
        light: "#3b82f6",
        dark: "#60a5fa",
      },
    },
    volume: {
      label: "Volume",
      theme: {
        light: "#10b981",
        dark: "#34d399",
      },
    }
  };
  
  return (
    <AdminLayout title="Dashboard">
      {/* Test data toggle */}
      <div className="flex justify-end mb-4">
        <TestDataToggle 
          checked={includeTestData} 
          onCheckedChange={setIncludeTestData} 
          showAlert={includeTestData} 
        />
      </div>
      
      {/* All-Time Metrics Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">All-Time Platform Metrics</h2>
          <span className="text-sm text-muted-foreground">(Since March 2025)</span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/transactions/completed" className="block">
            <Card className="transition-all hover:shadow-md hover:border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Total Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-green-800">
                    {allTimeLoading ? '—' : allTimeAnalytics?.totalTransactions || 0}
                  </span>
                </div>
                <p className="text-xs text-green-600 mt-1">All completed transactions</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/transactions/volume-details" className="block">
            <Card className="transition-all hover:shadow-md hover:border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-blue-800">
                    {allTimeLoading ? '—' : formatCurrency(allTimeAnalytics?.totalVolume || 0)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">Total platform revenue</p>
              </CardContent>
            </Card>
          </Link>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Average Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-2xl font-bold text-purple-800">
                  {allTimeLoading ? '—' : formatCurrency(allTimeAnalytics?.averageTransactionSize || 0)}
                </span>
              </div>
              <p className="text-xs text-purple-600 mt-1">Per transaction average</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Best Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-amber-600 mr-2" />
                <span className="text-2xl font-bold text-amber-800">
                  {allTimeLoading ? '—' : allTimeAnalytics?.bestDay || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                {allTimeLoading ? '—' : formatCurrency(allTimeAnalytics?.bestDayVolume || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Metrics Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <span className="text-sm text-muted-foreground">(Last 30 days)</span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/admin/users" className="block">
            <Card className="transition-all hover:shadow-md hover:border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{isLoading ? '—' : summaryData?.userCount}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/admin/kyc" className="block">
            <Card className="transition-all hover:shadow-md hover:border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-yellow-500 mr-2" />
                  <span className="text-2xl font-bold">{isLoading ? '—' : summaryData?.pendingKyc}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Receipt className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">
                  {recentLoading ? '—' : recentAnalytics?.totalTransactions || 0}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recent Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">
                  {recentLoading ? '—' : formatCurrency(recentAnalytics?.totalVolume || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pending Token Distribution Card */}
      <div className="mb-6">
        <Link to="/admin/transactions?status=pending_tokens">
          <Card className="transition-all hover:shadow-md bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center mr-4">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-amber-900">Pending Token Distribution</h3>
                  <p className="text-amber-700">Transactions requiring manual token distribution</p>
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-700">{isLoading ? '—' : summaryData?.pendingTokensCount}</div>
                <div className="text-xs text-amber-600">transactions</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
      
      {/* Quick actions */}
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/kyc">
              <UserCheck className="mr-1.5 h-4 w-4" />
              Review KYC
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/transactions">
              <Receipt className="mr-1.5 h-4 w-4" />
              Manage Transactions
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/users">
              <Users className="mr-1.5 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/analytics">
              <Activity className="mr-1.5 h-4 w-4" />
              Transaction Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Recent Messages Widget */}
      <div className="mb-6">
        <RecentMessagesWidget />
      </div>
      
      {/* Status Notice */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700 text-sm">
          <strong>📊 Analytics Note:</strong> All-time metrics show data since platform launch (March 2025). 
          Recent metrics show last 30 days. Test data toggle: {includeTestData ? 'ON' : 'OFF'}
        </p>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registrations (chronological)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            {userGrowthLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading user growth data...</div>
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData || []}>
                    <XAxis 
                      dataKey="period" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        name === 'cumulative' ? `${value} total users` : `${value} new users`,
                        name === 'cumulative' ? 'Total Users' : 'New Users'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="cumulative" 
                      activeDot={{ r: 6 }} 
                      stroke="var(--color-users)" 
                      strokeWidth={2}
                      name="Total Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      activeDot={{ r: 4 }} 
                      stroke="hsl(var(--primary) / 0.6)" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="New Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Monthly transaction volume (chronological)</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            {volumeLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading volume data...</div>
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData || []}>
                    <XAxis 
                      dataKey="period" 
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        name === 'volume' ? formatCurrency(Number(value)) : value,
                        name === 'volume' ? 'Volume' : 'Transactions'
                      ]}
                    />
                    <Legend />
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-volume)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-volume)" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="var(--color-volume)"
                      fillOpacity={1}
                      fill="url(#colorVolume)"
                      name="Volume"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
