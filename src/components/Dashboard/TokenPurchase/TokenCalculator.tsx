
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, RefreshCw } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PurchaseAmountInput from '../PurchaseAmountInput';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { Spinner } from "@/components/ui/spinner";

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
  const { 
    currentPrice, 
    isLoading, 
    lastUpdated, 
    timeUntilNextUpdate,
    refreshPrice,
    convertUsdToTokens
  } = useTokenPrice();
  
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(0);
  
  // Update token amount when price or USD amount changes
  useEffect(() => {
    setTokenAmount(convertUsdToTokens(amount));
  }, [amount, currentPrice, convertUsdToTokens]);
  
  // Update countdown timer
  useEffect(() => {
    setRefreshCountdown(Math.floor(timeUntilNextUpdate / 1000));
  }, [timeUntilNextUpdate]);
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString() 
    : 'Not yet updated';
  
  const handleRefreshPrice = () => {
    refreshPrice();
  };
  
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
              <p className="text-sm">Enter the amount in USD you wish to invest. The number of tokens you'll receive is calculated based on the current token price.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <PurchaseAmountInput 
        amount={amount} 
        onChange={onChange} 
        disabled={disabled}
      />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-700 font-medium">Current token price:</span>
          <div className="flex items-center">
            <span className="font-semibold text-cbis-blue mr-2">
              {isLoading ? (
                <Spinner size="sm" className="h-4 w-4" />
              ) : currentPrice ? (
                `$${currentPrice.toFixed(5)} USD`
              ) : (
                'Loading...'
              )}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshPrice}
              disabled={isLoading}
              className="h-7 w-7 p-0 rounded-full"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-base mb-2">
          <span className="text-gray-700 font-medium">You will receive:</span>
          <span className="font-bold text-cbis-blue text-xl">
            {isLoading ? (
              <Spinner size="sm" className="h-5 w-5" />
            ) : (
              `${tokenAmount.toLocaleString(undefined, {
                maximumFractionDigits: 5,
                minimumFractionDigits: 2
              })} CSi Tokens`
            )}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
          <span>
            Last updated: {formattedLastUpdated}
          </span>
          <span>
            Next update in: {refreshCountdown}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default TokenCalculator;
