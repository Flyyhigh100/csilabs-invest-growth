
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface PaymentInfoCardProps {
  showInfoCard: boolean;
  setShowInfoCard: (show: boolean) => void;
}

const PaymentInfoCard: React.FC<PaymentInfoCardProps> = ({
  showInfoCard,
  setShowInfoCard
}) => {
  if (!showInfoCard) return null;

  return (
    <Card className="bg-white border border-blue-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-2"></div>
      <CardContent className="p-5">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800">Purchase CSi Labs (CSL) Coins as Easy as 1-2-3 ...</h3>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full h-8 w-8 p-0" onClick={() => setShowInfoCard(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4 mt-1">
            <div className="flex items-center gap-2">
              <div className="bg-cbis-blue text-white rounded-full min-w-6 w-6 h-6 flex items-center justify-center text-sm font-medium">1</div>
              <p className="text-sm text-gray-700">Add your Polygon or Solana Wallet Address to receive your CSi-Labs Coins</p>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="bg-cbis-blue text-white rounded-full min-w-6 w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">2</div>
              <div className="text-sm text-gray-700">
                <p>Fund Your Wallet our Accept Coins:</p>
                <p className="mt-1">Bitcoin, ETH, BNB, SOL, POL or with stablecoins USDC and USDT on Polygon or Solana Networks</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-cbis-blue text-white rounded-full min-w-6 w-6 h-6 flex items-center justify-center text-sm font-medium">3</div>
              <p className="text-sm text-gray-700">For a Limited Time, Purchase CSi Labs (CSL) @ Current Spot Price</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoCard;
