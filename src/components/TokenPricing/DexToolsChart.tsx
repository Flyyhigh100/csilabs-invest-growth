
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UNISWAP_V3_POOL } from '@/services/api/config';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DexToolsChart: React.FC = () => {
  // Use the V3 pool from our config
  const poolAddress = UNISWAP_V3_POOL;
  
  const handleViewOnDexTools = () => {
    // Open in a new tab when clicked
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`, '_blank');
  };
  
  return (
    <Card className="w-full overflow-hidden">
      {/* Removed fixed height-[500px] to make it responsive */}
      <CardContent className="p-0 h-full relative">
        <iframe 
          title="DexTools Chart" 
          src={`https://www.dextools.io/widget-chart/en/polygon/pe-light/${poolAddress}?theme=light&chartType=1&chartResolution=1D&drawingToolbars=false`} 
          className="w-full h-[400px] sm:h-[450px] md:h-[500px] border-0" 
          allow="clipboard-write" 
          referrerPolicy="no-referrer" 
          sandbox="allow-scripts allow-same-origin allow-popups" 
        />
        
        {/* Moved button to top-right with semi-transparent background */}
        <div className="absolute top-3 right-3 z-10">
          <Button 
            onClick={handleViewOnDexTools} 
            size="sm" 
            className="flex items-center gap-2 text-black border border-gray-200 backdrop-blur-sm bg-cyan-600 hover:bg-cyan-500 text-justify mx-0 px-0 py-0 my-[28px]"
          >
            View on DexTools <ExternalLink size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DexToolsChart;
