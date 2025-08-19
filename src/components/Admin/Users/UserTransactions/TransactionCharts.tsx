
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTransactionSummary } from '@/hooks/admin/transactions/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useChartEngine } from '@/lib/charts/ChartEngineProvider';
import { HcPie, HcBar } from '@/components/ui/charts';

interface TransactionChartsProps {
  summary: UserTransactionSummary;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const TransactionCharts: React.FC<TransactionChartsProps> = ({ summary }) => {
  const { isHighcharts } = useChartEngine();
  
  // Highcharts data transformations
  const hcPaymentMethodsData = summary.paymentMethods.map((item, index) => ({
    name: item.method,
    y: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const hcStatusData = [{
    name: 'Transactions',
    data: summary.statusBreakdown.map(item => item.count),
    color: 'hsl(var(--chart-1))'
  }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Distribution of payment methods</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {summary.paymentMethods.length > 0 ? (
            isHighcharts ? (
              <HcPie
                data={hcPaymentMethodsData}
                height={300}
                title="Payment Methods Distribution"
                showDataLabels={true}
                showLegend={true}
              />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.paymentMethods}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="method"
                      label={({ method, percent }) => 
                        `${method}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {summary.paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} transactions`, name]}
                      labelFormatter={(label) => `Payment Method`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No payment method data available
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Status</CardTitle>
          <CardDescription>Breakdown by status</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          {summary.statusBreakdown.length > 0 ? (
            isHighcharts ? (
              <HcBar
                data={hcStatusData}
                categories={summary.statusBreakdown.map(item => item.status)}
                height={300}
                title="Transaction Status Breakdown"
                xAxisTitle="Status"
                yAxisTitle="Transactions"
              />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary.statusBreakdown}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} transactions`, 'Count']}
                      labelFormatter={(label) => `Status: ${label}`}
                    />
                    <Bar dataKey="count" fill="#8884d8">
                      {summary.statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No status data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionCharts;
