import React, { useRef, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Loader2 } from 'lucide-react';

export interface HcBaseProps {
  options: Highcharts.Options;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  height?: number;
  className?: string;
}

const HcBase: React.FC<HcBaseProps> = ({
  options,
  loading = false,
  error = false,
  errorMessage = 'Error loading chart',
  height = 300,
  className = ''
}) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  // Update chart on options change
  useEffect(() => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.update(options, true);
    }
  }, [options]);

  if (loading) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height: `${height}px` }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`flex items-center justify-center text-muted-foreground ${className}`}
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <p className="font-medium">Chart Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <HighchartsReact
        ref={chartRef}
        highcharts={Highcharts}
        options={{
          ...options,
          chart: {
            ...options.chart,
            height: height
          }
        }}
      />
    </div>
  );
};

export default HcBase;