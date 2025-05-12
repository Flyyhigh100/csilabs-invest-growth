
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon, CheckCircleIcon, ClockIcon, AlertCircleIcon } from 'lucide-react';
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
  
  // Format sample growth data (in real app, this would come from DB with time series)
  const userGrowthData = [
    { name: 'Week 1', users: Math.round(totalUsers * 0.2) },
    { name: 'Week 2', users: Math.round(totalUsers * 0.3) },
    { name: 'Week 3', users: Math.round(totalUsers * 0.6) },
    { name: 'Week 4', users: totalUsers }
  ];
  
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
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* KYC Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>KYC Status Distribution</CardTitle>
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
            <CardTitle>User Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userGrowthData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Users']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Transaction Distribution Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Distribution</CardTitle>
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
