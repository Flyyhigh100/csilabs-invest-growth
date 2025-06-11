import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { MapPin, Globe, Shield, Eye, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleRegionClick = (regionData: any, type: 'users' | 'revenue' | 'compliance') => {
    setSelectedRegion({ ...regionData, type });
    setDetailModalOpen(true);
  };

  const handlePieClick = (data: any, index: number) => {
    const regionData = geographicData.usersByRegion[index];
    if (regionData) {
      handleRegionClick(regionData, 'users');
    }
  };

  const handleBarClick = (data: any) => {
    handleRegionClick(data, 'revenue');
  };

  const renderRegionDetails = () => {
    if (!selectedRegion) return null;

    const revenueData = geographicData.revenueByRegion.find(r => r.region === selectedRegion.region);
    const complianceData = geographicData.complianceByRegion.find(r => r.region === selectedRegion.region);
    const userData = geographicData.usersByRegion.find(r => r.region === selectedRegion.region);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-xl font-semibold">{selectedRegion.region}</h3>
            <p className="text-sm text-muted-foreground">Regional Performance Overview</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Users</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{userData?.users || 0}</div>
            <div className="text-xs text-muted-foreground">
              {userData?.percentage.toFixed(1) || 0}% of total users
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              ${revenueData?.revenue.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-muted-foreground">
              {revenueData?.percentage.toFixed(1) || 0}% of total revenue
            </div>
          </div>
        </div>

        {complianceData && (
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">KYC Compliance</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <Badge className="bg-purple-100 text-purple-800">
                  {complianceData.complianceRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium text-green-600">{complianceData.kycCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <span className="font-medium text-yellow-600">{complianceData.kycPending}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Key Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Revenue per User:</span>
              <span className="font-medium">
                ${userData && revenueData && userData.users > 0 
                  ? (revenueData.revenue / userData.users).toLocaleString()
                  : '0'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Regional Rank:</span>
              <span className="font-medium">
                #{geographicData.usersByRegion.findIndex(r => r.region === selectedRegion.region) + 1} by users
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground p-2 bg-blue-50 rounded">
          💡 This data is calculated from your real user registrations, transactions, and KYC submissions
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Geographic Distribution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              User Distribution by Region
              <Eye className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardTitle>
            <CardDescription>Click on any segment to see detailed regional data</CardDescription>
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
                    onClick={handlePieClick}
                    className="cursor-pointer"
                  >
                    {geographicData.usersByRegion.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [`${value} users (click for details)`, 'Users']}
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
              <Eye className="h-4 w-4 text-muted-foreground ml-auto" />
            </CardTitle>
            <CardDescription>Click on any bar to see detailed revenue breakdown</CardDescription>
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
                    formatter={(value) => [`$${Number(value).toLocaleString()} (click for details)`, 'Revenue']}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#10B981"
                    onClick={handleBarClick}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  />
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
            <Eye className="h-4 w-4 text-muted-foreground ml-auto" />
          </CardTitle>
          <CardDescription>Click on any region to see detailed compliance metrics</CardDescription>
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

      {/* Enhanced Regional Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Regional Performance Summary</CardTitle>
          <CardDescription>Click on any region row to see detailed breakdown</CardDescription>
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
                  <th className="text-right p-2">Action</th>
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
                    <tr 
                      key={userRegion.region} 
                      className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleRegionClick(userRegion, 'users')}
                    >
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
                      <td className="p-2 text-right">
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Region Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Regional Analytics Details</DialogTitle>
            <DialogDescription>
              Comprehensive performance data for this region
            </DialogDescription>
          </DialogHeader>
          {renderRegionDetails()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GeographicAnalyticsChart;
