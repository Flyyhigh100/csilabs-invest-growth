
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Coins, DollarSign, TrendingUp } from 'lucide-react';
import ExecutiveSummary from './ExecutiveSummary';
import FinancialReports from './FinancialReports';
import UserEngagementReports from './UserEngagementReports';
import TokenDistributionReports from './TokenDistributionReports';
import AdvancedAnalytics from './AdvancedAnalytics';

const ReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('executive');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics and business intelligence with interactive data exploration
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Executive Summary
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial Reports
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Analytics
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Token Distribution
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          <ExecutiveSummary />
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserEngagementReports />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <TokenDistributionReports />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>
      </Tabs>

      {/* Enhanced Data Explorer Info Card */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Interactive Data Explorer
          </CardTitle>
          <CardDescription>
            Click on any chart, metric, or data point to explore detailed insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">🔍 Live Activity Feed</h4>
              <p className="text-sm text-blue-700">
                Click on any activity in the real-time feed to see detailed transaction or user information.
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📊 Interactive Charts</h4>
              <p className="text-sm text-green-700">
                Click on chart segments, bars, or regions to drill down into specific data points.
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">📈 Metric Details</h4>
              <p className="text-sm text-purple-700">
                Click on metric cards to see detailed breakdowns and historical trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsDashboard;
