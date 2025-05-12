
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TransactionAnalyticsFilterProps {
  onFilterChange: (filters: any) => void;
}

const TransactionAnalyticsFilter: React.FC<TransactionAnalyticsFilterProps> = ({ 
  onFilterChange 
}) => {
  const [status, setStatus] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const applyFilters = () => {
    const filters: any = {};
    const newActiveFilters: string[] = [];
    
    if (status) {
      filters.status = status;
      newActiveFilters.push(`Status: ${status}`);
    }
    
    if (paymentMethod) {
      filters.paymentMethod = paymentMethod;
      newActiveFilters.push(`Payment Method: ${paymentMethod}`);
    }
    
    if (dateFrom) {
      filters.startDate = dateFrom;
      newActiveFilters.push(`From: ${format(dateFrom, 'PP')}`);
    }
    
    if (dateTo) {
      filters.endDate = dateTo;
      newActiveFilters.push(`To: ${format(dateTo, 'PP')}`);
    }
    
    if (minAmount) {
      filters.minAmount = parseFloat(minAmount);
      newActiveFilters.push(`Min Amount: $${minAmount}`);
    }
    
    if (maxAmount) {
      filters.maxAmount = parseFloat(maxAmount);
      newActiveFilters.push(`Max Amount: $${maxAmount}`);
    }
    
    setActiveFilters(newActiveFilters);
    onFilterChange(filters);
  };
  
  const clearFilters = () => {
    setStatus('');
    setPaymentMethod('');
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinAmount('');
    setMaxAmount('');
    setActiveFilters([]);
    onFilterChange({
      status: '',
      paymentMethod: '',
      startDate: null,
      endDate: null,
      minAmount: undefined,
      maxAmount: undefined
    });
  };
  
  const removeFilter = (filter: string) => {
    const newActiveFilters = activeFilters.filter(f => f !== filter);
    setActiveFilters(newActiveFilters);
    
    // Reset the corresponding state variable
    if (filter.startsWith('Status:')) setStatus('');
    if (filter.startsWith('Payment Method:')) setPaymentMethod('');
    if (filter.startsWith('From:')) setDateFrom(undefined);
    if (filter.startsWith('To:')) setDateTo(undefined);
    if (filter.startsWith('Min Amount:')) setMinAmount('');
    if (filter.startsWith('Max Amount:')) setMaxAmount('');
    
    // Apply the updated filters
    applyFilters();
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Transaction Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Apply filters to analyze specific transaction data.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="status" className="text-xs">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Any status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label htmlFor="payment" className="text-xs">Payment Method</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger id="payment">
                        <SelectValue placeholder="Any method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any Method</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="coinpayments">CoinPayments</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="date-from" className="text-xs">Date From</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-from"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label htmlFor="date-to" className="text-xs">Date To</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-to"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="min-amount" className="text-xs">Min Amount ($)</label>
                    <Input
                      id="min-amount"
                      type="number"
                      placeholder="0.00"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="max-amount" className="text-xs">Max Amount ($)</label>
                    <Input
                      id="max-amount"
                      type="number"
                      placeholder="0.00"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                  <Button size="sm" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="outline" className="bg-muted">
              {filter}
              <button
                className="ml-1 rounded-full outline-none"
                onClick={() => removeFilter(filter)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={clearFilters}
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransactionAnalyticsFilter;
