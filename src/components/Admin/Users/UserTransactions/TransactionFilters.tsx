
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Filter, Download, ChevronDown } from 'lucide-react';

interface TransactionFiltersProps {
  onFilterChange: (filters: any) => void;
  onExportCSV: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onFilterChange,
  onExportCSV
}) => {
  const [status, setStatus] = useState<string>('all');
  
  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({ status: value === 'all' ? '' : value });
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              More Filters
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onFilterChange({ sortBy: 'created_at', sortOrder: 'desc' })}>
              Most Recent
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange({ sortBy: 'created_at', sortOrder: 'asc' })}>
              Oldest First
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange({ sortBy: 'amount', sortOrder: 'desc' })}>
              Highest Amount
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onFilterChange({ sortBy: 'amount', sortOrder: 'asc' })}>
              Lowest Amount
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Button 
        variant="outline" 
        className="flex items-center gap-1 sm:ml-auto"
        onClick={onExportCSV}
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
};

export default TransactionFilters;
