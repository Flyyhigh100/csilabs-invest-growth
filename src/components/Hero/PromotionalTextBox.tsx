
import React from 'react';

const PromotionalTextBox: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-cbis-blue to-cbis-teal p-4 md:p-6 rounded-2xl shadow-elevation text-white">
      <div className="text-center">
        <h3 className="text-lg md:text-xl font-bold mb-2">
          1-Million Strong Killing Cancers Foundation CSi Labs (CSL) MEME Coins
        </h3>
        <div className="inline-block px-3 py-1 mb-3 text-sm md:text-base font-semibold bg-yellow-400 text-cbis-dark rounded-full">
          "Limited Time Pre-Launch Special"
        </div>
        <div className="text-base md:text-lg font-semibold mb-4">
          "Buy Direct" at "Current Spot Price"
        </div>
        <div className="space-y-2 text-left">
          <div className="flex items-start space-x-2">
            <span className="bg-white text-cbis-blue rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">1</span>
            <span className="font-medium text-sm md:text-base">FAST TRACK your purchase!</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-white text-cbis-blue rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">2</span>
            <span className="font-medium text-sm md:text-base">Know your price upfront</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-white text-cbis-blue rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">3</span>
            <span className="font-medium text-sm md:text-base">Contributes directly to the Cancer Foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalTextBox;
