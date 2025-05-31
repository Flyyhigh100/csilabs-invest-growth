
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NetworkType, getNetworkInfo } from './networkValidation';

interface NetworkSelectorProps {
  selectedNetwork: NetworkType;
  onNetworkChange: (network: NetworkType) => void;
  disabled?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  selectedNetwork,
  onNetworkChange,
  disabled = false
}) => {
  const networks: NetworkType[] = ['polygon', 'solana'];

  return (
    <div className="space-y-3">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Network</label>
        <div className="flex gap-2">
          {networks.map((network) => {
            const networkInfo = getNetworkInfo(network);
            const isSelected = selectedNetwork === network;
            
            return (
              <Button
                key={network}
                type="button"
                variant={isSelected ? "default" : "outline"}
                onClick={() => onNetworkChange(network)}
                disabled={disabled}
                className={`flex-1 ${
                  isSelected 
                    ? "bg-gradient-to-r from-cbis-blue to-cbis-teal text-white" 
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {networkInfo.name}
                {isSelected && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                    Selected
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Network info display */}
      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
        <div className="text-sm">
          <p className="font-medium text-gray-700">{getNetworkInfo(selectedNetwork).name} Network</p>
          <p className="text-gray-600 mt-1">{getNetworkInfo(selectedNetwork).description}</p>
          <p className="text-xs text-gray-500 mt-1">
            Format: {getNetworkInfo(selectedNetwork).length} • {getNetworkInfo(selectedNetwork).prefix}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkSelector;
