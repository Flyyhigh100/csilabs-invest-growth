import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface DexToolsChartWidgetProps {
  poolAddress?: string;
  onFallback?: () => void;
}

const DexToolsChartWidget: React.FC<DexToolsChartWidgetProps> = ({
  poolAddress = "0xb85372c56884a906ab33c0e99fea572c7c6ad7eb",
  onFallback
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [copied, setCopied] = useState(false);

  const dexToolsUrl = `https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`;
  const widgetUrl = `https://www.dextools.io/widget-chart/en/polygon/pe-light/${poolAddress}?theme=light&chartType=2&chartResolution=30&drawingToolbars=false&tvPlatformColor=1a1b23&tvPaneColor=262633&headerColor=1a1b23`;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
        onFallback?.();
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, onFallback]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    onFallback?.();
  };

  const copyPoolAddress = async () => {
    try {
      await navigator.clipboard.writeText(poolAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Pool address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const refreshChart = () => {
    setIsLoading(true);
    setHasError(false);
    // Force iframe reload by changing key
    const iframe = document.querySelector('#dextools-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
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
            <h3 className="text-lg font-semibold text-foreground">Live Chart</h3>
            <p className="text-sm text-muted-foreground">
              Real-time data from DexTools
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshChart}
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
                <p className="text-sm text-muted-foreground">Loading live chart...</p>
              </div>
            </div>
          )}
          
          <iframe
            id="dextools-iframe"
            src={widgetUrl}
            width="100%"
            height="100%"
            style={{ border: 'none' }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            allow="clipboard-read; clipboard-write; web-share"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-full"
          />
        </div>

        {/* Pool Address & Verification */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Pool:</span>
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
              {poolAddress.slice(0, 8)}...{poolAddress.slice(-6)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyPoolAddress}
              className="h-6 w-6 p-0"
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
          <a
            href={dexToolsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
          >
            View on DexTools
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </Card>
  );
};

export default DexToolsChartWidget;