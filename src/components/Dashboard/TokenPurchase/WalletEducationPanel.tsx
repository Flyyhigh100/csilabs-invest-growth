
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ExternalLink, Wallet, CheckCircle } from 'lucide-react';

interface WalletEducationPanelProps {
  onComplete: () => void;
  className?: string;
}

const WalletEducationPanel: React.FC<WalletEducationPanelProps> = ({ onComplete, className }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const walletOptions = [
    { name: 'MetaMask', description: 'Popular Ethereum & Polygon wallet', url: 'https://metamask.io/' },
    { name: 'Phantom', description: 'User-friendly Solana wallet', url: 'https://phantom.app/' },
    { name: 'Trust Wallet', description: 'Multi-chain mobile wallet', url: 'https://trustwallet.com/' }
  ];

  const handleWalletCreated = () => {
    setIsSubmitting(true);
    console.log("User clicked 'I've created my wallet'");
    
    // Call the onComplete callback provided by the parent component
    // Adding a small delay to ensure the visual feedback is noticed
    setTimeout(() => {
      onComplete();
      setIsSubmitting(false);
    }, 300);
  };

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
          onClick={handleWalletCreated} 
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              I've created my wallet
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WalletEducationPanel;
