
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UNISWAP_V4_POOL } from '@/services/api/config';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DexToolsChart: React.FC = () => {
  // Use the V4 pool from our config
  const poolAddress = UNISWAP_V4_POOL;
  
  const handleViewOnDexTools = () => {
    // Open in a new tab when clicked
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`, '_blank');
  };
  
  return (
    <Card className="w-full h-[500px] overflow-hidden">
      <CardContent className="p-0 h-full relative">
        <iframe
          title="DexTools Chart"
          src={`https://www.dextools.io/widget-chart/en/polygon/pe-light/${poolAddress}?theme=light&chartType=1&chartResolution=1D&drawingToolbars=false`}
          className="w-full h-full border-0"
          allow="clipboard-write"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
        
        {/* Fallback button in case iframe doesn't load */}
        <div className="absolute bottom-4 right-4">
          <Button 
            onClick={handleViewOnDexTools} 
            className="flex items-center gap-2 bg-cbis-blue hover:bg-cbis-blue/90"
          >
            View on DexTools <ExternalLink size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DexToolsChart;
