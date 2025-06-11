
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

interface TokenDistributionChartsProps {
  tokenData: {
    totalTokensDistributed: number;
    pendingDistribution: number;
    distributionByNetwork: Array<{ network: string; amount: number; count: number }>;
    monthlyDistribution: Array<{ month: string; tokens: number; value: number }>;
    distributionStatus: Array<{ status: string; count: number; percentage: number }>;
    averageTokensPerUser: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const chartConfig = {
  tokens: {
    label: "Tokens",
    color: "hsl(var(--chart-1))",
  },
  value: {
    label: "Value (USD)",
    color: "hsl(var(--chart-2))",
  },
  distribution: {
    label: "Distribution",
    color: "hsl(var(--chart-3))",
  },
};

const TokenDistributionCharts: React.FC<TokenDistributionChartsProps> = ({ tokenData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Network Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Token Distribution by Network</CardTitle>
          <CardDescription>Breakdown of tokens distributed across networks</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tokenData.distributionByNetwork}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="network"
                  label={({ network, percent }) => 
                    `${network}: ${(percent * 100).toFixed(1)}%`
                  }
                >
                  {tokenData.distributionByNetwork.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${Number(value).toLocaleString()}`, 'Tokens']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Monthly Distribution Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Token Distribution</CardTitle>
          <CardDescription>Tokens distributed and USD value over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenData.monthlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="var(--color-tokens)" 
                  fill="var(--color-tokens)"
                  fillOpacity={0.6}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--color-value)" 
                  fill="var(--color-value)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Distribution Status */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution Status</CardTitle>
          <CardDescription>Current status of token distributions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenData.distributionStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}`, 'Distributions']}
                />
                <Bar dataKey="count" fill="var(--color-distribution)">
                  {tokenData.distributionStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Network Transaction Count */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions by Network</CardTitle>
          <CardDescription>Number of transactions per network</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenData.distributionByNetwork} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="network" type="category" width={100} />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value) => [`${value}`, 'Transactions']}
                />
                <Bar dataKey="count" fill="var(--color-tokens)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenDistributionCharts;
