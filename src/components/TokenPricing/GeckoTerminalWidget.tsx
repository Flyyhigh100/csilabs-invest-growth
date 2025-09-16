import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface GeckoTerminalWidgetProps {
  poolAddress?: string;
  onFallback?: () => void;
}

const GeckoTerminalWidget: React.FC<GeckoTerminalWidgetProps> = ({
  poolAddress = "0xb85372c56884a906ab33c0e99fea572c7c6ad7eb",
  onFallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.geckoterminal.com/dext/embeds.js';
    script.async = true;

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
    }, 8000);

    return () => {
      clearTimeout(timer);
      if (containerRef.current && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [poolAddress, onFallback, isLoading]);

  const refreshWidget = () => {
    setIsLoading(true);
    setHasError(false);
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
            <h3 className="text-lg font-semibold text-foreground">DEX Chart</h3>
            <p className="text-sm text-muted-foreground">
              Powered by GeckoTerminal
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
        <div className="relative w-full h-[600px] bg-muted/30 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-center space-y-2">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading DEX chart...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={containerRef}
            className="w-full h-full"
          />
          
          <div 
            data-geckoterminal-chart
            data-chain="polygon"
            data-pool={poolAddress}
            data-theme="dark"
            data-currency="usd"
            className="w-full h-full"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Pool:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {poolAddress?.slice(0, 6)}...{poolAddress?.slice(-4)}
            </code>
          </div>
          <a
            href={`https://www.geckoterminal.com/polygon/pools/${poolAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View on GeckoTerminal
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default GeckoTerminalWidget;