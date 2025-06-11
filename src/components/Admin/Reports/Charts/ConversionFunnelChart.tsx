
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

interface ConversionStageData {
  stage: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeToNext?: number;
}

interface ConversionFunnelChartProps {
  funnelData: ConversionStageData[];
}

const FUNNEL_COLORS = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'];

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ funnelData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Conversion Funnel</CardTitle>
        <CardDescription>Track user progression through key stages with real data</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="stage" type="category" width={120} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [
                  `${Number(value).toLocaleString()} users`,
                  `${props.payload.conversionRate.toFixed(1)}% conversion rate`
                ]}
              />
              <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Enhanced Conversion Rates Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {funnelData.map((stage, index) => (
            <div key={stage.stage} className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">{stage.stage}</div>
              <div className="text-2xl font-bold mt-1">{stage.users.toLocaleString()}</div>
              <div className="text-sm text-green-600">{stage.conversionRate.toFixed(1)}% conversion</div>
              {stage.dropoffRate > 0 && (
                <div className="text-sm text-red-600">{stage.dropoffRate.toFixed(1)}% dropoff</div>
              )}
              {stage.averageTimeToNext !== undefined && (
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {stage.averageTimeToNext.toFixed(1)} days avg
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Stage Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium">Overall Conversion:</span> {
                funnelData.length > 0 && funnelData[0].users > 0
                  ? ((funnelData[funnelData.length - 1].users / funnelData[0].users) * 100).toFixed(1)
                  : '0'
              }% complete the entire funnel
            </div>
            <div>
              <span className="font-medium">Biggest Dropoff:</span> {
                funnelData.reduce((max, stage) => 
                  stage.dropoffRate > max.dropoffRate ? stage : max, 
                  { stage: 'N/A', dropoffRate: 0 }
                ).stage
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
