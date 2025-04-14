
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PurchaseAmountInput from '../PurchaseAmountInput';

interface TokenCalculatorProps {
  amount: number;
  onChange: (amount: number) => void;
  disabled: boolean;
}

const TokenCalculator: React.FC<TokenCalculatorProps> = ({
  amount,
  onChange,
  disabled
}) => {
  const tokenAmount = amount / 1; // Token price is $1.00

  return (
    <div className="space-y-6 bg-blue-50 p-5 rounded-lg border border-blue-100">
      <div className="flex items-center justify-between">
        <Label className="text-xl font-bold text-gray-900" htmlFor="amount-input">
          Purchase Amount (USD)
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">Enter the amount in USD you wish to invest. At our current token price of $1.00, this is the number of tokens you'll receive.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <PurchaseAmountInput 
        amount={amount} 
        onChange={onChange} 
        disabled={disabled} 
        className="text-2xl font-bold" 
      />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center text-base mb-2">
          <span className="text-gray-700 font-medium">You will receive:</span>
          <span className="font-bold text-cbis-blue text-xl">{tokenAmount.toLocaleString()} CSi Tokens</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Current token price:</span>
          <span className="font-semibold text-cbis-blue">$1.00 USD</span>
        </div>
      </div>
    </div>
  );
};

export default TokenCalculator;
