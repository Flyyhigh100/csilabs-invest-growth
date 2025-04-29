
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useTokenPrice } from '@/context/TokenPriceContext';

interface TokenCalculatorProps {
  amount: number;
  onChange: (amount: number) => void;
  disabled?: boolean;
}

const TokenCalculator: React.FC<TokenCalculatorProps> = ({
  amount,
  onChange,
  disabled = false
}) => {
  const { currentPrice } = useTokenPrice();
  
  // Local state for input handling
  const [inputValue, setInputValue] = useState<string>(amount.toString());
  
  // Calculate token amount
  const tokenAmount = currentPrice ? amount / currentPrice : 0;
  const isExceedingLimit = tokenAmount > 10000;
  const formattedTokenAmount = tokenAmount.toLocaleString(undefined, { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  // Sync local state with prop when it changes from outside
  useEffect(() => {
    setInputValue(amount.toString());
  }, [amount]);

  // Handle input changes with improved UX
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Always update the local state for continuous typing
    setInputValue(newValue);
    
    // Only update parent state if value is a valid number
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
          Amount in USD ($)
        </Label>
        <div className="mt-1">
          <Input
            type="number"
            id="amount"
            min="0"
            step="1"
            value={inputValue}
            onChange={handleAmountChange}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cbis-blue focus:ring-cbis-blue sm:text-sm"
          />
        </div>
      </div>

      {currentPrice && (
        <div className="text-sm text-gray-600">
          Estimated tokens: {formattedTokenAmount} CSL
          {currentPrice && (
            <div className="text-xs text-gray-500 mt-1">
              Current price: ${currentPrice.toFixed(5)} per token
            </div>
          )}
        </div>
      )}

      {isExceedingLimit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Maximum purchase limit is 10,000 tokens per transaction
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TokenCalculator;
