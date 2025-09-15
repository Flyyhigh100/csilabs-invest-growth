import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradingViewChartProps {
  onError?: () => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
        onError?.();
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, onError]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  const handleViewOnTradingView = () => {
    window.open('https://www.tradingview.com/chart/?symbol=POLYGON%3ACSL_USDC', '_blank');
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
          <div className="text-sm text-muted-foreground">Loading TradingView chart...</div>
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-20 p-4">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <div className="text-sm text-muted-foreground mb-4 text-center">
            TradingView chart failed to load.
          </div>
          <Button onClick={handleViewOnTradingView} size="sm" className="flex items-center gap-2">
            View on TradingView <ExternalLink size={16} />
          </Button>
        </div>
      )}
      
      <iframe
        title="TradingView Chart"
        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=POLYGON%3ACSL_USDC&interval=15&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=0&toolbarbg=F1F3F6&studies=[]&hideideas=1&theme=light&style=1&timezone=Etc%2FUTC&withdateranges=1&hidevolume=1&allow_symbol_change=0&watchlist=[]&details=0&hotlist=0&calendar=0&news=[]&linewidth=2&linetype=0"
        className="w-full h-[400px] sm:h-[450px] md:h-[500px] border-0"
        allow="clipboard-write"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
};

export default TradingViewChart;