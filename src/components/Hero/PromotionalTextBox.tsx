
import React from 'react';

const PromotionalTextBox: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-cbis-blue to-cbis-teal p-6 rounded-2xl shadow-elevation text-white mb-8">
      <div className="text-center">
        <h3 className="text-xl md:text-2xl font-bold mb-2">
          1-Million Strong Killing Cancers Foundation CSi Labs (CSL) MEME Coins
        </h3>
        <div className="inline-block px-4 py-2 mb-4 text-lg font-semibold bg-yellow-400 text-cbis-dark rounded-full">
          "Limited Time Pre-Launch Special"
        </div>
        <div className="text-lg font-semibold mb-4">
          "Buy Direct" at "Current Spot Price"
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-left">
          <div className="flex items-start space-x-2">
            <span className="bg-white text-cbis-blue rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
            <span className="font-medium">FAST TRACK your purchase!</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-white text-cbis-blue rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
            <span className="font-medium">Know your price upfront</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-white text-cbis-blue rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
            <span className="font-medium">Contributes directly to the Cancer Foundation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalTextBox;
