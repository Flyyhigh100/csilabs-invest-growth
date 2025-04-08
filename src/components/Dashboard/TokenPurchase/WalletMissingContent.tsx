
import React from 'react';
import { Button } from "@/components/ui/button";
import { Wallet } from 'lucide-react';

const WalletMissingContent: React.FC = () => {
  return (
    <div className="text-center py-10">
      <div className="mx-auto bg-amber-50 w-16 h-16 flex items-center justify-center rounded-full mb-4">
        <Wallet className="h-8 w-8 text-amber-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">Wallet Address Required</h3>
      <p className="text-gray-600 max-w-md mx-auto mb-4">
        You need to provide a wallet address before you can purchase tokens. This address is where your tokens will be sent after purchase.
      </p>
      <Button 
        onClick={() => document.getElementById('wallet-address-section')?.scrollIntoView({ behavior: 'smooth' })}
        className="bg-gradient-to-r from-cbis-blue to-cbis-teal hover:opacity-90 text-white"
      >
        Add Wallet Address
      </Button>
    </div>
  );
};

export default WalletMissingContent;
