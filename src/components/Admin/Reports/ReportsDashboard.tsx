
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancialReports from './FinancialReports';
import UserEngagementReports from './UserEngagementReports';
import TokenDistributionReports from './TokenDistributionReports';
import ExecutiveSummary from './ExecutiveSummary';
import { BarChart3, Users, Coins, TrendingUp } from 'lucide-react';

const ReportsDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive reporting and analytics for business insights and user follow-ups
          </p>
        </div>
      </div>

      <ExecutiveSummary />

      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial Reports
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Engagement
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Token Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <FinancialReports />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserEngagementReports />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <TokenDistributionReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsDashboard;
