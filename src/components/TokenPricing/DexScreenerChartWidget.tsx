import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

interface DexScreenerChartWidgetProps {
  poolAddress: string;
  onFallback?: () => void;
}

const DexScreenerChartWidget: React.FC<DexScreenerChartWidgetProps> = ({
  poolAddress,
  onFallback
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const chartUrl = `https://dexscreener.com/polygon/${poolAddress}?embed=1&theme=dark&info=0`;
  const directUrl = `https://dexscreener.com/polygon/${poolAddress}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('[DEXSCREENER] Chart loading timeout, triggering fallback');
        setHasError(true);
        onFallback?.();
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [isLoading, onFallback]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('[DEXSCREENER] Chart loaded successfully');
  };

  const handleIframeError = () => {
    console.log('[DEXSCREENER] Chart failed to load, triggering fallback');
    setIsLoading(false);
    setHasError(true);
    onFallback?.();
  };

  const refreshChart = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = chartUrl;
    }
  };

  if (hasError) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">DexScreener Live Chart</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(directUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              View Full
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshChart}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative h-96 w-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="text-muted-foreground flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading DexScreener chart...
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={chartUrl}
            className="w-full h-full border-0 rounded-b-lg"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="fullscreen"
            title="DexScreener Chart"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DexScreenerChartWidget;