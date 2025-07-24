import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Activity, FileText } from 'lucide-react';
import RealTimeDashboard from './RealTimeDashboard';
import ReportsHub from '../Reports/ReportsHub';
import ReportsDashboard from '../Reports/ReportsDashboard';

const AnalyticsHub: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reporting Hub</h1>
        <p className="text-muted-foreground mt-1">
          Real-time analytics, comprehensive reports, and business intelligence
        </p>
      </div>

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-Time Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Report Generator
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Advanced Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsHub />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <ReportsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsHub;