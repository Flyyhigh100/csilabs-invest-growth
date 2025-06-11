import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, TrendingUp, Eye, User, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RealTimeData {
  hourlyActivity: Array<{
    hour: string;
    transactions: number;
    registrations: number;
    revenue: number;
  }>;
  currentMetrics: {
    activeUsers: number;
    onlineUsers: number;
    todayRevenue: number;
    todayTransactions: number;
  };
  recentActivity: Array<{
    time: string;
    type: string;
    amount?: number;
    user: string;
  }>;
}

interface RealTimeDashboardChartProps {
  realTimeData: RealTimeData;
}

const RealTimeDashboardChart: React.FC<RealTimeDashboardChartProps> = ({ realTimeData }) => {
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const handleActivityClick = (activity: any, index: number) => {
    setSelectedActivity({ ...activity, index });
    setDetailModalOpen(true);
  };

  const handleMetricClick = (metricType: string) => {
    setSelectedMetric(metricType);
    setDetailModalOpen(true);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'transaction': return <CreditCard className="h-4 w-4 text-green-600" />;
      case 'registration': return <User className="h-4 w-4 text-blue-600" />;
      case 'kyc': return <Activity className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderMetricDetails = () => {
    if (!selectedMetric) return null;

    const metrics = realTimeData.currentMetrics;
    
    switch (selectedMetric) {
      case 'transactions':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Today's Transaction Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{metrics.todayTransactions}</div>
                <div className="text-sm text-muted-foreground">Total Transactions</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  ${metrics.todayRevenue > 0 && metrics.todayTransactions > 0
                    ? (metrics.todayRevenue / metrics.todayTransactions).toFixed(0)
                    : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Average Amount</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Real-time data from your transaction database
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Activity Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users (24h)</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{metrics.onlineUsers}</div>
                <div className="text-sm text-muted-foreground">Estimated Online</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Active users are those who had transactions in the last 24 hours
            </div>
          </div>
        );
      case 'revenue':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Today's Total Revenue</span>
                <span className="font-bold text-green-600">${metrics.todayRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Number of Transactions</span>
                <span className="font-bold">{metrics.todayTransactions}</span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Average per Transaction</span>
                <span className="font-bold">
                  ${metrics.todayTransactions > 0 
                    ? (metrics.todayRevenue / metrics.todayTransactions).toFixed(2)
                    : '0.00'}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderActivityDetails = () => {
    if (!selectedActivity) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getActivityIcon(selectedActivity.type)}
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {selectedActivity.type} Details
            </h3>
            <p className="text-sm text-muted-foreground">
              Activity #{selectedActivity.index + 1} from live feed
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Badge className={
              selectedActivity.type === 'transaction' ? 'bg-green-100 text-green-800' :
              selectedActivity.type === 'registration' ? 'bg-blue-100 text-blue-800' :
              'bg-purple-100 text-purple-800'
            }>
              {selectedActivity.type}
            </Badge>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <p className="text-sm">{selectedActivity.time}</p>
          </div>
        </div>

        {selectedActivity.amount && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <p className="text-lg font-bold text-green-600">
              ${selectedActivity.amount.toLocaleString()}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">User ID</label>
          <p className="text-sm font-mono bg-gray-100 p-2 rounded">
            {selectedActivity.user}
          </p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <Clock className="h-4 w-4 inline mr-1" />
            This is real-time data from your live system
          </p>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Enhanced Real-time Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMetricClick('transactions')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Live Transactions
                <Eye className="h-3 w-3 text-muted-foreground ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {realTimeData.currentMetrics.todayTransactions}
              </div>
              <p className="text-xs text-muted-foreground">Click for details</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMetricClick('users')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Active Users
                <Eye className="h-3 w-3 text-muted-foreground ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {realTimeData.currentMetrics.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {realTimeData.currentMetrics.onlineUsers} online • Click for details
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleMetricClick('revenue')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-purple-600" />
                Today's Revenue
                <Eye className="h-3 w-3 text-muted-foreground ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                ${realTimeData.currentMetrics.todayRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Click for breakdown</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                Avg Transaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                ${realTimeData.currentMetrics.todayTransactions > 0 
                  ? (realTimeData.currentMetrics.todayRevenue / realTimeData.currentMetrics.todayTransactions).toFixed(0)
                  : '0'
                }
              </div>
              <p className="text-xs text-muted-foreground">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Activity (Last 24 Hours)</CardTitle>
            <CardDescription>Live transaction and user activity tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={realTimeData.hourlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="transactions" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Transactions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="registrations" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="New Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Enhanced Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Live Activity Feed</CardTitle>
            <CardDescription>Click on any activity to see detailed information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {realTimeData.recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-sm transition-all group"
                  onClick={() => handleActivityClick(activity, index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'transaction' ? 'bg-green-500' :
                      activity.type === 'registration' ? 'bg-blue-500' :
                      activity.type === 'kyc' ? 'bg-purple-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <div>
                        <div className="font-medium text-sm">
                          {activity.type === 'transaction' && 'New Transaction'}
                          {activity.type === 'registration' && 'User Registration'}
                          {activity.type === 'kyc' && 'KYC Submission'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          User: {activity.user}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    {activity.amount && (
                      <div className="font-medium text-sm">
                        ${activity.amount.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {activity.time}
                    </div>
                    <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedActivity ? 'Activity Details' : 'Metric Details'}
              </DialogTitle>
              <DialogDescription>
                {selectedActivity 
                  ? 'Detailed information about this real-time activity'
                  : 'Detailed breakdown of this metric'
                }
              </DialogDescription>
            </DialogHeader>
            {selectedActivity ? renderActivityDetails() : renderMetricDetails()}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default RealTimeDashboardChart;
