
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Search, Sliders, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TransactionAnalyticsFilterProps {
  onFilterChange: (filters: any) => void;
  defaultStartDate?: Date | null;
}

// Constants for filter values
const ALL_VALUE = "all"; // Non-empty string for "all" filter options

const TransactionAnalyticsFilter: React.FC<TransactionAnalyticsFilterProps> = ({ 
  onFilterChange,
  defaultStartDate = null
}) => {
  // Initialize state with default date
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(ALL_VALUE);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(ALL_VALUE);
  const [date, setDate] = useState<DateRange | undefined>({
    from: defaultStartDate,
    to: undefined
  });
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Apply filters
  const applyFilters = () => {
    onFilterChange({
      status: selectedStatus === ALL_VALUE ? '' : selectedStatus,
      paymentMethod: selectedPaymentMethod === ALL_VALUE ? '' : selectedPaymentMethod,
      startDate: date?.from || null,
      endDate: date?.to || null,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedStatus(ALL_VALUE);
    setSelectedPaymentMethod(ALL_VALUE);
    setDate({
      from: defaultStartDate,
      to: undefined
    });
    setMinAmount('');
    setMaxAmount('');
    
    onFilterChange({
      status: '',
      paymentMethod: '',
      startDate: defaultStartDate,
      endDate: null,
      minAmount: undefined,
      maxAmount: undefined
    });
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
  };

  // Handle amount input changes
  const handleMinAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinAmount(e.target.value);
  };

  const handleMaxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxAmount(e.target.value);
  };

  return (
    <Card className="w-full mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Filters</h3>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Sliders className="mr-2 h-4 w-4" />
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {isExpanded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Date Range Picker - Always visible */}
        <div className="mb-4">
          <Label htmlFor="date-range" className="block text-sm mb-1">Date Range</Label>
          <DatePickerWithRange
            date={date}
            onDateChange={setDate}
          />
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="status" className="block text-sm mb-1">Status</Label>
              <Select value={selectedStatus} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Any status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="payment-method" className="block text-sm mb-1">Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Any payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VALUE}>Any payment method</SelectItem>
                  <SelectItem value="stripe">Credit Card</SelectItem>
                  <SelectItem value="coinpayments">Cryptocurrency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="min-amount" className="block text-sm mb-1">Min Amount ($)</Label>
              <Input
                id="min-amount"
                type="number"
                placeholder="Min amount"
                value={minAmount}
                onChange={handleMinAmountChange}
              />
            </div>

            <div>
              <Label htmlFor="max-amount" className="block text-sm mb-1">Max Amount ($)</Label>
              <Input
                id="max-amount"
                type="number"
                placeholder="Max amount"
                value={maxAmount}
                onChange={handleMaxAmountChange}
              />
            </div>
          </div>
        )}

        <div className="mt-4 text-right">
          <Button onClick={applyFilters}>
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionAnalyticsFilter;
