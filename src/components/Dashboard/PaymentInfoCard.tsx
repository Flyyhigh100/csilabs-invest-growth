
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
    <Card className="mb-6 bg-white border border-blue-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 h-2"></div>
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-800">Welcome to CSi Token Purchases</h3>
            <p className="text-sm text-gray-600">
              Follow these steps to purchase CSi tokens:
            </p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-2 pl-5 list-decimal marker:text-blue-500 marker:font-medium">
              <li className="text-gray-700 pl-1">Add your Polygon wallet address</li>
              <li className="text-gray-700 pl-1">Choose your contribution amount</li>
              <li className="text-gray-700 pl-1">Select your payment method</li>
              <li className="text-gray-700 pl-1">Complete the transaction</li>
            </ol>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full mt-3 md:mt-0 h-8 w-8 p-0"
            onClick={() => setShowInfoCard(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentInfoCard;
