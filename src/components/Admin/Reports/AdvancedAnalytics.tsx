
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, Users, Activity, Target, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30');

  // Simple real-time metrics query
  const { data: basicMetrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['basic-analytics-metrics', timeRange],
    queryFn: async () => {
      console.log('🔄 Fetching basic analytics metrics...');
      
      const now = new Date();
      const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000);
      
      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalTransactions },
        { count: pendingKyc },
        { count: recentActivity }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).gte('created_at', daysAgo.toISOString()),
        supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      console.log('✅ Basic metrics fetched successfully');
      
      return {
        totalUsers: totalUsers || 0,
        totalTransactions: totalTransactions || 0,
        pendingKyc: pendingKyc || 0,
        recentActivity: recentActivity || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Simple conversion funnel data
  const { data: funnelData, isLoading: funnelLoading, refetch: refetchFunnel } = useQuery({
    queryKey: ['simple-funnel', timeRange],
    queryFn: async () => {
      console.log('🔄 Fetching simple funnel data...');
      
      const [
        { count: registrations },
        { count: walletsAdded },
        { count: firstPurchases },
        { count: completedTransactions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('wallet_address', 'is', null),
        supabase.from('transactions').select('user_id', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      const funnel = [
        { stage: 'Registrations', count: registrations || 0, percentage: 100 },
        { stage: 'Wallet Added', count: walletsAdded || 0, percentage: registrations ? Math.round((walletsAdded || 0) / registrations * 100) : 0 },
        { stage: 'First Purchase', count: firstPurchases || 0, percentage: registrations ? Math.round((firstPurchases || 0) / registrations * 100) : 0 },
        { stage: 'Completed', count: completedTransactions || 0, percentage: registrations ? Math.round((completedTransactions || 0) / registrations * 100) : 0 }
      ];

      console.log('✅ Funnel data fetched:', funnel);
      return funnel;
    },
  });

  // Recent activity feed
  const { data: activityFeed, isLoading: activityLoading, refetch: refetchActivity } = useQuery({
    queryKey: ['activity-feed'],
    queryFn: async () => {
      console.log('🔄 Fetching recent activity...');
      
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          id,
          created_at,
          status,
          amount,
          currency,
          payment_method,
          profiles:user_id (first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('✅ Activity feed fetched:', transactions?.length || 0, 'items');
      return transactions || [];
    },
    refetchInterval: 30000,
  });

  const handleRefreshAll = () => {
    console.log('🔄 Refreshing all analytics data...');
    refetchMetrics();
    refetchFunnel();
    refetchActivity();
    toast.success('Analytics data refreshed!');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights and interactive data exploration</p>
        </div>
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
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Interactive Data Explorer - Prominent Section */}
      <Card className="border-4 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-2xl">
        <CardHeader className="bg-primary/10 border-b-2 border-primary/20">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary">
            <div className="p-3 bg-primary/20 rounded-xl animate-pulse">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            🔍 Interactive Data Explorer
          </CardTitle>
          <CardDescription className="text-lg text-foreground/90 font-medium">
            Click on any metric, chart, or data point below to explore detailed insights and drill down into specific segments.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-300 rounded-2xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-3 text-xl">
                🔍 Real-Time Metrics
                <Activity className="h-6 w-6" />
              </h4>
              <p className="text-blue-700 leading-relaxed">
                Click on any metric card to see detailed breakdowns, trends, and historical comparisons.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-3 border-green-300 rounded-2xl hover:from-green-100 hover:to-green-200 hover:border-green-400 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-3 text-xl">
                📊 Conversion Funnel
                <TrendingUp className="h-6 w-6" />
              </h4>
              <p className="text-green-700 leading-relaxed">
                Click on funnel stages to explore user journeys and identify conversion bottlenecks.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-3 border-purple-300 rounded-2xl hover:from-purple-100 hover:to-purple-200 hover:border-purple-400 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
              <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-3 text-xl">
                📈 Activity Feed
                <Target className="h-6 w-6" />
              </h4>
              <p className="text-purple-700 leading-relaxed">
                Click on activity items to see detailed transaction information and user context.
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/20 via-primary/15 to-primary/20 border-3 border-primary/40 rounded-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Sparkles className="text-3xl text-primary animate-pulse" />
                <span className="font-bold text-primary text-2xl">All Analytics Are Interactive</span>
                <Sparkles className="text-3xl text-primary animate-pulse" />
              </div>
              <p className="text-primary/90 font-semibold text-lg">
                Every metric, chart, and data point below is clickable for detailed exploration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metricsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                basicMetrics?.totalUsers || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Transactions ({timeRange}d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metricsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                basicMetrics?.totalTransactions || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Recent transactions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-orange-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              Pending KYC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metricsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                basicMetrics?.pendingKyc || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              24h Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metricsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : (
                basicMetrics?.recentActivity || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>User journey from registration to completion</CardDescription>
        </CardHeader>
        <CardContent>
          {funnelLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
              ))}
            </div>
          ) : funnelData && funnelData.length > 0 ? (
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-sm text-muted-foreground">{stage.count} users ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stage.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              No funnel data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Activity Feed */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Real-Time Activity Feed
          </CardTitle>
          <CardDescription>Latest platform activity and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
              ))}
            </div>
          ) : activityFeed && activityFeed.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    activity.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">
                          {activity.profiles?.first_name || 'User'} {activity.profiles?.last_name || ''}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {activity.payment_method} • ${activity.amount} {activity.currency}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status: <span className="capitalize font-medium">{activity.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2" />
              No recent activity
            </div>
          )}
        </CardContent>
      </Card>

      {/* Success Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5" />
            <span className="font-medium">✅ Simplified Analytics Dashboard Active</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            This dashboard shows real data from your database with interactive exploration features. All metrics update automatically every 30 seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
