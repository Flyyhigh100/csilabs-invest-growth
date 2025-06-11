
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MapPin, Globe, Shield } from 'lucide-react';

interface GeographicData {
  usersByRegion: Array<{
    region: string;
    users: number;
    percentage: number;
  }>;
  revenueByRegion: Array<{
    region: string;
    revenue: number;
    percentage: number;
  }>;
  complianceByRegion: Array<{
    region: string;
    kycCompleted: number;
    kycPending: number;
    complianceRate: number;
  }>;
}

interface GeographicAnalyticsChartProps {
  geographicData: GeographicData;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

const GeographicAnalyticsChart: React.FC<GeographicAnalyticsChartProps> = ({ geographicData }) => {
  return (
    <div className="space-y-6">
      {/* Geographic Distribution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              User Distribution by Region
            </CardTitle>
            <CardDescription>Geographic spread of user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geographicData.usersByRegion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, percentage }) => `${region}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="users"
                  >
                    {geographicData.usersByRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value} users`, 'Users']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Revenue by Region
            </CardTitle>
            <CardDescription>Transaction volume across geographic regions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geographicData.revenueByRegion}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance by Region */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            KYC Compliance by Region
          </CardTitle>
          <CardDescription>Verification completion rates across different regions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geographicData.complianceByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === 'complianceRate' ? `${Number(value).toFixed(1)}%` : Number(value),
                    name === 'complianceRate' ? 'Compliance Rate' :
                    name === 'kycCompleted' ? 'KYC Completed' : 'KYC Pending'
                  ]}
                />
                <Bar dataKey="kycCompleted" fill="#10B981" name="KYC Completed" />
                <Bar dataKey="kycPending" fill="#F59E0B" name="KYC Pending" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Regional Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Performance Summary</CardTitle>
          <CardDescription>Detailed breakdown of key metrics by region</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Region</th>
                  <th className="text-right p-2">Users</th>
                  <th className="text-right p-2">Revenue</th>
                  <th className="text-right p-2">Avg Revenue/User</th>
                  <th className="text-right p-2">KYC Rate</th>
                </tr>
              </thead>
              <tbody>
                {geographicData.usersByRegion.map((userRegion) => {
                  const revenueRegion = geographicData.revenueByRegion.find(r => r.region === userRegion.region);
                  const complianceRegion = geographicData.complianceByRegion.find(r => r.region === userRegion.region);
                  
                  const avgRevenuePerUser = revenueRegion && userRegion.users > 0 
                    ? revenueRegion.revenue / userRegion.users 
                    : 0;
                  
                  return (
                    <tr key={userRegion.region} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{userRegion.region}</td>
                      <td className="p-2 text-right">{userRegion.users}</td>
                      <td className="p-2 text-right">
                        ${revenueRegion?.revenue.toLocaleString() || '0'}
                      </td>
                      <td className="p-2 text-right">
                        ${avgRevenuePerUser.toLocaleString()}
                      </td>
                      <td className="p-2 text-right">
                        {complianceRegion?.complianceRate.toFixed(1) || '0'}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeographicAnalyticsChart;
