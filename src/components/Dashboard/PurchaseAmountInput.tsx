
import React, { useState, useEffect, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

interface PurchaseAmountInputProps {
  amount: number;
  onChange: (amount: number) => void;
  disabled?: boolean;
}

const PurchaseAmountInput: React.FC<PurchaseAmountInputProps> = ({
  amount,
  onChange,
  disabled = false
}) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Always update the local state for continuous typing
    setInputValue(value);
    
    // Validate the input
    const numericValue = parseFloat(value);
    if (value === '') {
      setIsValid(false);
      setErrorMessage('Enter a valid dollar amount');
    } else if (isNaN(numericValue)) {
      setIsValid(false);
      setErrorMessage('Enter a valid number');
    } else if (numericValue < 10) {
      setIsValid(false);
      setErrorMessage('Minimum amount is $10');
    } else {
      setIsValid(true);
      setErrorMessage('');
      // Use debounced update for smooth typing experience
      debouncedOnChange(numericValue);
    }
  };

  // Handle input blur for final validation
  const handleInputBlur = () => {
    // If empty or invalid on blur, reset to minimum amount
    if (inputValue === '' || isNaN(parseFloat(inputValue))) {
      setInputValue('10');
      setIsValid(true);
      setErrorMessage('');
      onChange(10);
    } else {
      const numericValue = parseFloat(inputValue);
      if (numericValue < 10) {
        setInputValue('10');
        setIsValid(true);
        setErrorMessage('');
        onChange(10);
      }
    }
  };

  return (
    <div className="mb-6">
      <Label htmlFor="amount">Purchase Amount (USD)</Label>
      <Input 
        id="amount" 
        type="number" 
        value={inputValue} 
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={10}
        step="0.01"
        className="mt-1" 
        disabled={disabled}
        placeholder="Enter amount"
        aria-invalid={!isValid}
        aria-describedby={!isValid ? "purchase-amount-error" : undefined}
      />
      {!isValid && (
        <p id="purchase-amount-error" className="text-sm text-red-500 mt-1" aria-live="polite">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default PurchaseAmountInput;
