import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, ExternalLink, Shield, DollarSign, Clock, ArrowRight } from 'lucide-react';
const CryptoPurchaseGuide: React.FC = () => {
  return <div className="space-y-6">
      {/* Stripe Onramp Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                Buy Crypto with Credit/Debit Card
                <Badge variant="default" className="bg-blue-600">Recommended</Badge>
              </CardTitle>
              <CardDescription className="text-blue-700">
                Purchase cryptocurrency directly with your card through our Stripe integration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-blue-800">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                How It Works
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-medium">1.</span>
                  <span>Go to the "Purchase Tokens" section in your dashboard</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">2.</span>
                  <span>Select "Buy Crypto with Card" option</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">3.</span>
                  <span>Choose your cryptocurrency (USDC or USDT are recommended) on Polygon or Solana, however we do accept ETH, Bitcoin, BNB, POL, and Solana for CSL Token purchase.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">4.</span>
                  <span>Enter your payment details and complete purchase</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-medium">5.</span>
                  <span>Crypto is sent directly to your wallet</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Key Benefits
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Instant crypto purchase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Secure Stripe payment processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Direct delivery to your wallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Support for major credit/debit cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No need for exchange accounts</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-blue-200" />
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 flex-1" asChild>
              <a href="/dashboard/payments">
                Start Buying Crypto
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100" asChild>
              <a href="https://stripe.com/crypto" target="_blank" rel="noopener noreferrer">
                Learn About Stripe Crypto
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alternative Methods */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Centralized Exchanges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Centralized Exchanges
            </CardTitle>
            <CardDescription>
              Traditional crypto exchanges for larger purchases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Coinbase</p>
                  <p className="text-sm text-gray-600">Beginner-friendly, high fees</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://coinbase.com" target="_blank" rel="noopener noreferrer">
                    Visit
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Binance</p>
                  <p className="text-sm text-gray-600">Lower fees, more complex</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://binance.com" target="_blank" rel="noopener noreferrer">
                    Visit
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
              
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Kraken</p>
                  <p className="text-sm text-gray-600">Secure, good for larger amounts</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://kraken.com" target="_blank" rel="noopener noreferrer">
                    Visit
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Note:</p>
              <p>You'll need to transfer crypto from exchange to your personal wallet after purchase.</p>
            </div>
          </CardContent>
        </Card>

        {/* P2P and Other Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Alternative Methods
            </CardTitle>
            <CardDescription>
              Other ways to acquire cryptocurrency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <p className="font-medium">Local Bitcoin ATMs</p>
                <p className="text-sm text-gray-600">Find ATMs near you for cash purchases</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href="https://coinatmradar.com" target="_blank" rel="noopener noreferrer">
                    Find ATMs
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="font-medium">P2P Platforms</p>
                <p className="text-sm text-gray-600">Buy directly from other users</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://localbitcoins.com" target="_blank" rel="noopener noreferrer">
                      LocalBitcoins
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://paxful.com" target="_blank" rel="noopener noreferrer">
                      Paxful
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="p-3 border rounded-lg">
                <p className="font-medium">DeFi On-Ramps</p>
                <p className="text-sm text-gray-600">Decentralized purchase options</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href="https://app.uniswap.org" target="_blank" rel="noopener noreferrer">
                    Uniswap
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Important Considerations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-orange-700">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Fees & Timing:</p>
              <ul className="space-y-1">
                <li>• Card purchases: 2-5% fees, instant</li>
                <li>• Bank transfers: Lower fees, 1-3 days</li>
                <li>• Exchange transfers: Network fees apply</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Recommended Amounts:</p>
              <ul className="space-y-1">
                <li>• Start small ($10-50) to test</li>
                <li>• Consider fees for larger purchases</li>
                <li>• Keep some extra for transaction fees</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default CryptoPurchaseGuide;