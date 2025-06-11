
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle, Target, BarChart3 } from 'lucide-react';

interface HistoricalData {
  period: string;
  actualRevenue: number;
  actualUsers: number;
}

interface PredictedData {
  period: string;
  predictedRevenue: number;
  predictedUsers: number;
  confidence: number;
}

interface PredictiveAnalyticsChartProps {
  historicalData: HistoricalData[];
  predictedData: PredictedData[];
}

const PredictiveAnalyticsChart: React.FC<PredictiveAnalyticsChartProps> = ({ 
  historicalData, 
  predictedData 
}) => {
  // Combine historical and predicted data
  const combinedData = [
    ...historicalData.map(d => ({
      period: d.period,
      actualRevenue: d.actualRevenue,
      actualUsers: d.actualUsers,
      predictedRevenue: null,
      predictedUsers: null,
      confidence: null,
      isPredicted: false
    })),
    ...predictedData.map(d => ({
      period: d.period,
      actualRevenue: null,
      actualUsers: null,
      predictedRevenue: d.predictedRevenue,
      predictedUsers: d.predictedUsers,
      confidence: d.confidence,
      isPredicted: true
    }))
  ];

  const totalPredictedRevenue = predictedData.reduce((sum, d) => sum + d.predictedRevenue, 0);
  const avgConfidence = predictedData.reduce((sum, d) => sum + d.confidence, 0) / predictedData.length;
  
  // Calculate growth trend
  const lastHistoricalRevenue = historicalData.slice(-3).reduce((sum, d) => sum + d.actualRevenue, 0);
  const growthTrend = lastHistoricalRevenue > 0 ? ((totalPredictedRevenue / lastHistoricalRevenue) * 100 - 100) : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Forecasting (Real Data Analysis)
          </CardTitle>
          <CardDescription>
            Predicted revenue based on historical transaction trends and linear regression analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Predicted Revenue (Next 3 Months)</div>
              <div className="text-2xl font-bold text-green-600">
                ${totalPredictedRevenue.toLocaleString()}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Forecast Confidence</div>
              <div className="text-2xl font-bold">
                {avgConfidence.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Growth Trend</div>
              <div className={`text-2xl font-bold ${growthTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growthTrend >= 0 ? '+' : ''}{growthTrend.toFixed(1)}%
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Data Points</div>
              <div className="text-2xl font-bold text-blue-600">
                {historicalData.length}
              </div>
            </div>
          </div>

          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    typeof value === 'number' ? `$${value.toLocaleString()}` : 'N/A',
                    name === 'actualRevenue' ? 'Actual Revenue' : 'Predicted Revenue'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualRevenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Actual Revenue"
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedRevenue" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Revenue"
                  connectNulls={false}
                />
                <ReferenceLine 
                  x={historicalData[historicalData.length - 1]?.period} 
                  stroke="#666" 
                  strokeDasharray="2 2" 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* User Growth Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Predictions</CardTitle>
          <CardDescription>Forecasted user acquisition based on historical patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    typeof value === 'number' ? value.toLocaleString() : 'N/A',
                    name === 'actualUsers' ? 'Actual Users' : 'Predicted Users'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualUsers" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Actual Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="predictedUsers" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Users"
                />
                <ReferenceLine 
                  x={historicalData[historicalData.length - 1]?.period} 
                  stroke="#666" 
                  strokeDasharray="2 2" 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Enhanced Risk Assessment & Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Data-Driven Insights & Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Model Accuracy
              </h4>
              <p className="text-sm text-blue-700">
                Confidence levels are calculated based on historical data variance. 
                Higher confidence indicates more stable revenue patterns.
              </p>
            </div>
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Growth Opportunities
              </h4>
              <p className="text-sm text-green-700">
                {growthTrend > 0 
                  ? `Positive growth trend detected. Consider scaling marketing efforts.`
                  : `Growth opportunities available. Review conversion funnel for improvements.`
                }
              </p>
            </div>
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Seasonal Patterns</h4>
              <p className="text-sm text-yellow-700">
                {historicalData.length >= 6 
                  ? `Analyzing ${historicalData.length} months of data to identify seasonal trends.`
                  : `More historical data needed for accurate seasonal pattern analysis.`
                }
              </p>
            </div>
            <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Prediction Quality</h4>
              <p className="text-sm text-purple-700">
                Based on linear regression analysis of actual transaction data. 
                Predictions become more accurate with more historical data points.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAnalyticsChart;
