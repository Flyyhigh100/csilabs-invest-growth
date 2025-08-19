import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { updateHighchartsTheme } from './highcharts-setup';

interface ChartEngineContextType {
  engine: 'highcharts' | 'recharts';
  isHighcharts: boolean;
  isRecharts: boolean;
}

const ChartEngineContext = createContext<ChartEngineContextType | undefined>(undefined);

export const useChartEngine = () => {
  const context = useContext(ChartEngineContext);
  if (!context) {
    throw new Error('useChartEngine must be used within ChartEngineProvider');
  }
  return context;
};

interface ChartEngineProviderProps {
  children: React.ReactNode;
}

export const ChartEngineProvider: React.FC<ChartEngineProviderProps> = ({ children }) => {
  const { theme, resolvedTheme } = useTheme();
  const engine = (import.meta.env.VITE_CHARTS_ENGINE as 'highcharts' | 'recharts') || 'recharts';
  
  const isHighcharts = engine === 'highcharts';
  const isRecharts = engine === 'recharts';

  // Update Highcharts theme when theme changes
  useEffect(() => {
    if (isHighcharts) {
      const isDark = resolvedTheme === 'dark';
      updateHighchartsTheme(isDark);
    }
  }, [resolvedTheme, isHighcharts]);

  const value: ChartEngineContextType = {
    engine,
    isHighcharts,
    isRecharts
  };

  return (
    <ChartEngineContext.Provider value={value}>
      {children}
    </ChartEngineContext.Provider>
  );
};