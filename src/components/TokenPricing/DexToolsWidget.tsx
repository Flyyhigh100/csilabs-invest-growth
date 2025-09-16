import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

interface DexToolsWidgetProps {
  pairAddress?: string;
  className?: string;
}

const DexToolsWidget: React.FC<DexToolsWidgetProps> = ({ 
  pairAddress = '0xb85372c56884a906ab33c0e99fea572c7c6ad7eb',
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const widgetUrl = `https://www.dextools.io/widget-chart/en/polygon/pe-light/${pairAddress}?theme=dark&chartType=1&chartResolution=30`;
  const fullDexToolsUrl = `https://www.dextools.io/app/en/polygon/pair-explorer/${pairAddress}`;

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleViewOnDexTools = () => {
    window.open(fullDexToolsUrl, '_blank');
  };

  if (hasError) {
    return (
      <Card className={`border-destructive/20 bg-destructive/5 ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Chart Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Unable to load the DEXTools chart widget. This may be due to network issues or browser restrictions.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={handleViewOnDexTools}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in DEXTools
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Trading Chart</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewOnDexTools}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open Full Chart
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[600px] rounded-lg overflow-hidden bg-muted/20">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="animate-pulse text-muted-foreground">
                Loading DEXTools chart...
              </div>
            </div>
          )}
          <iframe
            key={refreshKey}
            src={widgetUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            title="DEXTools Chart Widget"
          />
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Live trading data powered by DEXTools. Chart updates automatically with real-time price and volume data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DexToolsWidget;