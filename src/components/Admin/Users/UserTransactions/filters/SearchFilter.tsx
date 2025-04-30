
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UseFormRegister } from 'react-hook-form';
import { FilterFormValues } from './useTransactionFilters';

interface SearchFilterProps {
  register: UseFormRegister<FilterFormValues>;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ register }) => {
  return (
    <div className="relative flex-grow">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        placeholder="Search transactions..."
        className="pl-8"
        {...register('searchQuery')}
      />
    </div>
  );
};

export default SearchFilter;
