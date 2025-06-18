
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from './useTestDataToggle';
import { format } from 'date-fns';

interface TransactionAnalyticsOptions {
  timeRange?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const useTransactionAnalytics = (options: TransactionAnalyticsOptions = {}) => {
  const { includeTestData, setIncludeTestData } = useTestDataToggle();
  
  const queryResult = useQuery({
    queryKey: ['transaction-analytics', options, includeTestData],
    queryFn: async () => {
      console.log('🔄 Fetching transaction analytics with options:', options, 'includeTestData:', includeTestData);
      
      // Determine date range - default to "all time" (March 1, 2025 launch date)
      let startDate: Date;
      let endDate = new Date();
      
      if (options.startDate) {
        startDate = options.startDate;
      } else if (options.timeRange) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(options.timeRange));
      } else {
        // Default to platform launch date for all-time analytics
        startDate = new Date(2025, 2, 1); // March 1, 2025
      }
      
      if (options.endDate) {
        endDate = options.endDate;
      }
      
      console.log('📅 Date range:', startDate.toISOString(), 'to', endDate.toISOString());
      
      // Build transaction query
      let transactionQuery = supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('completed_at', { ascending: false });
      
      // Apply test data filter consistently
      if (!includeTestData) {
        transactionQuery = transactionQuery.eq('is_test', false);
      }
      
      // Apply additional filters
      if (options.status) {
        transactionQuery = transactionQuery.eq('status', options.status);
      }
      
      if (options.paymentMethod) {
        transactionQuery = transactionQuery.eq('payment_method', options.paymentMethod);
      }
      
      if (options.minAmount !== undefined) {
        transactionQuery = transactionQuery.gte('amount', options.minAmount);
      }
      
      if (options.maxAmount !== undefined) {
        transactionQuery = transactionQuery.lte('amount', options.maxAmount);
      }
      
      const { data: transactions, error } = await transactionQuery;
      
      if (error) throw error;
      
      console.log(`✅ Found ${transactions?.length || 0} transactions in date range`);
      
      // Filter completed transactions for main analytics
      const completedTransactions = transactions?.filter(tx => tx.status === 'completed') || [];
      
      // Calculate basic analytics
      const totalTransactions = completedTransactions.length;
      const totalVolume = completedTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const averageTransactionSize = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
      
      // Calculate payment method breakdown
      const paymentMethodBreakdown = completedTransactions.reduce((acc, tx) => {
        if (!acc[tx.payment_method]) {
          acc[tx.payment_method] = { volume: 0, count: 0 };
        }
        acc[tx.payment_method].volume += Number(tx.amount);
        acc[tx.payment_method].count += 1;
        return acc;
      }, {} as Record<string, { volume: number; count: number }>);
      
      // Find preferred payment method
      const preferredMethodEntry = Object.entries(paymentMethodBreakdown)
        .sort(([,a], [,b]) => b.count - a.count)[0];
      const preferredMethod = preferredMethodEntry?.[0] || 'None';
      const preferredMethodPercentage = preferredMethodEntry 
        ? Math.round((preferredMethodEntry[1].count / totalTransactions) * 100)
        : 0;
      
      // Convert payment method breakdown to chart format
      const paymentMethods = Object.entries(paymentMethodBreakdown).map(([method, data]) => ({
        name: method,
        value: data.volume
      }));
      
      // Calculate status breakdown for all transactions
      const statusBreakdown = transactions?.reduce((acc, tx) => {
        const existing = acc.find(item => item.status === tx.status);
        if (existing) {
          existing.count += 1;
        } else {
          acc.push({ status: tx.status, count: 1 });
        }
        return acc;
      }, [] as Array<{ status: string; count: number }>) || [];
      
      // Group by time period for volume over time chart
      const volumeOverTime = completedTransactions.reduce((acc, tx) => {
        const date = new Date(tx.completed_at || tx.created_at);
        const key = format(date, 'yyyy-MM-dd');
        
        if (!acc[key]) {
          acc[key] = { date: key, amount: 0, volume: 0, count: 0 };
        }
        
        const amount = Number(tx.amount);
        acc[key].amount += amount;
        acc[key].volume += amount;
        acc[key].count += 1;
        
        return acc;
      }, {} as Record<string, { date: string; amount: number; volume: number; count: number }>);
      
      const volumeOverTimeArray = Object.values(volumeOverTime).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Find best day
      const bestDayEntry = volumeOverTimeArray.sort((a, b) => b.volume - a.volume)[0];
      const bestDay = bestDayEntry ? format(new Date(bestDayEntry.date), 'MMM dd') : 'N/A';
      const bestDayVolume = bestDayEntry?.volume || 0;
      
      return {
        // Raw data
        transactions: transactions || [],
        rawTransactions: transactions || [],
        
        // Basic metrics
        totalTransactions,
        transactionCount: totalTransactions,
        totalVolume,
        averageTransactionSize,
        averageTransaction: averageTransactionSize,
        
        // Payment method analytics
        paymentMethodBreakdown,
        paymentMethods,
        preferredMethod,
        preferredMethodPercentage,
        
        // Status analytics
        statusBreakdown,
        
        // Time-based analytics
        volumeOverTime: volumeOverTimeArray,
        bestDay,
        bestDayVolume,
        
        // Date range info
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000,
  });

  return {
    ...queryResult,
    includeTestData,
    setIncludeTestData,
    rawTransactions: queryResult.data?.rawTransactions || []
  };
};
