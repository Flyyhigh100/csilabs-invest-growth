
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Wallet, CheckCircle } from 'lucide-react';

interface WalletEducationPanelProps {
  onComplete: () => void;
  className?: string;
}

const WalletEducationPanel: React.FC<WalletEducationPanelProps> = ({ onComplete, className }) => {
  const walletOptions = [
    { name: 'MetaMask', description: 'Popular Ethereum & Polygon wallet', url: 'https://metamask.io/' },
    { name: 'Phantom', description: 'User-friendly Solana wallet', url: 'https://phantom.app/' },
    { name: 'Trust Wallet', description: 'Multi-chain mobile wallet', url: 'https://trustwallet.com/' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <Alert className="bg-blue-50 border-blue-200">
        <Wallet className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-800">
          <span className="font-medium">What is a crypto wallet?</span> Think of it as your digital account for receiving and storing cryptocurrency, including CSi Tokens.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Recommended Wallets:</h4>
        <div className="grid gap-3">
          {walletOptions.map((wallet) => (
            <div key={wallet.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium">{wallet.name}</p>
                <p className="text-sm text-gray-600">{wallet.description}</p>
              </div>
              <a 
                href={wallet.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cbis-blue hover:text-cbis-blue-dark flex items-center text-sm"
              >
                Visit <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">Need help setting up?</h4>
            <p className="text-sm text-gray-600">Follow our step-by-step guide</p>
          </div>
          <a 
            href="https://cagechain.com/learn/wallet-setup-guide" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cbis-blue hover:text-cbis-blue-dark flex items-center text-sm"
          >
            View Guide <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
      
      <div className="pt-3">
        <Button 
          onClick={onComplete} 
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          I've created my wallet
        </Button>
      </div>
    </div>
  );
};

export default WalletEducationPanel;
