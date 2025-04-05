
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 shadow-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h3 className="text-lg font-medium text-cbis-blue mb-2">Welcome to CSi Token Purchases</h3>
            <p className="text-sm text-blue-700">
              Follow these steps to purchase CSi tokens:
            </p>
            <ol className="text-sm text-blue-600 mt-2 list-decimal pl-5 space-y-2">
              <li className="pl-1">Add your Polygon wallet address below</li>
              <li className="pl-1">Choose the amount you wish to invest</li>
              <li className="pl-1">Select your preferred payment method</li>
              <li className="pl-1">Complete the transaction</li>
            </ol>
          </div>
          <Button 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-700 mt-3 md:mt-0"
            onClick={() => setShowInfoCard(false)}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoCard;
