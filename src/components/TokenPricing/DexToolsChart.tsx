import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UNISWAP_V3_POOL } from '@/services/api/config';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TradingViewChart from './TradingViewChart';

interface DexToolsIframeProps {
  onError?: () => void;
}

const DexToolsIframe: React.FC<DexToolsIframeProps> = ({ onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const poolAddress = UNISWAP_V3_POOL;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
        onError?.();
      }
    }, 8000); // 8 second timeout for DexTools

    return () => clearTimeout(timer);
  }, [isLoading, onError]);

  const handleViewOnDexTools = () => {
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-sm text-muted-foreground">Loading DexTools chart...</div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-20 p-4">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <div className="text-sm text-muted-foreground mb-4 text-center">
            DexTools chart failed to load. Click below to view on DexTools.
          </div>
          <Button onClick={handleViewOnDexTools} size="sm" className="flex items-center gap-2">
            View on DexTools <ExternalLink size={16} />
          </Button>
        </div>
      )}
      
      <iframe 
        title="DexTools Chart" 
        src={`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}?embed=1&theme=light&chartType=1&chartResolution=15m&drawingToolbars=false`} 
        className="w-full h-[400px] sm:h-[450px] md:h-[500px] border-0" 
        allow="clipboard-write" 
        referrerPolicy="no-referrer" 
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
      
      <div className="absolute top-3 right-3 z-10">
        <Button onClick={handleViewOnDexTools} size="sm" variant="secondary" className="flex items-center gap-2 backdrop-blur-sm">
          View on DexTools <ExternalLink size={16} />
        </Button>
      </div>
    </div>
  );
};

const DexToolsChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('preferred-chart-provider') || 'tradingview';
  });
  const [tradingViewError, setTradingViewError] = useState(false);
  const [dexToolsError, setDexToolsError] = useState(false);

  // Auto-switch to DexTools if TradingView fails
  const handleTradingViewError = () => {
    setTradingViewError(true);
    if (activeTab === 'tradingview' && !dexToolsError) {
      setActiveTab('dextools');
    }
  };

  // Auto-switch to TradingView if DexTools fails
  const handleDexToolsError = () => {
    setDexToolsError(true);
    if (activeTab === 'dextools' && !tradingViewError) {
      setActiveTab('tradingview');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('preferred-chart-provider', value);
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-2">
            <TabsTrigger value="tradingview" className="flex items-center gap-2">
              TradingView
              {tradingViewError && <AlertCircle className="h-3 w-3 text-destructive" />}
            </TabsTrigger>
            <TabsTrigger value="dextools" className="flex items-center gap-2">
              DexTools
              {dexToolsError && <AlertCircle className="h-3 w-3 text-destructive" />}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tradingview" className="mt-0">
            <TradingViewChart onError={handleTradingViewError} />
          </TabsContent>
          
          <TabsContent value="dextools" className="mt-0">
            <DexToolsIframe onError={handleDexToolsError} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
export default DexToolsChart;