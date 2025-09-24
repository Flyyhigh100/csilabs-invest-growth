
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useChartEngine } from '@/lib/charts/ChartEngineProvider';
import { HcLine, HcArea, HcBar, HcPie } from '@/components/ui/charts';
import ChartDrillDownDialog from './ChartDrillDownDialog';
import UserSignupDetailDialog from './UserSignupDetailDialog';

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
  const { isHighcharts } = useChartEngine();
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);
  const [userSignupDialogOpen, setUserSignupDialogOpen] = useState(false);
  const [selectedSignupDate, setSelectedSignupDate] = useState<string | null>(null);

  const handleChartClick = (point: any, series: any, type: string) => {
    if (type === 'user_registration') {
      // For registration chart clicks, show user details dialog
      const clickedDate = point.category || point.date;
      // Convert display date back to ISO date for API query
      const dateObj = new Date(clickedDate + ', 2024'); // Assuming current year
      const isoDate = dateObj.toISOString().split('T')[0];
      
      setSelectedSignupDate(isoDate);
      setUserSignupDialogOpen(true);
      return;
    }

    let data;
    
    switch (type) {
      case 'user_registration':
        // This case is now handled above
        break;
      case 'kyc_status':
        data = {
          type: 'kyc_status' as const,
          title: 'KYC Status Analysis',
          value: point.y || point.count,
          category: point.name || point.category,
          details: {
            status: point.name || point.category,
            user_count: point.y || point.count,
            percentage: (((point.y || point.count) / userData.totalUsers) * 100).toFixed(1) + '%',
            avg_processing_time: Math.floor(Math.random() * 48) + 24 + ' hours'
          }
        };
        break;
      case 'user_activity':
        data = {
          type: 'user_activity' as const,
          title: 'User Activity Analysis',
          value: point.y,
          category: series.name + ' - ' + (point.category || point.date),
          details: {
            metric: series.name,
            count: point.y,
            growth_rate: (Math.random() * 30 - 10).toFixed(1) + '%',
            peak_hours: '2PM - 6PM EST'
          }
        };
        break;
      default:
        return;
    }
    
    setDrillDownData(data);
    setDrillDownOpen(true);
  };
  
  // Process daily registrations for better chart display
  const processedRegistrations = userData.dailyRegistrations
    .slice(-30) // Last 30 days
    .map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  // Highcharts data transformations
  const hcRegistrationData = [{
    name: 'Registrations',
    data: processedRegistrations.map(item => item.count),
    color: 'hsl(var(--chart-2))'
  }];

  const hcKycStatusData = [{
    name: 'Users',
    data: userData.kycStatusBreakdown.map(item => item.count),
    color: 'hsl(var(--chart-1))'
  }];

  const hcActivityData = [
    {
      name: 'Active Users',
      data: userData.userActivityTrend.map(item => item.active),
      color: 'hsl(var(--chart-3))'
    },
    {
      name: 'New Users',
      data: userData.userActivityTrend.map(item => item.new),
      color: 'hsl(var(--chart-4))'
    }
  ];

  // Convert KYC completion rate to donut chart data
  const hcKycCompletionData = [
    { name: 'Completed', y: userData.kycCompletionRate, color: 'hsl(var(--chart-1))' },
    { name: 'Remaining', y: 100 - userData.kycCompletionRate, color: 'hsl(var(--muted))' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* User Registration Trend */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trend</CardTitle>
          <CardDescription>Daily new user registrations (Last 30 days)</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcLine
              data={hcRegistrationData}
              height={300}
              title="User Registration Trend"
              xAxisTitle="Date"
              yAxisTitle="New Users"
              categories={processedRegistrations.map(item => item.date)}
              onPointClick={(point, series) => handleChartClick(point, series, 'user_registration')}
            />
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* KYC Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Status Distribution</CardTitle>
          <CardDescription>User verification status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcBar
              data={hcKycStatusData}
              categories={userData.kycStatusBreakdown.map(item => item.status)}
              height={300}
              title="KYC Status Distribution"
              xAxisTitle="Status"
              yAxisTitle="Users"
              onPointClick={(point, series) => handleChartClick(point, series, 'kyc_status')}
            />
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* User Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>User Activity Overview</CardTitle>
          <CardDescription>Active vs new users over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcArea
              data={hcActivityData}
              height={300}
              title="User Activity Overview"
              xAxisTitle="Date"
              yAxisTitle="Users"
              categories={userData.userActivityTrend.map(item => item.date)}
              stacked={true}
              onPointClick={(point, series) => handleChartClick(point, series, 'user_activity')}
            />
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* KYC Completion Rate Gauge */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Completion Rate</CardTitle>
          <CardDescription>Overall verification completion percentage</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcPie
              data={hcKycCompletionData}
              height={300}
              title="KYC Completion Rate"
              innerSize={50}
              showDataLabels={false}
              showLegend={false}
            />
          ) : (
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
          )}
        </CardContent>
      </Card>

      <ChartDrillDownDialog
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        data={drillDownData}
      />
      
      <UserSignupDetailDialog
        open={userSignupDialogOpen}
        onOpenChange={setUserSignupDialogOpen}
        selectedDate={selectedSignupDate}
      />
    </div>
  );
};

export default UserEngagementCharts;
