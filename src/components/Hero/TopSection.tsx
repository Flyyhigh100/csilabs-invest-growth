
import React from 'react';
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const TopSection: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="w-full h-[500px] rounded-xl overflow-hidden">
            <AspectRatio ratio={16/9} className="bg-white">
              <img
                src="/lovable-uploads/56796b31-15aa-467c-a025-18f6398e910e.png"
                alt="CSi Labs Laboratory"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
          <div className="w-full h-[500px]">
            <DexToolsChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopSection;
