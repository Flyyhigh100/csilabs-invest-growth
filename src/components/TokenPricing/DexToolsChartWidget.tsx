import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [useProxy, setUseProxy] = useState(false);

  const dexToolsUrl = `https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`;
  const directWidgetUrl = `https://www.dextools.io/widget-chart/en/polygon/pe-light/${poolAddress}?theme=light&chartType=2&chartResolution=30&drawingToolbars=false`;
  
  // Use proxy URL when direct embedding fails
  const getProxyWidgetUrl = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('crypto-price-proxy', {
        body: {
          source: 'dextools',
          method: 'GET',
          url: directWidgetUrl
        }
      });
      
      if (error) {
        console.error('[DEXTOOLS] Proxy error:', error);
        return null;
      }
      
      // Create blob URL for the proxied content
      const blob = new Blob([data], { type: 'text/html' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('[DEXTOOLS] Proxy request failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !useProxy) {
        console.log('[DEXTOOLS] Direct embedding failed, trying proxy...');
        setUseProxy(true);
        setIsLoading(true);
      } else if (isLoading && useProxy) {
        console.log('[DEXTOOLS] Proxy embedding also failed, falling back...');
        setHasError(true);
        setIsLoading(false);
        onFallback?.();
      }
    }, 8000); // 8 second timeout for each attempt

    return () => clearTimeout(timer);
  }, [isLoading, useProxy, onFallback]);

  const handleIframeLoad = () => {
    console.log('[DEXTOOLS] Chart loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    console.log('[DEXTOOLS] Iframe error occurred');
    if (!useProxy) {
      console.log('[DEXTOOLS] Trying proxy approach...');
      setUseProxy(true);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setHasError(true);
      onFallback?.();
    }
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
    setUseProxy(false); // Reset to try direct first
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
          
          <DexToolsIframe
            useProxy={useProxy}
            directUrl={directWidgetUrl}
            poolAddress={poolAddress}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
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
            {useProxy && (
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded">
                Proxy Mode
              </span>
            )}
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

// Separate iframe component to handle proxy logic
const DexToolsIframe: React.FC<{
  useProxy: boolean;
  directUrl: string;
  poolAddress: string;
  onLoad: () => void;
  onError: () => void;
}> = ({ useProxy, directUrl, poolAddress, onLoad, onError }) => {
  const [proxyUrl, setProxyUrl] = useState<string | null>(null);

  useEffect(() => {
    if (useProxy && !proxyUrl) {
      const getProxyUrl = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('crypto-price-proxy', {
            body: {
              source: 'dextools',
              method: 'GET',
              url: directUrl
            }
          });
          
          if (error) {
            console.error('[DEXTOOLS] Proxy error:', error);
            onError();
            return;
          }
          
          // Create blob URL for the proxied content
          const blob = new Blob([data], { type: 'text/html' });
          const blobUrl = URL.createObjectURL(blob);
          setProxyUrl(blobUrl);
        } catch (error) {
          console.error('[DEXTOOLS] Proxy request failed:', error);
          onError();
        }
      };
      
      getProxyUrl();
    }
  }, [useProxy, proxyUrl, directUrl, onError]);

  const iframeSrc = useProxy ? proxyUrl : directUrl;
  
  if (useProxy && !proxyUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading via proxy...</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      key={useProxy ? 'proxy' : 'direct'}
      id="dextools-iframe"
      src={iframeSrc || directUrl}
      width="100%"
      height="100%"
      style={{ border: 'none' }}
      onLoad={onLoad}
      onError={onError}
      allow="clipboard-read; clipboard-write; web-share"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
      referrerPolicy="strict-origin-when-cross-origin"
      className="w-full h-full"
    />
  );
};

export default DexToolsChartWidget;