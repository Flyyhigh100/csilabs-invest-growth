
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Activity, Users, DollarSign, TrendingUp } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      {/* Real-time Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Live Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {realTimeData.currentMetrics.todayTransactions}
            </div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {realTimeData.currentMetrics.activeUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {realTimeData.currentMetrics.onlineUsers} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${realTimeData.currentMetrics.todayRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">24h volume</p>
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

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
          <CardDescription>Real-time user actions and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {realTimeData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'transaction' ? 'bg-green-500' :
                    activity.type === 'registration' ? 'bg-blue-500' :
                    activity.type === 'kyc' ? 'bg-purple-500' : 'bg-gray-500'
                  }`} />
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
                <div className="text-right">
                  {activity.amount && (
                    <div className="font-medium text-sm">
                      ${activity.amount.toLocaleString()}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeDashboardChart;
