
import React from 'react';
import { useTransactionFilters, TransactionFilters } from './filters/useTransactionFilters';
import SearchFilter from './filters/SearchFilter';
import StatusFilter from './filters/StatusFilter';
import PaymentMethodFilter from './filters/PaymentMethodFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import AmountRangeFilter from './filters/AmountRangeFilter';
import ActionButtons from './filters/ActionButtons';

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void;
  onExportCSV: () => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onFilterChange,
  onExportCSV 
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    dateFrom,
    dateTo,
    onSubmit
  } = useTransactionFilters(onFilterChange);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchFilter register={register} />
        <StatusFilter onValueChange={(value) => setValue('status', value)} />
        <PaymentMethodFilter onValueChange={(value) => setValue('paymentMethod', value)} />
        <DateRangeFilter 
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(date) => setValue('dateFrom', date)}
          onDateToChange={(date) => setValue('dateTo', date)}
          onApply={() => handleSubmit(onSubmit)()}
          onReset={() => {
            setValue('dateFrom', undefined);
            setValue('dateTo', undefined);
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <AmountRangeFilter register={register} />
        <div className="flex-grow"></div>
        <ActionButtons onExportCSV={onExportCSV} />
      </div>
    </form>
  );
};

export default TransactionFilters;
