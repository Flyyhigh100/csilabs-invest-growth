
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface UserEngagementChartsProps {
  userData: {
    totalUsers: number;
    newUsersThisMonth: number;
    activeUsers: number;
    kycCompletionRate: number;
    dailyRegistrations: Array<{ date: string; count: number }>;
    kycStatusBreakdown: Array<{ status: string; count: number }>;
    userActivityTrend: Array<{ date: string; active: number; new: number }>;
  };
}

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  registrations: {
    label: "Registrations",
    color: "hsl(var(--chart-2))",
  },
  active: {
    label: "Active Users",
    color: "hsl(var(--chart-3))",
  },
  new: {
    label: "New Users",
    color: "hsl(var(--chart-4))",
  },
};

const UserEngagementCharts: React.FC<UserEngagementChartsProps> = ({ userData }) => {
  // Process daily registrations for better chart display
  const processedRegistrations = userData.dailyRegistrations
    .slice(-30) // Last 30 days
    .map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* User Registration Trend */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trend</CardTitle>
          <CardDescription>Daily new user registrations (Last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedRegistrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}`, 'New Users']}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="var(--color-registrations)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-registrations)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* KYC Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Status Distribution</CardTitle>
          <CardDescription>User verification status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userData.kycStatusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}`, 'Users']}
                />
                <Bar dataKey="count" fill="var(--color-users)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Overview</CardTitle>
          <CardDescription>Active vs new users over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userData.userActivityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  stackId="1" 
                  stroke="var(--color-active)" 
                  fill="var(--color-active)"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="new" 
                  stackId="1" 
                  stroke="var(--color-new)" 
                  fill="var(--color-new)"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* KYC Completion Rate Gauge */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Completion Rate</CardTitle>
          <CardDescription>Overall verification completion percentage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="20"
                  fill="transparent"
                  className="text-muted-foreground/20"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray={`${userData.kycCompletionRate * 5.02} 502`}
                  strokeDashoffset="125.5"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold">{userData.kycCompletionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserEngagementCharts;
