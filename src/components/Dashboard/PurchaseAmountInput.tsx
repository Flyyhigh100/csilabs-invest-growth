
import React from 'react';
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
  return (
    <div className="mb-6">
      <Label htmlFor="amount">Purchase Amount (USD)</Label>
      <Input 
        id="amount" 
        type="number" 
        value={amount} 
        onChange={e => onChange(parseFloat(e.target.value))} 
        min={10}
        className="mt-1" 
        disabled={disabled} 
      />
    </div>
  );
};

export default PurchaseAmountInput;
