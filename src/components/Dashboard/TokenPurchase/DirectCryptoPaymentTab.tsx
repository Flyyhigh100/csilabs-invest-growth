
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface DirectCryptoPaymentTabProps {
  walletAddress: string;
  amount: number;
}

const DirectCryptoPaymentTab: React.FC<DirectCryptoPaymentTabProps> = ({
  walletAddress,
  amount
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Coins className="h-6 w-6 text-cbis-blue" />
          <h3 className="text-xl font-semibold">Direct Crypto Payment</h3>
        </div>
        <p className="text-gray-600">
          Send crypto directly to purchase CSi Labs (CSL) tokens at current market price
        </p>
      </div>

      {/* Payment Instructions */}
      <Card className="border-blue-100 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium text-gray-800">Choose Your Cryptocurrency</p>
                <p className="text-sm text-gray-600 mt-1">
                  Recommended crypto options to purchase CSi Labs (CSL) tokens: USDT, USDC, BTC, Ethereum, Polygon, Solana, BNB (on Polygon or Solana Networks).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-gray-800">Send Payment</p>
                <p className="text-sm text-gray-600 mt-1">
                  Send your chosen cryptocurrency to the payment address provided in your purchase confirmation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-gray-800">Receive Tokens</p>
                <p className="text-sm text-gray-600 mt-1">
                  CSi Labs (CSL) tokens will be sent to your registered wallet address once payment is confirmed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Processing Time</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Token distribution typically occurs within 24-48 hours after payment confirmation.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Wallet */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Registered Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Delivery Address:</p>
              <p className="text-xs font-mono text-gray-600 break-all">{walletAddress}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(walletAddress, 'Wallet address')}
              className="ml-2 flex-shrink-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-green-100 bg-green-50/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
            <h4 className="font-semibold text-green-800">Ready to Purchase?</h4>
            <p className="text-sm text-green-700">
              Contact our team to initiate your direct crypto payment and receive detailed payment instructions.
            </p>
            <Button 
              className="mt-3 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.open('mailto:support@csilabs.com?subject=Direct%20Crypto%20Payment%20Request', '_blank')}
            >
              Contact Support Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DirectCryptoPaymentTab;
