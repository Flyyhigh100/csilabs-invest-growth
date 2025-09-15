import React from 'react';
import { UNISWAP_V3_POOL } from '@/services/api/config';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DexToolsChart: React.FC = () => {
  const poolAddress = UNISWAP_V3_POOL;

  const handleViewOnDexTools = () => {
    window.open(`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`, '_blank');
  };

  return (
    <div className="relative w-full h-full">
      <iframe 
        title="DexTools Chart" 
        src={`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`} 
        className="w-full h-[400px] sm:h-[450px] md:h-[500px] border-0" 
        allow="clipboard-write" 
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute top-3 right-3 z-10">
        <Button onClick={handleViewOnDexTools} size="sm" variant="secondary" className="flex items-center gap-2 backdrop-blur-sm">
          View on DexTools <ExternalLink size={16} />
        </Button>
      </div>
    </div>
  );
};
export default DexToolsChart;