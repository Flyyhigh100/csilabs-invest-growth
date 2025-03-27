
import React from 'react';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { TokenPriceData, TokenVolumeData } from '@/types/token';

// Chart configuration for styling
const chartConfig = {
  price: {
    label: "Price (USD)",
    theme: {
      light: "#0BC5EA",
      dark: "#0BC5EA"
    }
  },
  volume: {
    label: "Volume",
    theme: {
      light: "#1A365D",
      dark: "#1A365D"
    }
  }
};

// Custom tooltip component that satisfies Recharts' typing requirements
const CustomTooltip = (props: any) => {
  if (!props.active || !props.payload || props.payload.length === 0) {
    return null;
  }
  return <ChartTooltipContent {...props} />;
};

// Custom tick formatter for X-axis to show year appropriately
const CustomizedXAxisTick = ({ x, y, payload }: any) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text 
        x={0} 
        y={0} 
        dy={16} 
        textAnchor="middle" 
        fill="#666" 
        fontSize={10}
      >
        {payload.value}
      </text>
    </g>
  );
};

interface PriceChartProps {
  priceData: TokenPriceData[];
  isLoading: boolean;
  hasError: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ priceData, isLoading, hasError }) => {
  const isMultiYear = priceData && priceData.length > 0 && priceData[0].date.includes('2021');
  
  // Calculate interval based on data length
  const calculateTickInterval = () => {
    if (priceData.length <= 12) return 0; // Show all ticks for 12 or fewer data points
    if (priceData.length <= 24) return 1; // Show every other tick for up to 24 data points
    return Math.ceil(priceData.length / 12); // Aim for ~12 ticks for larger datasets
  };
  
  return (
    <div className="h-48 w-full">
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-cbis-blue animate-spin" />
        </div>
      ) : hasError ? (
        <div className="h-full w-full flex items-center justify-center text-red-500">
          Error loading data
        </div>
      ) : priceData && priceData.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={priceData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tick={<CustomizedXAxisTick />}
              interval={calculateTickInterval()}
              minTickGap={15}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(5)}`}
              tick={{ fontSize: 10 }}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              name="price"
              stroke="#0BC5EA" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          No price data available
        </div>
      )}
    </div>
  );
};

interface VolumeChartProps {
  volumeData: TokenVolumeData[];
  isLoading: boolean;
  hasError: boolean;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ volumeData, isLoading, hasError }) => {
  // Calculate interval based on data length
  const calculateTickInterval = () => {
    if (volumeData.length <= 12) return 0; // Show all ticks for 12 or fewer data points
    if (volumeData.length <= 24) return 1; // Show every other tick for up to 24 data points
    return Math.ceil(volumeData.length / 12); // Aim for ~12 ticks for larger datasets
  };
  
  return (
    <div className="h-48 w-full">
      {isLoading ? (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-cbis-blue animate-spin" />
        </div>
      ) : hasError ? (
        <div className="h-full w-full flex items-center justify-center text-red-500">
          Error loading data
        </div>
      ) : volumeData && volumeData.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-full w-full">
          <LineChart data={volumeData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tick={<CustomizedXAxisTick />}
              interval={calculateTickInterval()}
              minTickGap={15}
            />
            <YAxis 
              tickFormatter={(value) => value.toLocaleString()}
              tick={{ fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="volume" 
              name="volume"
              stroke="#1A365D" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          No volume data available
        </div>
      )}
    </div>
  );
};
