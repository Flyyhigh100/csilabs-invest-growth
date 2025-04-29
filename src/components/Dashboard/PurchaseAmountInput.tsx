
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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

  // Sync local state with prop when it changes from outside
  useEffect(() => {
    setInputValue(amount.toString());
  }, [amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Always update the local state for continuous typing
    setInputValue(value);
    
    // Only update parent state if value is a valid number
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onChange(numericValue);
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
        min={10}
        className="mt-1" 
        disabled={disabled}
        placeholder="Enter amount"
      />
    </div>
  );
};

export default PurchaseAmountInput;
