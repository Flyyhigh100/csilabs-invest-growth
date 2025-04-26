
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const DexToolsChart: React.FC = () => {
  return (
    <Card className="w-full h-[500px] overflow-hidden">
      <CardContent className="p-0 h-full">
        <iframe
          title="DexTools Chart"
          src="https://www.dextools.io/widget-chart/en/polygon/pe-light/0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4?theme=light&chartType=1&chartResolution=1D&drawingToolbars=false"
          className="w-full h-full border-0"
          allow="clipboard-write"
        />
      </CardContent>
    </Card>
  );
};

export default DexToolsChart;
