import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import GeckoTerminalWidget from './GeckoTerminalWidget';
import CoinBrainWidget from './CoinBrainWidget';

interface MultiSourceChartWidgetProps {
  poolAddress?: string;
  symbol?: string;
}

const MultiSourceChartWidget: React.FC<MultiSourceChartWidgetProps> = ({
  poolAddress = "0xb85372c56884a906ab33c0e99fea572c7c6ad7eb",
  symbol = "POLYGON:CSLUSDC"
}) => {
  const [activeFallback, setActiveFallback] = useState(false);
  const [showUltimateFailure, setShowUltimateFailure] = useState(false);

  const handleTradingViewFallback = () => {
    console.log('TradingView failed, switching to GeckoTerminal');
    setActiveFallback(true);
  };

  const handleGeckoTerminalFallback = () => {
    console.log('GeckoTerminal failed, showing external links');
    setShowUltimateFailure(true);
  };

  // Ultimate fallback - external links
  if (showUltimateFailure) {
    return (
      <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-primary/20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Charts temporarily unavailable
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              View live charts on external platforms
            </p>
          </div>

          <div className="grid gap-3 max-w-md mx-auto">
            <Button 
              variant="outline" 
              className="w-full justify-between"
              asChild
            >
              <a
                href={`https://www.tradingview.com/chart/?symbol=${symbol}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View on TradingView</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              asChild
            >
              <a
                href={`https://www.geckoterminal.com/polygon/pools/${poolAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View on GeckoTerminal</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-between"
              asChild
            >
              <a
                href={`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View on DexTools</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="professional" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="professional">Professional Chart</TabsTrigger>
          <TabsTrigger value="dex">DEX Chart</TabsTrigger>
          <TabsTrigger value="coinbrain">Live Trades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="professional" className="space-y-4">
          <TradingViewWidget 
            symbol={symbol}
            onFallback={handleTradingViewFallback}
          />
        </TabsContent>

        <TabsContent value="dex" className="space-y-4">
          {activeFallback ? (
            <GeckoTerminalWidget 
              poolAddress={poolAddress}
              onFallback={handleGeckoTerminalFallback}
            />
          ) : (
            <TradingViewWidget 
              symbol={symbol}
              onFallback={handleTradingViewFallback}
            />
          )}
        </TabsContent>

        <TabsContent value="coinbrain" className="space-y-4">
          <CoinBrainWidget 
            contractAddress={poolAddress}
            onFallback={handleGeckoTerminalFallback}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiSourceChartWidget;