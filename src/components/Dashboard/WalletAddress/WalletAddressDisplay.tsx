
import React, { useState } from 'react';
import { Copy, CheckCircle, Eye, EyeOff, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { NetworkType, getNetworkInfo } from './networkValidation';

interface WalletAddressDisplayProps {
  polygonAddress?: string;
  solanaAddress?: string;
  preferredNetwork?: NetworkType;
  onEditClick: (network: NetworkType) => void;
}

const WalletAddressDisplay: React.FC<WalletAddressDisplayProps> = ({ 
  polygonAddress, 
  solanaAddress, 
  preferredNetwork = 'polygon',
  onEditClick 
}) => {
  const [copiedAddresses, setCopiedAddresses] = useState<Record<string, boolean>>({});
  const [hiddenAddresses, setHiddenAddresses] = useState<Record<string, boolean>>({
    polygon: true,
    solana: true
  });

  const copyWalletAddress = (address: string, network: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddresses(prev => ({ ...prev, [network]: true }));
    toast.success(`${getNetworkInfo(network as NetworkType).name} address copied to clipboard`);
    setTimeout(() => {
      setCopiedAddresses(prev => ({ ...prev, [network]: false }));
    }, 2000);
  };

  const toggleHideAddress = (network: string) => {
    setHiddenAddresses(prev => ({ 
      ...prev, 
      [network]: !prev[network] 
    }));
  };

  const renderWalletAddress = (address: string, network: NetworkType) => {
    const networkInfo = getNetworkInfo(network);
    const isHidden = hiddenAddresses[network];
    const isCopied = copiedAddresses[network];
    const isPreferred = network === preferredNetwork;

    return (
      <div key={network} className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-700">{networkInfo.name} Wallet</h4>
            {isPreferred && (
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                Preferred
              </Badge>
            )}
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Confirmed
            </Badge>
          </div>
          <Button
            onClick={() => onEditClick(network)}
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200 flex-grow font-mono text-sm relative">
            {isHidden ? 
              <span>••••••••••••{address.substring(address.length - 8)}</span> : 
              <span className="break-all">{address}</span>
            }
          </div>
          <Button
            type="button" 
            size="icon"
            variant="outline"
            onClick={() => toggleHideAddress(network)}
            className="flex-shrink-0"
            title={isHidden ? "Show wallet address" : "Hide wallet address"}
          >
            {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => copyWalletAddress(address, network)}
            className="flex-shrink-0"
            title="Copy wallet address"
          >
            {isCopied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };

  const hasAnyAddress = polygonAddress || solanaAddress;

  if (!hasAnyAddress) {
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800">
            No wallet addresses set
          </span>
        </div>
        <p className="mt-2 text-sm text-yellow-700">
          Add wallet addresses to receive your tokens.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-gray-700">Your Wallet Addresses</h3>
      </div>
      
      <div className="space-y-4">
        {polygonAddress && renderWalletAddress(polygonAddress, 'polygon')}
        {solanaAddress && renderWalletAddress(solanaAddress, 'solana')}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        {!polygonAddress && (
          <Button
            onClick={() => onEditClick('polygon')}
            variant="outline"
            size="sm"
          >
            Add Polygon Address
          </Button>
        )}
        {!solanaAddress && (
          <Button
            onClick={() => onEditClick('solana')}
            variant="outline"
            size="sm"
          >
            Add Solana Address
          </Button>
        )}
      </div>
    </div>
  );
};

export default WalletAddressDisplay;
