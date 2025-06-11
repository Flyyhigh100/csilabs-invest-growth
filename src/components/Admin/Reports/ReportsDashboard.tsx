
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
    <div className="w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reports Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics and business intelligence with interactive data exploration
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
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
      </div>

      {/* Interactive Data Explorer Section - Enhanced Visibility */}
      <div className="mt-12 pt-8 border-t-2 border-primary/20">
        <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
          <CardHeader className="pb-4 bg-primary/5 rounded-t-lg">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-primary/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              Interactive Data Explorer
            </CardTitle>
            <CardDescription className="text-base text-foreground/80">
              Click on any chart, metric, or data point throughout the dashboard to explore detailed insights and drill down into specific data segments.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 cursor-pointer shadow-sm">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2 text-lg">
                  🔍 Live Activity Feed
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Click on any activity in the real-time feed to see detailed transaction or user information with full context and history.
                </p>
              </div>
              <div className="p-5 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all duration-200 cursor-pointer shadow-sm">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2 text-lg">
                  📊 Interactive Charts
                </h4>
                <p className="text-sm text-green-700 leading-relaxed">
                  Click on chart segments, bars, or regions to drill down into specific data points and explore underlying trends.
                </p>
              </div>
              <div className="p-5 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all duration-200 cursor-pointer shadow-sm">
                <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2 text-lg">
                  📈 Metric Details
                </h4>
                <p className="text-sm text-purple-700 leading-relaxed">
                  Click on metric cards to see detailed breakdowns, historical trends, and comparative analysis data.
                </p>
              </div>
            </div>
            
            {/* Prominent Call-to-Action */}
            <div className="mt-6 p-4 bg-primary/15 border-2 border-primary/30 rounded-xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <span className="font-bold text-primary text-lg">Interactive Features Active</span>
                  <span className="text-2xl">✨</span>
                </div>
                <p className="text-sm text-primary/80 font-medium">
                  All charts, metrics, and data points above are clickable for detailed exploration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default ReportsDashboard;
