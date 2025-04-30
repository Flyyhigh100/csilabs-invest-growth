
import React from 'react';
import { useForm } from 'react-hook-form';
import { Search, Filter, Calendar, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface TransactionFiltersProps {
  onFilterChange: (filters: {
    searchQuery?: string;
    status?: string;
    paymentMethod?: string;
    minAmount?: number;
    maxAmount?: number;
    dateRange?: { from: Date; to: Date };
  }) => void;
  onExportCSV: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onFilterChange,
  onExportCSV 
}) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      searchQuery: '',
      status: '',
      paymentMethod: '',
      minAmount: undefined,
      maxAmount: undefined,
      dateFrom: undefined as Date | undefined,
      dateTo: undefined as Date | undefined,
    }
  });

  const dateFrom = watch('dateFrom');
  const dateTo = watch('dateTo');

  const onSubmit = (data: any) => {
    const filters = {
      searchQuery: data.searchQuery,
      status: data.status || undefined,
      paymentMethod: data.paymentMethod || undefined,
      minAmount: data.minAmount ? Number(data.minAmount) : undefined,
      maxAmount: data.maxAmount ? Number(data.maxAmount) : undefined,
      dateRange: (data.dateFrom || data.dateTo) ? {
        from: data.dateFrom || new Date(0),
        to: data.dateTo || new Date()
      } : undefined
    };
    
    onFilterChange(filters);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            {...register('searchQuery')}
          />
        </div>
        
        <Select
          onValueChange={(value) => setValue('status', value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          onValueChange={(value) => setValue('paymentMethod', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Methods</SelectItem>
            <SelectItem value="stripe">Stripe</SelectItem>
            <SelectItem value="coinpayments">Crypto</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateFrom && dateTo ? (
                <>
                  {format(dateFrom, 'PP')} - {format(dateTo, 'PP')}
                </>
              ) : (
                <>Date Range</>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="space-y-2">
                <h4 className="font-medium">Date range</h4>
                <div className="flex items-center gap-2">
                  <CalendarComponent
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => setValue('dateFrom', date)}
                    disabled={(date) => dateTo ? date > dateTo : false}
                    initialFocus
                  />
                  <CalendarComponent
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => setValue('dateTo', date)}
                    disabled={(date) => dateFrom ? date < dateFrom : false}
                    initialFocus
                  />
                </div>
              </div>
            </div>
            <div className="p-3 border-t flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  setValue('dateFrom', undefined);
                  setValue('dateTo', undefined);
                }}
              >
                Reset
              </Button>
              <Button onClick={() => handleSubmit(onSubmit)()}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
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

        <div className="flex-grow"></div>
        
        <Button type="submit" variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={onExportCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </form>
  );
};

export default TransactionFilters;
