
import React from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

interface DateRangeFilterProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onApply: () => void;
  onReset: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onApply,
  onReset
}) => {
  return (
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
                onSelect={onDateFromChange}
                disabled={(date) => dateTo ? date > dateTo : false}
                initialFocus
              />
              <CalendarComponent
                mode="single"
                selected={dateTo}
                onSelect={onDateToChange}
                disabled={(date) => dateFrom ? date < dateFrom : false}
                initialFocus
              />
            </div>
          </div>
        </div>
        <div className="p-3 border-t flex justify-between">
          <Button
            variant="ghost"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button onClick={onApply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
