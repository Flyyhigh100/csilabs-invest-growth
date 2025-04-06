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
    label: "Volume (USD)",
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
  
  const { payload, label } = props;
  
  return (
    <div className="custom-tooltip bg-white p-3 border border-gray-200 rounded-md shadow-md text-sm">
      <p className="font-medium">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center justify-between mt-1">
          <span className="text-gray-600">{entry.name === 'price' ? 'Price:' : 'Volume:'}</span>
          <span className="font-medium ml-2">
            {entry.name === 'price' 
              ? `$${entry.value.toFixed(8)}` 
              : `$${entry.value.toLocaleString()}`}
          </span>
        </div>
      ))}
    </div>
  );
};

// Custom tick formatter for X-axis to show dates appropriately
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

// Filter data points to prevent overcrowding on small screens
const filterDataPoints = (data: any[], maxPoints = 60) => {
  if (!data || data.length <= maxPoints) return data;
  
  const step = Math.ceil(data.length / maxPoints);
  return data.filter((_, index) => index % step === 0);
};

interface PriceChartProps {
  priceData: TokenPriceData[];
  isLoading: boolean;
  hasError: boolean;
}

export const PriceChart: React.FC<PriceChartProps> = ({ priceData, isLoading, hasError }) => {  
  // Filter data points to prevent chart overcrowding
  const displayData = React.useMemo(() => filterDataPoints(priceData), [priceData]);
  
  // Calculate interval based on data length to prevent overcrowding
  const calculateTickInterval = () => {
    const dataLength = displayData?.length || 0;
    
    if (dataLength <= 7) return 1; // Show every other tick for a week
    if (dataLength <= 15) return 2; // Show every third tick for two weeks
    if (dataLength <= 30) return 3; // Show every fourth tick for a month
    if (dataLength <= 60) return 5; // Show every 6th tick for two months
    
    return Math.max(7, Math.ceil(dataLength / 10)); // Show about 10 ticks for larger datasets
  };
  
  // Calculate Y-axis domain to ensure a good view of the data
  const calculateYDomain = () => {
    if (!displayData || displayData.length === 0) return ['auto', 'auto'];
    
    const prices = displayData.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    // Add 5% padding to top and bottom
    const padding = (max - min) * 0.05;
    const yMin = Math.max(0, min - padding); // Don't go below zero
    const yMax = max + padding;
    
    return [yMin, yMax];
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
      ) : displayData && displayData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={<CustomizedXAxisTick />}
              interval={calculateTickInterval()}
              minTickGap={15}
              height={30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toFixed(5)}`}
              tick={{ fontSize: 10 }}
              domain={calculateYDomain()}
              allowDecimals={true}
              width={60}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              name="price"
              stroke="#0BC5EA" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#0BC5EA", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
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
  // Filter data points to prevent chart overcrowding
  const displayData = React.useMemo(() => filterDataPoints(volumeData), [volumeData]);
  
  // Calculate interval based on data length to prevent overcrowding
  const calculateTickInterval = () => {
    const dataLength = displayData?.length || 0;
    
    if (dataLength <= 7) return 1; // Show every other tick for a week
    if (dataLength <= 15) return 2; // Show every third tick for two weeks
    if (dataLength <= 30) return 3; // Show every fourth tick for a month
    if (dataLength <= 60) return 5; // Show every 6th tick for two months
    
    return Math.max(7, Math.ceil(dataLength / 10)); // Show about 10 ticks for larger datasets
  };
  
  // Calculate Y-axis domain to ensure a good view of the data
  const calculateYDomain = () => {
    if (!displayData || displayData.length === 0) return ['auto', 'auto'];
    
    const volumes = displayData.map(d => d.volume);
    const min = Math.min(...volumes);
    const max = Math.max(...volumes);
    
    // Add 10% padding to top
    const padding = max * 0.1;
    return [0, max + padding]; // Volume should start at 0
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
      ) : displayData && displayData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={<CustomizedXAxisTick />}
              interval={calculateTickInterval()}
              minTickGap={15}
              height={30}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              tick={{ fontSize: 10 }}
              domain={calculateYDomain()}
              width={60}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="volume" 
              name="volume"
              stroke="#1A365D" 
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#1A365D", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          No volume data available
        </div>
      )}
    </div>
  );
};
