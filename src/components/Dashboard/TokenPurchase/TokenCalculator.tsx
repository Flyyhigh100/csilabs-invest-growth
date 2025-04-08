
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
  const tokenAmount = amount / 1; // Updated price from 0.05 to 1

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium text-gray-700" htmlFor="amount-input">Investment Amount (USD)</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                <HelpCircle className="h-4 w-4 text-gray-400" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="text-sm">This is the amount in USD you wish to invest. The number of tokens you'll receive depends on the current token price ($1.00).</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <PurchaseAmountInput amount={amount} onChange={onChange} disabled={disabled} />
      
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">You will receive approximately:</span>
          <span className="font-medium text-cbis-blue">{tokenAmount.toLocaleString()} CSi Tokens</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current token price:</span>
          <span className="font-medium text-cbis-blue">$1.00 USD</span>
        </div>
      </div>
    </div>
  );
};

export default TokenCalculator;
