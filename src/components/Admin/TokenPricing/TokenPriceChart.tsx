
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info } from 'lucide-react';
import { Spinner } from "@/components/ui/spinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TokenPriceChartProps {
  priceData: any[];
  isHistoryLoading: boolean;
  refreshAllData: () => void;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({
  priceData,
  isHistoryLoading,
  refreshAllData,
}) => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Token Price History</span>
          <Button variant="outline" size="sm" onClick={refreshAllData} disabled={isHistoryLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isHistoryLoading ? 'animate-spin' : ''}`} />
            {isHistoryLoading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </CardTitle>
        <CardDescription>Historical price data for the CSi token from Defined.fi</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] relative">
        {isHistoryLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="h-8 w-8" />
            <span className="ml-2 text-gray-500">Loading price data...</span>
          </div>
        ) : priceData && priceData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={priceData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(5)}`}
              />
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(5)}`, 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Info className="h-6 w-6 text-amber-500 mr-2" />
            <span className="text-gray-500">No price data available</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenPriceChart;
