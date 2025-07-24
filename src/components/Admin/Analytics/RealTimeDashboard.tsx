import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatTokenAmount } from '@/utils/format';

interface LiveMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}

interface RealtimeActivity {
  id: string;
  type: 'transaction' | 'kyc' | 'user_signup' | 'token_distribution';
  description: string;
  timestamp: string;
  value?: number;
  status: 'success' | 'pending' | 'failed';
}

const RealTimeDashboard: React.FC = () => {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [realtimeActivities, setRealtimeActivities] = useState<RealtimeActivity[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulated live data updates
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch actual data from database
        const [transactionsRes, profilesRes, kycRes] = await Promise.all([
          supabase.from('transactions').select('*').eq('is_test', false),
          supabase.from('profiles').select('*'),
          supabase.from('kyc_verifications').select('*').eq('is_test', false)
        ]);

        const transactions = transactionsRes.data || [];
        const profiles = profilesRes.data || [];
        const kycVerifications = kycRes.data || [];

        // Calculate metrics
        const totalRevenue = transactions
          .filter(t => t.status === 'completed')
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

        const completedTransactions = transactions.filter(t => t.status === 'completed').length;
        const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
        const approvedKyc = kycVerifications.filter(k => k.status === 'approved').length;

        const metrics: LiveMetric[] = [
          {
            label: 'Total Revenue',
            value: formatCurrency(totalRevenue),
            change: 12.5,
            trend: 'up',
            icon: DollarSign,
            color: 'text-green-600'
          },
          {
            label: 'Active Users',
            value: profiles.length,
            change: 8.2,
            trend: 'up',
            icon: Users,
            color: 'text-blue-600'
          },
          {
            label: 'Completed Transactions',
            value: completedTransactions,
            change: 15.7,
            trend: 'up',
            icon: CheckCircle,
            color: 'text-green-600'
          },
          {
            label: 'Pending Transactions',
            value: pendingTransactions,
            change: -5.3,
            trend: 'down',
            icon: Clock,
            color: 'text-orange-600'
          },
          {
            label: 'KYC Approved',
            value: approvedKyc,
            change: 22.1,
            trend: 'up',
            icon: CheckCircle,
            color: 'text-green-600'
          },
          {
            label: 'Tokens Distributed (Completed Only)',
            value: formatTokenAmount(transactions
              .filter(t => t.status === 'completed' && t.token_sent === true && t.token_amount != null)
              .reduce((sum, t) => sum + (Number(t.token_amount) || 0), 0)
            ),
            change: 18.9,
            trend: 'up',
            icon: TrendingUp,
            color: 'text-purple-600'
          }
        ];

        setLiveMetrics(metrics);

        // Generate chart data from recent transactions
        const last7Days = [...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const dayTransactions = transactions.filter(t => {
            const tDate = new Date(t.created_at);
            return tDate.toDateString() === date.toDateString();
          });
          
          return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: dayTransactions
              .filter(t => t.status === 'completed')
              .reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
            transactions: dayTransactions.length,
            users: Math.floor(Math.random() * 20) + 10 // Simulated for now
          };
        });

        setChartData(last7Days);

        // Generate recent activities
        const activities: RealtimeActivity[] = transactions
          .slice(0, 10)
          .map((transaction, index) => ({
            id: transaction.id,
            type: 'transaction',
            description: `${transaction.payment_method} payment of ${formatCurrency(Number(transaction.amount))}`,
            timestamp: transaction.created_at,
            value: Number(transaction.amount),
            status: transaction.status === 'completed' ? 'success' : 
                   transaction.status === 'pending' ? 'pending' : 'failed'
          }));

        setRealtimeActivities(activities);
        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up real-time subscriptions
    const transactionChannel = supabase
      .channel('realtime-transactions')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('Transaction update:', payload);
          // Refresh data when new transactions come in
          loadInitialData();
        }
      )
      .subscribe();

    // Simulate live updates every 30 seconds
    const interval = setInterval(() => {
      setLiveMetrics(prev => prev.map(metric => ({
        ...metric,
        change: metric.change + (Math.random() - 0.5) * 2 // Small random changes
      })));
    }, 30000);

    return () => {
      supabase.removeChannel(transactionChannel);
      clearInterval(interval);
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Real-Time Analytics</h2>
          <p className="text-muted-foreground">Live dashboard with real-time metrics and activity feed</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-green-600 animate-pulse" />
          Live Updates Active
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {liveMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : metric.trend === 'down' ? (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      ) : null}
                      <span className={`text-xs ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted`}>
                    <Icon className={`h-6 w-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Revenue and transaction trends over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue" className="space-y-4">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="revenue" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="transactions" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              
              <TabsContent value="users" className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Real-time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>Real-time updates from your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {realtimeActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                  {activity.value && (
                    <div className="text-sm font-medium text-right">
                      {formatCurrency(activity.value)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeDashboard;