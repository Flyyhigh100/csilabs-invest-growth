
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
  const [localAmount, setLocalAmount] = useState<string>(amount.toString());

  // Update local state when prop changes
  useEffect(() => {
    setLocalAmount(amount.toString());
  }, [amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalAmount(value);
    
    // Only update parent if value is valid
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
        value={localAmount} 
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
