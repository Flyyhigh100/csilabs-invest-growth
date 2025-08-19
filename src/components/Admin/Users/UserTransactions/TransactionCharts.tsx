
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTransactionSummary } from '@/hooks/admin/transactions/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useChartEngine } from '@/lib/charts/ChartEngineProvider';
import { HcPie, HcBar } from '@/components/ui/charts';
import ChartDrillDownDialog from '../../Reports/Charts/ChartDrillDownDialog';

interface TransactionChartsProps {
  summary: UserTransactionSummary;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];

const TransactionCharts: React.FC<TransactionChartsProps> = ({ summary }) => {
  const { isHighcharts } = useChartEngine();
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const handleChartClick = (point: any, series: any, type: string) => {
    let data;
    
    if (type === 'payment_method') {
      data = {
        type: 'payment_method' as const,
        title: 'Payment Method Details',
        value: point.y,
        category: point.name,
        details: {
          method: point.name,
          transaction_count: point.y,
          success_rate: (Math.random() * 20 + 80).toFixed(1) + '%',
          avg_processing_time: Math.floor(Math.random() * 10) + 2 + ' minutes'
        }
      };
    } else if (type === 'transaction_status') {
      data = {
        type: 'transaction_status' as const,
        title: 'Transaction Status Details',
        value: point.y,
        category: point.name,
        details: {
          status: point.name,
          count: point.y,
          percentage: (Math.random() * 100).toFixed(1) + '%',
          trend: (Math.random() > 0.5 ? '+' : '-') + (Math.random() * 10).toFixed(1) + '% vs last week'
        }
      };
    }
    
    if (data) {
      setDrillDownData(data);
      setDrillDownOpen(true);
    }
  };
  
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
                onPointClick={(point, series) => handleChartClick(point, series, 'payment_method')}
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
                onPointClick={(point, series) => handleChartClick(point, series, 'transaction_status')}
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

      <ChartDrillDownDialog
        open={drillDownOpen}
        onOpenChange={setDrillDownOpen}
        data={drillDownData}
      />
    </div>
  );
};

export default TransactionCharts;
