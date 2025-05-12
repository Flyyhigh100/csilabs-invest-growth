
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserCheck, Receipt, Circle, AlertCircle, Users, Activity } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const AdminDashboard: React.FC = () => {
  // Fetch summary data
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['admin-dashboard-summary'],
    queryFn: async () => {
      try {
        // Fetch user count
        const { count: userCount, error: userError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (userError) throw userError;
        
        // Fetch KYC stats
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_verifications')
          .select('status');
        
        if (kycError) throw kycError;
        
        // Fetch transaction stats
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('status, amount');
        
        if (txError) throw txError;
        
        // Calculate stats
        const pendingKyc = kycData?.filter(k => k.status === 'pending').length || 0;
        const completedTx = txData?.filter(tx => tx.status === 'completed').length || 0;
        const totalTxValue = txData?.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0) || 0;
        
        // Mock data for charts (in a real app, this would be calculated from real data)
        const userGrowthData = [
          { name: 'Jan', users: Math.round((userCount || 0) * 0.3) },
          { name: 'Feb', users: Math.round((userCount || 0) * 0.4) },
          { name: 'Mar', users: Math.round((userCount || 0) * 0.5) },
          { name: 'Apr', users: Math.round((userCount || 0) * 0.6) },
          { name: 'May', users: Math.round((userCount || 0) * 0.8) },
          { name: 'Jun', users: userCount || 0 }
        ];
        
        const txVolumeData = [
          { name: 'Jan', volume: Math.round(totalTxValue * 0.2) },
          { name: 'Feb', volume: Math.round(totalTxValue * 0.3) },
          { name: 'Mar', volume: Math.round(totalTxValue * 0.4) },
          { name: 'Apr', volume: Math.round(totalTxValue * 0.6) },
          { name: 'May', volume: Math.round(totalTxValue * 0.8) },
          { name: 'Jun', volume: totalTxValue }
        ];
        
        return {
          userCount: userCount || 0,
          pendingKyc,
          completedTx,
          totalTxValue,
          userGrowthData,
          txVolumeData
        };
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        throw error;
      }
    },
    staleTime: 60000 // Consider data fresh for 1 minute
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
      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
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
        
        <Card>
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
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Receipt className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{isLoading ? '—' : summaryData?.completedTx}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transaction Volume</CardTitle>
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
        </div>
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
            <CardTitle>Transaction Volume</CardTitle>
            <CardDescription>Monthly transaction volume</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 h-80">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summaryData?.txVolumeData || []}>
                  <XAxis dataKey="name" />
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
