import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UNISWAP_V3_POOL } from '@/services/api/config';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
const DexToolsChart: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Use the V3 pool from our config
  const poolAddress = UNISWAP_V3_POOL;
  
  const handleViewOnDexTools = () => {
    // Open in a new tab when clicked
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-0 h-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
            <div className="text-sm text-muted-foreground">Loading chart...</div>
          </div>
        )}
        
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 z-20 p-4">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <div className="text-sm text-muted-foreground mb-4 text-center">
              Chart failed to load. Click below to view on DexTools.
            </div>
            <Button onClick={handleViewOnDexTools} size="sm" className="flex items-center gap-2">
              View on DexTools <ExternalLink size={16} />
            </Button>
          </div>
        )}
        
        <iframe 
          title="DexTools Chart" 
          src={`https://www.dextools.io/widget-chart/en/polygon/pe-light/${poolAddress}?theme=light&chartType=1&chartResolution=15m&drawingToolbars=false`} 
          className="w-full h-[400px] sm:h-[450px] md:h-[500px] border-0" 
          allow="clipboard-write" 
          referrerPolicy="no-referrer" 
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
        
        {/* Moved button to top-right with semi-transparent background */}
        <div className="absolute top-3 right-3 z-10 py-0 px-[44px]">
          <Button onClick={handleViewOnDexTools} size="sm" className="flex items-center gap-2 text-black border border-gray-200 backdrop-blur-sm bg-cyan-600 hover:bg-cyan-500 text-justify mx-0 px-0 py-0 my-[28px]">
            View on DexTools <ExternalLink size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
export default DexToolsChart;