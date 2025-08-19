
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { useChartEngine } from '@/lib/charts/ChartEngineProvider';
import { HcArea, HcPie, HcBar } from '@/components/ui/charts';
import ChartDrillDownDialog from './ChartDrillDownDialog';

interface FinancialChartsProps {
  financialData: {
    totalRevenue: number;
    pendingRevenue: number;
    completedCount: number;
    pendingCount: number;
    failedCount: number;
    paymentMethods: Array<{ method: string; count: number; amount: number }>;
    dailyRevenue: Array<{ date: string; amount: number }>;
    averageTransactionValue: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  transactions: {
    label: "Transactions", 
    color: "hsl(var(--chart-2))",
  },
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-3))",
  },
};

const FinancialCharts: React.FC<FinancialChartsProps> = ({ financialData }) => {
  const { isHighcharts } = useChartEngine();
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const handleChartClick = (point: any, series: any, type: string) => {
    let data;
    
    switch (type) {
      case 'revenue':
        data = {
          type: 'revenue' as const,
          title: 'Daily Revenue',
          value: point.y || point.amount,
          category: point.category || point.date,
          details: {
            date: point.category || point.date,
            transactions_count: Math.floor(Math.random() * 50) + 10, // Mock data
            average_transaction: ((point.y || point.amount) / (Math.floor(Math.random() * 50) + 10)).toFixed(2)
          }
        };
        break;
      case 'payment_method':
        data = {
          type: 'payment_method' as const,
          title: 'Payment Method Analysis',
          value: point.y,
          category: point.name,
          details: {
            total_transactions: financialData.paymentMethods.find(p => p.method === point.name)?.count || 0,
            percentage_of_total: ((point.y / financialData.totalRevenue) * 100).toFixed(1) + '%',
            average_amount: (point.y / (financialData.paymentMethods.find(p => p.method === point.name)?.count || 1)).toFixed(2)
          }
        };
        break;
      case 'transaction_status':
        data = {
          type: 'transaction_status' as const,
          title: 'Transaction Status Analysis',
          value: point.y || point.value,
          category: point.name || point.category,
          details: {
            status: point.name || point.category,
            total_count: point.y || point.value,
            percentage: (((point.y || point.value) / (financialData.completedCount + financialData.pendingCount + financialData.failedCount)) * 100).toFixed(1) + '%'
          }
        };
        break;
      default:
        return;
    }
    
    setDrillDownData(data);
    setDrillDownOpen(true);
  };
  
  // Process daily revenue for better chart display
  const processedDailyRevenue = financialData.dailyRevenue
    .slice(-30) // Last 30 days
    .map(item => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));

  // Status breakdown data
  const statusData = [
    { name: 'Completed', value: financialData.completedCount, color: '#00C49F' },
    { name: 'Pending', value: financialData.pendingCount, color: '#FFBB28' },
    { name: 'Failed', value: financialData.failedCount, color: '#FF8042' }
  ].filter(item => item.value > 0);

  // Highcharts data transformations
  const hcRevenueData = [{
    name: 'Revenue',
    data: processedDailyRevenue.map(item => item.amount),
    color: 'hsl(var(--chart-1))'
  }];

  const hcPaymentMethodsData = financialData.paymentMethods.map((item, index) => ({
    name: item.method,
    y: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  const hcStatusData = [{
    name: 'Transactions',
    data: statusData.map(item => item.value),
    color: 'hsl(var(--chart-2))'
  }];

  const hcPaymentVolumeData = [{
    name: 'Transaction Count',
    data: financialData.paymentMethods.map(item => item.count),
    color: 'hsl(var(--chart-3))'
  }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          <CardDescription>Daily revenue progression</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcArea
              data={hcRevenueData}
              height={300}
              title="Revenue Trend"
              xAxisTitle="Date"
              yAxisTitle="Revenue ($)"
              categories={processedDailyRevenue.map(item => item.date)}
              onPointClick={(point, series) => handleChartClick(point, series, 'revenue')}
            />
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedDailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="var(--color-revenue)" 
                    fill="var(--color-revenue)" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods Distribution</CardTitle>
          <CardDescription>Revenue by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcPie
              data={hcPaymentMethodsData}
              height={300}
              title="Payment Methods Distribution"
              showDataLabels={true}
              showLegend={true}
              onPointClick={(point, series) => handleChartClick(point, series, 'payment_method')}
            />
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financialData.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="method"
                    label={({ method, percent }) => 
                      `${method}: ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {financialData.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Transaction Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
          <CardDescription>Distribution by transaction status</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcBar
              data={hcStatusData}
              categories={statusData.map(item => item.name)}
              height={300}
              title="Transaction Status"
              xAxisTitle="Status"
              yAxisTitle="Transactions"
              onPointClick={(point, series) => handleChartClick(point, series, 'transaction_status')}
            />
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}`, 'Transactions']}
                  />
                  <Bar dataKey="value" fill="var(--color-transactions)">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Volume</CardTitle>
          <CardDescription>Transaction count by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          {isHighcharts ? (
            <HcBar
              data={hcPaymentVolumeData}
              categories={financialData.paymentMethods.map(item => item.method)}
              height={300}
              title="Payment Method Volume"
              xAxisTitle="Payment Method"
              yAxisTitle="Transaction Count"
              horizontal={true}
            />
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData.paymentMethods} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="method" type="category" width={100} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}`, 'Transactions']}
                  />
                  <Bar dataKey="count" fill="var(--color-transactions)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <ChartDrillDownDialog
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        data={drillDownData}
      />
    </div>
  );
};

export default FinancialCharts;
