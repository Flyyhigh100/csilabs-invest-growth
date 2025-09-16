import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol?: string;
  onFallback?: () => void;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = "POLYGON:CSLUSDC",
  onFallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "15",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "allow_symbol_change": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "container_id": "tradingview_widget",
      "height": 400,
      "width": "100%"
    });

    script.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };

    script.onerror = () => {
      setIsLoading(false);
      setHasError(true);
      onFallback?.();
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    // Timeout fallback
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
        onFallback?.();
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, onFallback, isLoading]);

  const refreshWidget = () => {
    setIsLoading(true);
    setHasError(false);
    // Force re-render by changing the key would be handled by parent
    window.location.reload();
  };

  if (hasError) {
    return null; // Let parent component handle fallback
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-primary/20">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Professional Chart</h3>
            <p className="text-sm text-muted-foreground">
              Powered by TradingView
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshWidget}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Chart Container */}
        <div className="relative w-full h-[400px] bg-muted/30 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading professional chart...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef}
            id="tradingview_widget"
            className="w-full h-full"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Symbol:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {symbol}
            </code>
          </div>
          <a
            href={`https://www.tradingview.com/chart/?symbol=${symbol}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View on TradingView
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default TradingViewWidget;