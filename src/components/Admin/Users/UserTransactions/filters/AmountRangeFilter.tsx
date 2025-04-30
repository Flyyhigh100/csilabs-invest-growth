
import React from 'react';
import { Input } from '@/components/ui/input';
import { UseFormRegister } from 'react-hook-form';
import { FilterFormValues } from './useTransactionFilters';

interface AmountRangeFilterProps {
  register: UseFormRegister<FilterFormValues>;
}

const AmountRangeFilter: React.FC<AmountRangeFilterProps> = ({ register }) => {
  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        placeholder="Min Amount"
        className="w-32"
        {...register('minAmount')}
      />
      <span>to</span>
      <Input
        type="number"
        placeholder="Max Amount"
        className="w-32"
        {...register('maxAmount')}
      />
    </div>
  );
};

export default AmountRangeFilter;
