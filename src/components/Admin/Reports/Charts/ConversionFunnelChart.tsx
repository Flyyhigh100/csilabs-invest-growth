
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

interface ConversionFunnelChartProps {
  funnelData: Array<{
    stage: string;
    users: number;
    conversionRate: number;
    dropoffRate: number;
  }>;
}

const FUNNEL_COLORS = ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'];

const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({ funnelData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Conversion Funnel</CardTitle>
        <CardDescription>Track user progression through key stages</CardDescription>
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
                  `${props.payload.conversionRate}% conversion rate`
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
        
        {/* Conversion Rates Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {funnelData.map((stage, index) => (
            <div key={stage.stage} className="text-center p-3 border rounded-lg">
              <div className="text-sm font-medium text-muted-foreground">{stage.stage}</div>
              <div className="text-2xl font-bold mt-1">{stage.users.toLocaleString()}</div>
              <div className="text-sm text-green-600">{stage.conversionRate}% conversion</div>
              {stage.dropoffRate > 0 && (
                <div className="text-sm text-red-600">{stage.dropoffRate}% dropoff</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversionFunnelChart;
