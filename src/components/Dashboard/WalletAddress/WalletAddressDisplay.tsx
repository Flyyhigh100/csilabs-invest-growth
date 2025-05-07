
import React, { useState } from 'react';
import { Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface WalletAddressDisplayProps {
  walletAddress: string;
  onEditClick: () => void;
}

const WalletAddressDisplay: React.FC<WalletAddressDisplayProps> = ({ walletAddress, onEditClick }) => {
  const [copied, setCopied] = useState(false);
  const [hideWalletAddress, setHideWalletAddress] = useState(true);

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Wallet address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleHideAddress = () => {
    setHideWalletAddress(!hideWalletAddress);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-2">Your Polygon Wallet Address</h3>
        <div className="flex items-center space-x-2">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex-grow font-mono relative">
            {hideWalletAddress ? 
              <span>••••••••••••{walletAddress.substring(walletAddress.length - 8)}</span> : 
              <span>{walletAddress}</span>
            }
          </div>
          <Button
            type="button" 
            size="icon"
            variant="outline"
            onClick={toggleHideAddress}
            className="flex-shrink-0"
            title={hideWalletAddress ? "Show wallet address" : "Hide wallet address"}
          >
            {hideWalletAddress ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={copyWalletAddress}
            className="flex-shrink-0"
            title="Copy wallet address"
          >
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onEditClick}
          variant="outline"
          className="mt-2"
        >
          Change Wallet Address
        </Button>
      </div>
    </div>
  );
};

export default WalletAddressDisplay;
