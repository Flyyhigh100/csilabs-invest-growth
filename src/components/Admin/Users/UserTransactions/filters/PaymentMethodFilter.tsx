
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { paymentMethodOptions } from './constants';

interface PaymentMethodFilterProps {
  onValueChange: (value: string) => void;
}

const PaymentMethodFilter: React.FC<PaymentMethodFilterProps> = ({ onValueChange }) => {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Payment Method" />
      </SelectTrigger>
      <SelectContent>
        {paymentMethodOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PaymentMethodFilter;
