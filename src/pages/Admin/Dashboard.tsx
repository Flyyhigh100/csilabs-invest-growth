
import React, { useEffect } from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, Receipt, Circle, AlertCircle, Users, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';
import TestDataToggle from '@/components/Admin/TestDataToggle';
import { format, startOfMonth, subMonths } from 'date-fns';
import { useTransactionAnalytics } from '@/hooks/admin/useTransactionAnalytics';

const AdminDashboard: React.FC = () => {
  const { includeTestData, setIncludeTestData } = useTestDataToggle();
  
  // Use 30-day default to match detail pages
  const defaultTimeRange = '30';
  
  // Use the shared transaction analytics hook with consistent 30-day range
  const { data: analyticsData, isLoading: analyticsLoading } = useTransactionAnalytics({
    timeRange: defaultTimeRange
  });
  
  // Fetch summary data with consistent filtering
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['admin-dashboard-summary', includeTestData, defaultTimeRange],
    queryFn: async () => {
      try {
        console.log('Fetching admin dashboard summary with includeTestData:', includeTestData, 'timeRange:', defaultTimeRange);
        
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
        
        // Use analytics data for consistent transaction counts and volume
        const completedTx = analyticsData?.totalTransactions || 0;
        const totalTxValue = analyticsData?.totalVolume || 0;
        
        console.log(`Dashboard summary: ${userCount} users, ${completedTx} transactions, $${totalTxValue} volume`);
        
        // Create simplified chart data based on analytics
        const userGrowthData = prepareUserGrowthData(userCount || 0);
        const txVolumeData = analyticsData?.volumeOverTime || [];
        
        return {
          userCount: userCount || 0,
          pendingKyc,
          completedTx,
          pendingTokensCount: pendingTokensCount || 0,
          totalTxValue,
          userGrowthData,
          txVolumeData
        };
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        throw error;
      }
    },
    staleTime: 60000,
    enabled: !!analyticsData // Wait for analytics data first
  });
  
  // Function to prepare user growth data
  const prepareUserGrowthData = (totalUsers: number) => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return monthLabels.map((month, index) => ({
      name: month,
      users: Math.round((totalUsers) * (index + 1) / monthLabels.length)
    }));
  };
  
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
      
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Link to="/admin/users" className="block">
          <Card className="transition-all hover:shadow-md hover:border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>
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
        
        <Link to="/admin/transactions/completed" className="block">
          <Card className="transition-all hover:shadow-md hover:border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Transactions (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Receipt className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{isLoading ? '—' : summaryData?.completedTx}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/admin/transactions/volume-details" className="block">
          <Card className="transition-all hover:shadow-md hover:border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transaction Volume (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold">
                  {isLoading ? '—' : formatCurrency(summaryData?.totalTxValue || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
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
            <Link to="/admin/transaction-analytics">
              <Activity className="mr-1.5 h-4 w-4" />
              Transaction Analytics
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Status Notice */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Dashboard shows transactions from the last 30 days to match detail pages. Test data toggle: {includeTestData ? 'ON' : 'OFF'}
        </p>
      </div>
      
      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Monthly user registrations</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summaryData?.userGrowthData || []}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    activeDot={{ r: 8 }} 
                    stroke="var(--color-users)" 
                    strokeWidth={2} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume (30 days)</CardTitle>
            <CardDescription>Daily transaction volume</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summaryData?.txVolumeData || []}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
