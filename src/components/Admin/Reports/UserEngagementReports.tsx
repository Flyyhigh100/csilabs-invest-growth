
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Download, Users, UserCheck, UserX, Clock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import UserEngagementCharts from './Charts/UserEngagementCharts';

const UserEngagementReports: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  const { data: userData, isLoading, refetch } = useQuery({
    queryKey: ['user-engagement-reports', timeRange],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch KYC verifications
      const { data: kycVerifications, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('is_test', false);

      if (kycError) throw kycError;

      // Calculate metrics
      const totalUsers = profiles.length;
      const newUsersThisMonth = profiles.filter(p => {
        const createdDate = new Date(p.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdDate >= thirtyDaysAgo;
      }).length;

      // Active users (those with transactions in the period)
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('user_id')
        .gte('created_at', daysAgo.toISOString());

      const activeUserIds = new Set(recentTransactions?.map(t => t.user_id) || []);
      const activeUsers = activeUserIds.size;

      // KYC status breakdown
      const kycStatusCounts = kycVerifications.reduce((acc, kyc) => {
        acc[kyc.status] = (acc[kyc.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const kycStatusBreakdown = Object.entries(kycStatusCounts).map(([status, count]) => ({
        status: status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count
      }));

      const totalKycSubmissions = kycVerifications.length;
      const approvedKyc = kycVerifications.filter(kyc => kyc.status === 'approved').length;
      const kycCompletionRate = totalKycSubmissions > 0 ? Math.round((approvedKyc / totalKycSubmissions) * 100) : 0;

      // Daily registrations
      const dailyRegistrations = profiles.reduce((acc, profile) => {
        const date = new Date(profile.created_at).toDateString();
        if (!acc[date]) acc[date] = 0;
        acc[date]++;
        return acc;
      }, {} as Record<string, number>);

      // User activity trend (mock data for now)
      const userActivityTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          active: Math.floor(Math.random() * 50) + 10,
          new: Math.floor(Math.random() * 10) + 1
        };
      }).reverse();

      return {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        kycCompletionRate,
        dailyRegistrations: Object.entries(dailyRegistrations).map(([date, count]) => ({
          date,
          count
        })),
        kycStatusBreakdown,
        userActivityTrend
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const exportUserReport = async () => {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch detailed user data
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', daysAgo.toISOString())
        .order('created_at', { ascending: false });

      const { data: kycVerifications } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('is_test', false);

      if (!profiles) {
        toast.error('No data to export');
        return;
      }

      // Create KYC lookup map
      const kycMap = new Map(kycVerifications?.map(kyc => [kyc.user_id, kyc]) || []);

      // Create CSV content
      const headers = [
        'User ID',
        'Name',
        'Email',
        'Registration Date',
        'KYC Status',
        'Phone Number',
        'Wallet Address',
        'City',
        'State/Province'
      ];

      const csvRows = profiles.map(profile => {
        const kyc = kycMap.get(profile.id);
        return [
          profile.id,
          `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
          profile.email || 'N/A',
          new Date(profile.created_at).toLocaleDateString(),
          kyc?.status || 'Not Started',
          profile.phone_number || 'N/A',
          profile.wallet_address || 'N/A',
          profile.city || 'N/A',
          profile.state_province || 'N/A'
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
      link.download = `user-engagement-report-${timeRange}days-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('User engagement report exported successfully');
    } catch (error) {
      console.error('Error exporting user report:', error);
      toast.error('Failed to export user report');
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
        <Button onClick={exportUserReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* User Engagement Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {userData?.totalUsers?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              New Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {userData?.newUsersThisMonth || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {userData?.activeUsers || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              With recent activity
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="h-4 w-4 text-orange-600" />
              KYC Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {userData?.kycCompletionRate || '0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Verification rate
            </p>
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8" />
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      {userData && <UserEngagementCharts userData={userData} />}

      {/* User Engagement Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>KYC Status Breakdown</CardTitle>
            <CardDescription>User verification status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userData?.kycStatusBreakdown?.map((status, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="font-medium">{status.status}</span>
                  <div className="text-right">
                    <div className="font-bold">{status.count}</div>
                    <div className="text-sm text-muted-foreground">
                      {userData.totalUsers > 0 ? 
                        `${((status.count / userData.totalUsers) * 100).toFixed(1)}%` : 
                        '0%'
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth Insights</CardTitle>
            <CardDescription>Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Average daily registrations</span>
                <span className="font-bold">
                  {userData?.dailyRegistrations ? 
                    (userData.dailyRegistrations.reduce((sum, day) => sum + day.count, 0) / userData.dailyRegistrations.length).toFixed(1) :
                    '0'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">User activation rate</span>
                <span className="font-bold">
                  {userData?.totalUsers && userData?.activeUsers ? 
                    `${((userData.activeUsers / userData.totalUsers) * 100).toFixed(1)}%` :
                    '0%'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Growth rate (monthly)</span>
                <span className="font-bold text-green-600">
                  {userData?.newUsersThisMonth && userData?.totalUsers ?
                    `+${((userData.newUsersThisMonth / userData.totalUsers) * 100).toFixed(1)}%` :
                    '0%'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserEngagementReports;
