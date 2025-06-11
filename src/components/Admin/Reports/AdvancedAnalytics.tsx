
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, Users, Activity, Target, AlertCircle, Clock, Globe } from 'lucide-react';
import { toast } from 'sonner';
import ConversionFunnelChart from './Charts/ConversionFunnelChart';
import CohortAnalysisChart from './Charts/CohortAnalysisChart';
import PredictiveAnalyticsChart from './Charts/PredictiveAnalyticsChart';
import TransactionVelocityChart from './Charts/TransactionVelocityChart';
import GeographicAnalyticsChart from './Charts/GeographicAnalyticsChart';
import RealTimeDashboardChart from './Charts/RealTimeDashboardChart';
import { calculateRealConversionFunnel } from '@/utils/admin/analytics/conversionFunnelUtils';
import { calculateRealTransactionVelocity } from '@/utils/admin/analytics/transactionVelocityUtils';
import { calculateRealRevenueForecasting } from '@/utils/admin/analytics/revenueForecastUtils';
import { calculateRealCohortAnalysis } from '@/utils/admin/analytics/cohortAnalysisUtils';
import { calculateRealProcessingTimes } from '@/utils/admin/analytics/processingTimeUtils';
import { calculateRealGeographicAnalytics } from '@/utils/admin/analytics/geographicAnalyticsUtils';
import { calculateRealTimeData } from '@/utils/admin/analytics/realTimeUtils';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';

const AdvancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('90');
  const { includeTestData } = useTestDataToggle();

  const { data: analyticsData, isLoading, refetch, error } = useQuery({
    queryKey: ['advanced-analytics-complete', timeRange, includeTestData],
    queryFn: async () => {
      console.log('Fetching complete real analytics data...');
      
      try {
        // Fetch all real data analytics
        const [
          funnelData,
          velocityData,
          { historicalData, predictedData },
          cohortData,
          processingTimes,
          geographicData,
          realTimeData
        ] = await Promise.all([
          calculateRealConversionFunnel(includeTestData),
          calculateRealTransactionVelocity(parseInt(timeRange), includeTestData),
          calculateRealRevenueForecasting(includeTestData),
          calculateRealCohortAnalysis(includeTestData),
          calculateRealProcessingTimes(includeTestData),
          calculateRealGeographicAnalytics(includeTestData),
          calculateRealTimeData(includeTestData)
        ]);

        console.log('All real analytics data fetched successfully');

        return {
          funnelData,
          cohortData,
          historicalData,
          predictedData,
          velocityData,
          processingTimes,
          geographicData,
          realTimeData
        };
      } catch (error) {
        console.error('Error fetching complete analytics data:', error);
        toast.error('Failed to fetch analytics data');
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2,
  });

  if (error) {
    console.error('Analytics query error:', error);
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error Loading Analytics
            </CardTitle>
            <CardDescription className="text-red-700">
              Failed to load analytics data. Please try refreshing or contact support if the issue persists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetch()} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analytics
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {includeTestData ? 'Including test data' : 'Production data only'}
        </div>
      </div>

      {/* Enhanced Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              Overall Conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analyticsData?.funnelData && analyticsData.funnelData.length > 0 && analyticsData.funnelData[0].users > 0
                ? ((analyticsData.funnelData[analyticsData.funnelData.length - 1].users / analyticsData.funnelData[0].users) * 100).toFixed(1)
                : '0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">End-to-end conversion</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analyticsData?.realTimeData?.currentMetrics.activeUsers || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.realTimeData?.currentMetrics.onlineUsers || '0'} online now
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Revenue Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${analyticsData?.predictedData 
                ? analyticsData.predictedData.reduce((sum, d) => sum + d.predictedRevenue, 0).toLocaleString()
                : '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">Next 3 months</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              Avg Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {analyticsData?.processingTimes?.transactionProcessingTime 
                ? `${analyticsData.processingTimes.transactionProcessingTime.toFixed(0)}m`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Transaction time</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-600" />
              Top Region
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {analyticsData?.geographicData?.usersByRegion?.[0]?.region || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.geographicData?.usersByRegion?.[0]?.users || '0'} users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real Data Notice */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5" />
            <span className="font-medium">100% Real Data Analytics</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All analytics now use actual data from your database - no mock or simulated data. This provides genuine business intelligence for data-driven decisions.
          </p>
        </CardContent>
      </Card>

      {/* Real-Time Dashboard */}
      {analyticsData?.realTimeData && (
        <RealTimeDashboardChart realTimeData={analyticsData.realTimeData} />
      )}

      {/* Conversion Funnel with Real Data */}
      {analyticsData?.funnelData && (
        <ConversionFunnelChart funnelData={analyticsData.funnelData} />
      )}

      {/* Real Cohort Analysis */}
      {analyticsData?.cohortData && (
        <CohortAnalysisChart cohortData={analyticsData.cohortData} />
      )}

      {/* Predictive Analytics with Real Data */}
      {analyticsData?.historicalData && analyticsData?.predictedData && (
        <PredictiveAnalyticsChart 
          historicalData={analyticsData.historicalData}
          predictedData={analyticsData.predictedData}
        />
      )}

      {/* Transaction Velocity with Real Data */}
      {analyticsData?.velocityData && (
        <TransactionVelocityChart velocityData={analyticsData.velocityData} />
      )}

      {/* Geographic Analytics with Real Data */}
      {analyticsData?.geographicData && (
        <GeographicAnalyticsChart geographicData={analyticsData.geographicData} />
      )}

      {/* Processing Times Analysis */}
      {analyticsData?.processingTimes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Real Processing Time Analytics
            </CardTitle>
            <CardDescription>Actual processing times from your system data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analyticsData.processingTimes.kycProcessingTime.toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Avg KYC Processing</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsData.processingTimes.transactionProcessingTime.toFixed(0)}m
                </div>
                <div className="text-sm text-muted-foreground">Avg Transaction Processing</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {analyticsData.processingTimes.paymentMethodTimes.length}
                </div>
                <div className="text-sm text-muted-foreground">Payment Methods Tracked</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Payment Method Processing Times</h4>
              <div className="space-y-2">
                {analyticsData.processingTimes.paymentMethodTimes.map((method, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border rounded">
                    <span className="font-medium">{method.method}</span>
                    <div className="text-right">
                      <div className="font-bold">{method.avgTime.toFixed(1)} min</div>
                      <div className="text-xs text-muted-foreground">{method.count} transactions</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
