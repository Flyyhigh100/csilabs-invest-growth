
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, TrendingUp, Users, Activity, Target, AlertCircle, Clock, Globe, Eye, Bug } from 'lucide-react';
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
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const { includeTestData } = useTestDataToggle();
  const queryClient = useQueryClient();

  // Force a unique query key to clear cache
  const cacheKey = `advanced-analytics-no-kyc-${Date.now()}`;

  const { data: analyticsData, isLoading, refetch, error } = useQuery({
    queryKey: [cacheKey, timeRange, includeTestData],
    queryFn: async () => {
      console.log('🔄 Fetching complete real analytics data without KYC stages...');
      
      try {
        // Clear any existing cache for analytics queries
        await queryClient.invalidateQueries({ queryKey: ['advanced-analytics'] });
        
        // Fetch all real data analytics
        const [
          funnelDataRaw,
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

        console.log('✅ Raw funnel data returned:', funnelDataRaw);
        console.log('✅ Real time data:', realTimeData);
        console.log('✅ Velocity data:', velocityData);

        // Transform ConversionStageData to ConversionFunnelData by adding descriptions
        const funnelData = funnelDataRaw.map(stage => ({
          stage: stage.stage,
          users: stage.users,
          description: getStageDescription(stage.stage)
        }));

        console.log('✅ Transformed funnel data:', funnelData);
        console.log('✅ All real analytics data fetched successfully (KYC stages removed)');

        const result = {
          funnelData,
          cohortData,
          historicalData,
          predictedData,
          velocityData,
          processingTimes,
          geographicData,
          realTimeData
        };

        console.log('📊 Final analytics result:', result);
        return result;
      } catch (error) {
        console.error('❌ Error fetching complete analytics data:', error);
        toast.error('Failed to fetch analytics data');
        throw error;
      }
    },
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2,
    staleTime: 0, // Force fresh data
    gcTime: 0, // Don't cache (replaced cacheTime)
  });

  // Helper function to get meaningful descriptions for each stage (KYC stages removed)
  const getStageDescription = (stage: string): string => {
    switch (stage) {
      case 'Registration':
        return 'Users who have created an account on the platform';
      case 'Wallet Address Saved':
        return 'Users who have provided and saved their wallet address';
      case 'First Purchase':
        return 'Users who have completed their first token purchase';
      case 'Token Received':
        return 'Users who have successfully received their purchased tokens';
      default:
        return 'User conversion stage in the platform journey';
    }
  };

  // Force refresh function with cache clearing
  const handleForceRefresh = async () => {
    console.log('🔄 Force refreshing analytics data and clearing cache...');
    await queryClient.invalidateQueries({ queryKey: ['advanced-analytics'] });
    await queryClient.removeQueries({ queryKey: ['advanced-analytics'] });
    refetch();
    toast.success('Analytics data refreshed successfully');
  };

  // Data validation helper
  const validateData = (data: any, name: string) => {
    if (!data) {
      console.warn(`⚠️ ${name} data is null or undefined`);
      return false;
    }
    if (Array.isArray(data) && data.length === 0) {
      console.warn(`⚠️ ${name} data is empty array`);
      return false;
    }
    console.log(`✅ ${name} data is valid:`, data);
    return true;
  };

  if (error) {
    console.error('❌ Analytics query error:', error);
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
              onClick={() => handleForceRefresh()} 
              variant="outline" 
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Refresh
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
    <div className="space-y-8">
      {/* Controls Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-wrap">
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
          <Button variant="outline" onClick={handleForceRefresh} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Refresh Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            <Bug className="h-4 w-4 mr-2" />
            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {includeTestData ? 'Including test data' : 'Production data only'}
        </div>
      </div>

      {/* Debug Information */}
      {showDebugInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <strong>Data Validation Status:</strong>
                <ul className="mt-2 space-y-1">
                  <li>✅ Funnel Data: {validateData(analyticsData?.funnelData, 'Funnel') ? 'Valid' : 'Invalid'}</li>
                  <li>✅ Real Time Data: {validateData(analyticsData?.realTimeData, 'RealTime') ? 'Valid' : 'Invalid'}</li>
                  <li>✅ Cohort Data: {validateData(analyticsData?.cohortData, 'Cohort') ? 'Valid' : 'Invalid'}</li>
                  <li>✅ Velocity Data: {validateData(analyticsData?.velocityData, 'Velocity') ? 'Valid' : 'Invalid'}</li>
                </ul>
              </div>
              {analyticsData && (
                <div>
                  <strong>Raw Data Structure:</strong>
                  <pre className="mt-2 p-2 bg-white rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(analyticsData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Real Data Notice - Updated */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-800">
            <Target className="h-5 w-5" />
            <span className="font-medium">100% Real Data Analytics (KYC Stages Removed)</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            All analytics now use actual data from your database with KYC stages removed from the conversion funnel. Shows only: Registration → Wallet Address Saved → First Purchase → Token Received.
          </p>
        </CardContent>
      </Card>

      {/* Enhanced Interactive Data Explorer - More Prominent */}
      <Card className="border-4 border-primary bg-gradient-to-br from-primary/10 via-primary/5 to-background shadow-2xl">
        <CardHeader className="bg-primary/10 border-b-2 border-primary/20">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-primary">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            🔍 Interactive Data Explorer
          </CardTitle>
          <CardDescription className="text-lg text-foreground/90 font-medium">
            Click on any chart, metric, or data point below to explore detailed insights and drill down into specific data segments.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-3 border-blue-300 rounded-2xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-400 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-3 text-xl">
                🔍 Live Activity Feed
                <Activity className="h-6 w-6" />
              </h4>
              <p className="text-blue-700 leading-relaxed">
                Click on any activity in the real-time feed to see detailed transaction or user information with full context and history.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-3 border-green-300 rounded-2xl hover:from-green-100 hover:to-green-200 hover:border-green-400 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
              <h4 className="font-bold text-green-800 mb-4 flex items-center gap-3 text-xl">
                📊 Interactive Charts
                <TrendingUp className="h-6 w-6" />
              </h4>
              <p className="text-green-700 leading-relaxed">
                Click on chart segments, bars, or regions to drill down into specific data points and explore underlying trends.
              </p>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-3 border-purple-300 rounded-2xl hover:from-purple-100 hover:to-purple-200 hover:border-purple-400 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
              <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-3 text-xl">
                📈 Metric Details
                <Target className="h-6 w-6" />
              </h4>
              <p className="text-purple-700 leading-relaxed">
                Click on metric cards to see detailed breakdowns, historical trends, and comparative analysis data.
              </p>
            </div>
          </div>
          
          {/* Prominent Call-to-Action */}
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/20 via-primary/15 to-primary/20 border-3 border-primary/40 rounded-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="text-3xl animate-pulse">✨</span>
                <span className="font-bold text-primary text-2xl">Interactive Features Active</span>
                <span className="text-3xl animate-pulse">✨</span>
              </div>
              <p className="text-primary/90 font-semibold text-lg">
                All charts, metrics, and data points below are clickable for detailed exploration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section with Error Boundaries */}
      <div className="space-y-8">
        {/* Real-Time Dashboard */}
        {analyticsData?.realTimeData ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-600" />
              Real-Time Dashboard
            </h3>
            <RealTimeDashboardChart realTimeData={analyticsData.realTimeData} />
          </div>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Real-Time Dashboard Not Available</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Real-time data is not currently available. This may be due to insufficient data or a temporary issue.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Conversion Funnel with Real Data */}
        {analyticsData?.funnelData && analyticsData.funnelData.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Conversion Funnel Analysis
            </h3>
            <ConversionFunnelChart funnelData={analyticsData.funnelData} />
          </div>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Conversion Funnel Not Available</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Funnel data is not currently available. Data: {JSON.stringify(analyticsData?.funnelData)}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Real Cohort Analysis */}
        {analyticsData?.cohortData ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              Cohort Analysis
            </h3>
            <CohortAnalysisChart cohortData={analyticsData.cohortData} />
          </div>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Cohort Analysis Not Available</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Predictive Analytics with Real Data */}
        {analyticsData?.historicalData && analyticsData?.predictedData ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Predictive Analytics
            </h3>
            <PredictiveAnalyticsChart 
              historicalData={analyticsData.historicalData}
              predictedData={analyticsData.predictedData}
            />
          </div>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Predictive Analytics Not Available</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Velocity with Real Data */}
        {analyticsData?.velocityData ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-orange-600" />
              Transaction Velocity
            </h3>
            <TransactionVelocityChart velocityData={analyticsData.velocityData} />
          </div>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Transaction Velocity Not Available</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Geographic Analytics with Real Data */}
        {analyticsData?.geographicData ? (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="h-6 w-6 text-indigo-600" />
              Geographic Analytics
            </h3>
            <GeographicAnalyticsChart geographicData={analyticsData.geographicData} />
          </div>
        ) : (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Geographic Analytics Not Available</span>
              </div>
            </CardContent>
          </Card>
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

      {/* Bottom Spacing for Better Scrolling */}
      <div className="h-16"></div>
    </div>
  );
};

export default AdvancedAnalytics;
