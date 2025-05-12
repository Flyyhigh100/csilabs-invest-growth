
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface TransactionAnalyticsFilterProps {
  onFilterChange: (filters: any) => void;
  defaultStartDate?: Date;
}

const TransactionAnalyticsFilter = ({ onFilterChange, defaultStartDate }: TransactionAnalyticsFilterProps) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];
  
  const paymentMethodOptions = [
    { value: '', label: 'All Payment Methods' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'cryptocurrency', label: 'Cryptocurrency' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
  ];
  
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const [amountRange, setAmountRange] = useState([0, 10000]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const handleApplyFilters = () => {
    const filters = {
      startDate,
      endDate,
      status,
      paymentMethod,
      minAmount: amountRange[0] > 0 ? amountRange[0] : undefined,
      maxAmount: amountRange[1] < 10000 ? amountRange[1] : undefined,
    };
    
    // Update active filters list for badge display
    const newActiveFilters = [];
    
    if (startDate) newActiveFilters.push('Date Range');
    if (status) newActiveFilters.push('Status');
    if (paymentMethod) newActiveFilters.push('Payment Method');
    if (amountRange[0] > 0 || amountRange[1] < 10000) newActiveFilters.push('Amount');
    
    setActiveFilters(newActiveFilters);
    onFilterChange(filters);
    setIsOpen(false);
  };
  
  const resetFilters = () => {
    setStartDate(defaultStartDate);
    setEndDate(null);
    setStatus('');
    setPaymentMethod('');
    setAmountRange([0, 10000]);
    setActiveFilters([]);
    
    onFilterChange({
      startDate: defaultStartDate,
      endDate: null,
      status: '',
      paymentMethod: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
    
    setIsOpen(false);
  };
  
  return (
    <div>
      <div className="flex items-center space-x-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-4" align="start">
            <div className="space-y-4">
              <h3 className="font-medium">Filter Transactions</h3>
              <Separator />
              
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex gap-3">
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="start-date" className="text-xs">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate || undefined}
                          onSelect={setStartDate}
                          initialFocus
                          disabled={(date) => {
                            // Don't allow dates before project start (March 1, 2025)
                            return date < (defaultStartDate || new Date(2025, 2, 1));
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="end-date" className="text-xs">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, 'MMM d, yyyy') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate || undefined}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => {
                            // Don't allow dates before start date or project start
                            const minDate = startDate || (defaultStartDate || new Date(2025, 2, 1));
                            return date < minDate;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Payment Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Payment Method</SelectLabel>
                      {paymentMethodOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Amount Range</Label>
                <div className="pt-4 px-2">
                  <Slider
                    value={amountRange}
                    onValueChange={setAmountRange}
                    max={10000}
                    step={100}
                  />
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>${amountRange[0]}</span>
                    <span>${amountRange[1] === 10000 ? '10,000+' : amountRange[1]}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <Badge key={filter} variant="secondary" className="text-xs">
                {filter}
              </Badge>
            ))}
            <Button 
              variant="ghost" 
              className="h-auto text-xs py-1 px-2" 
              onClick={resetFilters}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionAnalyticsFilter;
