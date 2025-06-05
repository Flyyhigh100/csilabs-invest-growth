import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Shield, Download, Settings, CheckCircle } from 'lucide-react';
const WalletSetupGuide: React.FC = () => {
  return <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* MetaMask for Polygon */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              
              <div>
                <CardTitle className="flex items-center gap-2">
                  MetaMask Wallet
                  <Badge variant="secondary">Polygon Network</Badge>
                </CardTitle>
                <CardDescription>
                  Most popular Ethereum-compatible wallet
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Download MetaMask</p>
                  <p className="text-sm text-gray-600">Install the browser extension or mobile app</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Create or Import Wallet</p>
                  <p className="text-sm text-gray-600">Set up a new wallet or import existing seed phrase</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Add Polygon Network</p>
                  <p className="text-sm text-gray-600">Configure MetaMask to use Polygon mainnet</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">4</span>
                </div>
                <div>
                  <p className="font-medium">Add USDC Token</p>
                  <p className="text-sm text-gray-600">Import USDC token contract to see your balance</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download MetaMask
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Phantom for Solana */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              
              <div>
                <CardTitle className="flex items-center gap-2">
                  Phantom Wallet
                  <Badge variant="secondary">Solana Network</Badge>
                </CardTitle>
                <CardDescription>
                  Leading wallet for the Solana ecosystem
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-purple-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Download Phantom</p>
                  <p className="text-sm text-gray-600">Install the browser extension or mobile app</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-purple-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Create New Wallet</p>
                  <p className="text-sm text-gray-600">Generate a new Solana wallet address</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Secure Your Seed Phrase</p>
                  <p className="text-sm text-gray-600">Write down and safely store your recovery phrase</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-purple-600">4</span>
                </div>
                <div>
                  <p className="font-medium">Fund Your Wallet</p>
                  <p className="text-sm text-gray-600">Add SOL or USDC to start transacting</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://phantom.app/download" target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download Phantom
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              </Button>
              
              <Button variant="outline" className="w-full justify-start" asChild>
                
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tips */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-amber-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Never share your seed phrase or private keys with anyone</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Write down your seed phrase on paper and store it securely offline</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Always verify website URLs before entering wallet information</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">Start with small amounts when testing new platforms</p>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default WalletSetupGuide;