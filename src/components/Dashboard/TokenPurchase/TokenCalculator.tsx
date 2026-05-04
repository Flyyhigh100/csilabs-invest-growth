
import React, { useState, useEffect, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';
import { useTokenPrice } from '@/context/TokenPriceContext';

// Utility function for debouncing
const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return function(this: any, ...args: Parameters<T>) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

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
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Create a debounced version of the onChange handler
  const debouncedOnChange = useCallback(
    debounce((value: number) => {
      onChange(value);
    }, 300),
    [onChange]
  );
  
  // Sync local state with prop when it changes from outside
  useEffect(() => {
    // Only update if the value is significantly different to avoid focus issues
    if (Math.abs(parseFloat(inputValue) - amount) > 0.001 || isNaN(parseFloat(inputValue))) {
      setInputValue(amount.toString());
    }
  }, [amount]);
  
  // Calculate token amount
  const tokenAmount = currentPrice ? amount / currentPrice : 0;
  const isExceedingLimit = tokenAmount > 10000;
  const formattedTokenAmount = tokenAmount.toLocaleString(undefined, { 
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  });

  // Handle input changes for continuous typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Always update the local state for continuous typing
    setInputValue(newValue);
    
    // Validate the input
    const numericValue = parseFloat(newValue);
    if (newValue === '') {
      setIsValid(false);
      setErrorMessage('Enter a valid dollar amount');
    } else if (isNaN(numericValue)) {
      setIsValid(false);
      setErrorMessage('Enter a valid number');
    } else if (numericValue < 0) {
      setIsValid(false);
      setErrorMessage('Amount cannot be negative');
    } else {
      setIsValid(true);
      setErrorMessage('');
      // Use debounced update for smooth typing experience
      debouncedOnChange(numericValue);
    }
  };
  
  // Handle input blur for final validation
  const handleInputBlur = () => {
    // If empty or invalid on blur, reset to 0
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      setInputValue('0');
      setIsValid(true);
      setErrorMessage('');
      onChange(0);
    }
    // For valid input, ensure it's properly formatted
    else {
      const numericValue = parseFloat(inputValue);
      if (numericValue >= 0) {
        // Format the number on blur for consistency
        setInputValue(numericValue.toString());
      }
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
            step="0.01"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cbis-blue focus:ring-cbis-blue sm:text-sm"
            aria-invalid={!isValid}
            aria-describedby={!isValid ? "amount-error" : undefined}
            placeholder="Enter amount"
          />
          {!isValid && (
            <p id="amount-error" className="text-sm text-red-500 mt-1" aria-live="polite">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="text-base font-semibold text-gray-700" aria-live="polite">
        Estimated tokens: {formattedTokenAmount} CSL
        <div className="text-sm font-semibold text-gray-600 mt-1">
          Current Spot Price: $1.00 USD - Per Coin
        </div>
      </div>

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
