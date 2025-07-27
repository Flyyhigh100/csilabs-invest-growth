import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserPlus,
  FileCheck,
  Coins,
  CreditCard
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatTokenAmount } from '@/utils/format';
import { compareMetrics, getCurrentMetrics, type MetricComparison } from '@/utils/admin/analytics/historicalUtils';
import { calculateRealTimeData, type RealTimeData } from '@/utils/admin/analytics/realTimeUtils';
import { formatDistanceToNow } from 'date-fns';
import { formatDateWithTime } from '@/utils/date';
import { useTransactionRealtime } from '@/hooks/realtime/useTransactionRealtime';
import { useProfileRealtime } from '@/hooks/realtime/useProfileRealtime';
import { RealtimeStatusIndicator } from '@/components/ui/realtime-status-indicator';

interface LiveMetric {
  label: string;
  value: string | number;
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
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadInitialData = async () => {
      try {
        // Fetch current metrics and enhanced real-time data
        const currentMetrics = await getCurrentMetrics(false);
        const realTimeInfo = await calculateRealTimeData(false);
        
        const metrics: LiveMetric[] = [
          {
            label: 'Total Revenue',
            value: formatCurrency(currentMetrics.totalRevenue),
            icon: DollarSign,
            color: 'text-green-600'
          },
          {
            label: 'Active Users',
            value: currentMetrics.activeUsers,
            icon: Users,
            color: 'text-blue-600'
          },
          {
            label: 'Completed Transactions',
            value: currentMetrics.completedTransactions,
            icon: CheckCircle,
            color: 'text-green-600'
          },
          {
            label: 'Pending Transactions',
            value: currentMetrics.pendingTransactions,
            icon: Clock,
            color: 'text-orange-600'
          },
          {
            label: 'KYC Approved',
            value: currentMetrics.approvedKyc,
            icon: CheckCircle,
            color: 'text-green-600'
          },
          {
            label: 'Tokens Distributed',
            value: formatTokenAmount(currentMetrics.tokensDistributed),
            icon: TrendingUp,
            color: 'text-purple-600'
          }
        ];

        setLiveMetrics(metrics);
        setRealTimeData(realTimeInfo);
        setLastUpdated(new Date());

        // Use the hourly activity data for charts
        setChartData(realTimeInfo.hourlyActivity.map(item => ({
          date: item.hour,
          revenue: item.revenue,
          transactions: item.transactions,
          users: item.registrations
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

  // Use realtime hooks for live updates
  const transactionRealtimeStatus = useTransactionRealtime(undefined, loadInitialData);
  const profileRealtimeStatus = useProfileRealtime(loadInitialData);

  // Real-time data with historical comparisons
  useEffect(() => {
    loadInitialData();

    // Refresh data every 30 seconds as backup to realtime
    const interval = setInterval(() => {
      loadInitialData();
    }, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'token_delivery': return <Coins className="h-4 w-4 text-green-600" />;
      case 'registration': return <UserPlus className="h-4 w-4 text-purple-600" />;
      case 'kyc_update': return <FileCheck className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': 
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'failed': 
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending': return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getUserInitials = (initials?: string): string => {
    return initials || '??';
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
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <RealtimeStatusIndicator 
            isConnected={transactionRealtimeStatus.isConnected && profileRealtimeStatus.isConnected}
            lastUpdate={transactionRealtimeStatus.lastUpdate || profileRealtimeStatus.lastUpdate}
            connectionAttempts={transactionRealtimeStatus.connectionAttempts + profileRealtimeStatus.connectionAttempts}
          />
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
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
                    <RechartsTooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
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
                    <RechartsTooltip />
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
                    <RechartsTooltip />
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
            <TooltipProvider>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeData?.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    {/* User Avatar/Initials */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {getUserInitials(activity.userInitials)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Activity Type Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.description}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-xs text-muted-foreground line-clamp-2 cursor-help">
                                {activity.detailedDescription}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-sm space-y-1">
                                <p className="font-medium">{activity.userName}</p>
                                <p className="text-xs">{activity.userEmail}</p>
                                <p className="text-xs">{activity.detailedDescription}</p>
                                {activity.transactionId && (
                                  <p className="text-xs font-mono">ID: {activity.transactionId}</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        {/* Amount Display */}
                        {activity.amount && (
                          <div className="text-sm font-medium text-right ml-2">
                            {formatCurrency(activity.amount)}
                            {activity.tokenAmount && activity.tokenAmount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {formatTokenAmount(activity.tokenAmount)} tokens
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Status and Time */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {activity.time}
                        </span>
                        {getStatusBadge(activity.status)}
                        {activity.isLive && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Live
                          </Badge>
                        )}
                        {activity.paymentMethod && (
                          <Badge variant="outline" className="text-xs">
                            {activity.paymentMethod}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeDashboard;