
import { useForm } from 'react-hook-form';
import { ALL_STATUSES, ALL_PAYMENT_METHODS } from './constants';

export type TransactionFilters = {
  searchQuery?: string;
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  dateRange?: { from: Date; to: Date };
};

export type FilterFormValues = {
  searchQuery: string;
  status: string;
  paymentMethod: string;
  minAmount: number | undefined;
  maxAmount: number | undefined;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};

export const useTransactionFilters = (onFilterChange: (filters: TransactionFilters) => void) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<FilterFormValues>({
    defaultValues: {
      searchQuery: '',
      status: '',
      paymentMethod: '',
      minAmount: undefined,
      maxAmount: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    }
  });

  const dateFrom = watch('dateFrom');
  const dateTo = watch('dateTo');

  const onSubmit = (data: FilterFormValues) => {
    const filters = {
      searchQuery: data.searchQuery,
      status: data.status === ALL_STATUSES ? undefined : data.status,
      paymentMethod: data.paymentMethod === ALL_PAYMENT_METHODS ? undefined : data.paymentMethod,
      minAmount: data.minAmount ? Number(data.minAmount) : undefined,
      maxAmount: data.maxAmount ? Number(data.maxAmount) : undefined,
      dateRange: (data.dateFrom || data.dateTo) ? {
        from: data.dateFrom || new Date(0),
        to: data.dateTo || new Date()
      } : undefined
    };
    
    onFilterChange(filters);
  };

  return {
    register,
    handleSubmit,
    setValue, 
    watch,
    reset,
    dateFrom,
    dateTo,
    onSubmit
  };
};
