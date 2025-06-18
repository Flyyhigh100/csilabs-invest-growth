
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from './useTestDataToggle';

interface TransactionAnalyticsOptions {
  timeRange?: string;
  startDate?: Date;
  endDate?: Date;
}

export const useTransactionAnalytics = (options: TransactionAnalyticsOptions = {}) => {
  const { includeTestData } = useTestDataToggle();
  
  return useQuery({
    queryKey: ['transaction-analytics', options, includeTestData],
    queryFn: async () => {
      console.log('🔄 Fetching transaction analytics with options:', options, 'includeTestData:', includeTestData);
      
      // Determine date range - use consistent logic
      let startDate: Date;
      let endDate = new Date();
      
      if (options.startDate) {
        startDate = options.startDate;
      } else if (options.timeRange) {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(options.timeRange));
      } else {
        // Default to last 30 days for consistency
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }
      
      if (options.endDate) {
        endDate = options.endDate;
      }
      
      console.log('📅 Date range:', startDate.toISOString(), 'to', endDate.toISOString());
      
      // Build consistent transaction query
      let transactionQuery = supabase
        .from('transactions')
        .select('*')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('completed_at', { ascending: false });
      
      // Apply test data filter consistently
      if (!includeTestData) {
        transactionQuery = transactionQuery.eq('is_test', false);
      }
      
      const { data: transactions, error } = await transactionQuery;
      
      if (error) throw error;
      
      console.log(`✅ Found ${transactions?.length || 0} completed transactions in date range`);
      
      // Calculate analytics
      const totalTransactions = transactions?.length || 0;
      const totalVolume = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
      const averageTransactionSize = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
      
      // Group by payment method
      const paymentMethodBreakdown = transactions?.reduce((acc, tx) => {
        if (!acc[tx.payment_method]) {
          acc[tx.payment_method] = { volume: 0, count: 0 };
        }
        acc[tx.payment_method].volume += Number(tx.amount);
        acc[tx.payment_method].count += 1;
        return acc;
      }, {} as Record<string, { volume: number; count: number }>) || {};
      
      // Group by time period for charts
      const volumeOverTime = transactions?.reduce((acc, tx) => {
        const date = new Date(tx.completed_at || tx.created_at);
        const key = date.toISOString().split('T')[0]; // Daily grouping
        
        if (!acc[key]) {
          acc[key] = { date: key, volume: 0, count: 0 };
        }
        
        acc[key].volume += Number(tx.amount);
        acc[key].count += 1;
        
        return acc;
      }, {} as Record<string, { date: string; volume: number; count: number }>) || {};
      
      const volumeOverTimeArray = Object.values(volumeOverTime).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      return {
        transactions: transactions || [],
        totalTransactions,
        totalVolume,
        averageTransactionSize,
        paymentMethodBreakdown,
        volumeOverTime: volumeOverTimeArray,
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000,
  });
};
