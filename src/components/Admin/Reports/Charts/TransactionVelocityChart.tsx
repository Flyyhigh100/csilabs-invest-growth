
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Activity, Clock, DollarSign } from 'lucide-react';

interface TransactionVelocityChartProps {
  velocityData: {
    hourlyVolume: Array<{ hour: string; transactions: number; volume: number }>;
    dailyTrends: Array<{ date: string; avgProcessingTime: number; successRate: number }>;
    paymentMethodPerformance: Array<{ 
      method: string; 
      avgTime: number; 
      successRate: number; 
      volume: number 
    }>;
    peakHours: Array<{ hour: number; transactionCount: number }>;
  };
}

const TransactionVelocityChart: React.FC<TransactionVelocityChartProps> = ({ velocityData }) => {
  return (
    <div className="space-y-6">
      {/* Transaction Volume by Hour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Transaction Velocity Analysis
          </CardTitle>
          <CardDescription>Real-time transaction volume and processing patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData.hourlyVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="transactions" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                  name="Transactions"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Volume ($)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Processing Time & Success Rate Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Processing Time Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${Number(value).toFixed(1)}s`, 'Avg Processing Time']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgProcessingTime" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Success Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Performance Analysis</CardTitle>
          <CardDescription>Processing time and success rates by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Average Processing Time</h4>
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData.paymentMethodPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${Number(value).toFixed(1)}s`, 'Avg Time']}
                    />
                    <Bar dataKey="avgTime" fill="#06B6D4" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-3">Success Rate by Method</h4>
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={velocityData.paymentMethodPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis domain={[0, 100]} />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Success Rate']}
                    />
                    <Bar dataKey="successRate" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>

          {/* Performance Summary Table */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Payment Method</th>
                  <th className="text-right p-2">Avg Processing Time</th>
                  <th className="text-right p-2">Success Rate</th>
                  <th className="text-right p-2">Volume</th>
                </tr>
              </thead>
              <tbody>
                {velocityData.paymentMethodPerformance.map((method) => (
                  <tr key={method.method} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{method.method}</td>
                    <td className="p-2 text-right">{method.avgTime.toFixed(1)}s</td>
                    <td className="p-2 text-right">
                      <span className={method.successRate >= 95 ? 'text-green-600' : method.successRate >= 90 ? 'text-yellow-600' : 'text-red-600'}>
                        {method.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-right">${method.volume.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Peak Activity Hours
          </CardTitle>
          <CardDescription>Identify optimal times for system maintenance and support staffing</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}`, 'Transactions']}
                />
                <Bar dataKey="transactionCount" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionVelocityChart;
