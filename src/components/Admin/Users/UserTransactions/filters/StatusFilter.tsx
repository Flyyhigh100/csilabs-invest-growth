
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { statusOptions } from './constants';

interface StatusFilterProps {
  onValueChange: (value: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ onValueChange }) => {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusFilter;
