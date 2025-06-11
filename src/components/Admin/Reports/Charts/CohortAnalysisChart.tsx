
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface CohortAnalysisChartProps {
  cohortData: Array<{
    cohort: string;
    week0: number;
    week1: number;
    week2: number;
    week3: number;
    week4: number;
    totalUsers: number;
  }>;
}

const CohortAnalysisChart: React.FC<CohortAnalysisChartProps> = ({ cohortData }) => {
  // Transform data for the chart
  const chartData = cohortData.map(cohort => ({
    cohort: cohort.cohort,
    'Week 0': 100, // Always 100% at start
    'Week 1': (cohort.week1 / cohort.week0) * 100,
    'Week 2': (cohort.week2 / cohort.week0) * 100,
    'Week 3': (cohort.week3 / cohort.week0) * 100,
    'Week 4': (cohort.week4 / cohort.week0) * 100,
    totalUsers: cohort.totalUsers
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Retention Cohort Analysis</CardTitle>
        <CardDescription>User retention rates by weekly cohorts</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cohort" />
              <YAxis domain={[0, 100]} label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Retention Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="Week 1" 
                stroke="#8B5CF6" 
                strokeWidth={2} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Week 2" 
                stroke="#06B6D4" 
                strokeWidth={2} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Week 3" 
                stroke="#10B981" 
                strokeWidth={2} 
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Week 4" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Cohort Summary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Cohort</th>
                <th className="text-right p-2">Total Users</th>
                <th className="text-right p-2">Week 1</th>
                <th className="text-right p-2">Week 2</th>
                <th className="text-right p-2">Week 3</th>
                <th className="text-right p-2">Week 4</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => (
                <tr key={cohort.cohort} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{cohort.cohort}</td>
                  <td className="p-2 text-right">{cohort.totalUsers}</td>
                  <td className="p-2 text-right">{((cohort.week1 / cohort.week0) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-right">{((cohort.week2 / cohort.week0) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-right">{((cohort.week3 / cohort.week0) * 100).toFixed(1)}%</td>
                  <td className="p-2 text-right">{((cohort.week4 / cohort.week0) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortAnalysisChart;
