
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
import { useUserGrowthData } from '@/hooks/admin/useUserGrowthData';
import { formatCurrency } from '@/utils/format';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface UserStatsProps {
  users: any[];
}

const UserStats: React.FC<UserStatsProps> = ({ users }) => {
  // Get real user growth data
  const { data: userGrowthData, isLoading: growthLoading } = useUserGrowthData();
  
  // Calculate summary stats
  const totalUsers = users.length;
  const verifiedUsers = users.filter(user => user.kyc_status === 'approved').length;
  const pendingUsers = users.filter(user => user.kyc_status === 'pending').length;
  const rejectedUsers = users.filter(user => user.kyc_status === 'rejected').length;
  
  // Calculate user engagement - number of transactions
  const activeUsers = users.filter(user => user.transaction_count > 0).length;
  const percentageActive = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  
  // Format data for KYC status chart
  const kycStatusData = [
    { name: 'Approved', value: verifiedUsers, color: '#10B981' },
    { name: 'Pending', value: pendingUsers, color: '#F59E0B' },
    { name: 'Rejected', value: rejectedUsers, color: '#EF4444' },
    { name: 'Not Started', value: totalUsers - verifiedUsers - pendingUsers - rejectedUsers, color: '#94A3B8' }
  ];
  
  // Process real user growth data for display
  const processedGrowthData = userGrowthData || [];
  
  // Format transaction data
  const transactionData = [
    { name: '0', users: users.filter(user => user.transaction_count === 0).length },
    { name: '1-2', users: users.filter(user => user.transaction_count >= 1 && user.transaction_count <= 2).length },
    { name: '3-5', users: users.filter(user => user.transaction_count >= 3 && user.transaction_count <= 5).length },
    { name: '6+', users: users.filter(user => user.transaction_count >= 6).length },
  ];
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{totalUsers}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{verifiedUsers}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending KYC</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-2xl font-bold">{pendingUsers}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-2xl font-bold">{activeUsers}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({percentageActive}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts - Improved mobile responsiveness */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* KYC Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KYC Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kycStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {kycStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Users']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth (Real Data)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {growthLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading growth data...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={processedGrowthData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 40,
                  }}
                >
                  <XAxis 
                    dataKey="period" 
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'cumulative' ? `${value} total users` : `${value} new users`,
                      name === 'cumulative' ? 'Total Users' : 'New Users'
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#10b981"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    activeDot={{ r: 4 }}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        {/* Transaction Distribution Chart - Full width on mobile */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Transaction Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transactionData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" label={{ value: 'Number of Transactions', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Number of Users', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [value, 'Users']} />
                <Legend />
                <Bar dataKey="users" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserStats;
