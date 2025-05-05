
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UNISWAP_V4_POOL } from '@/services/api/config';

const DexToolsChart: React.FC = () => {
  // Use the V4 pool from our config
  const poolAddress = UNISWAP_V4_POOL;
  
  return (
    <Card className="w-full h-[500px] overflow-hidden">
      <CardContent className="p-0 h-full">
        <iframe
          title="DexTools Chart"
          src={`https://www.dextools.io/app/en/polygon/pair-explorer/${poolAddress}`}
          className="w-full h-full border-0"
          allow="clipboard-write"
        />
      </CardContent>
    </Card>
  );
};

export default DexToolsChart;
