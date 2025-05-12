
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';
import { format, subDays, parseISO, isSameDay } from 'date-fns';

interface TransactionAnalyticsProps {
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

export const useTransactionAnalytics = (props: TransactionAnalyticsProps = {}) => {
  const { includeTestData } = useTestDataToggle();
  const { startDate, endDate, status, paymentMethod, minAmount, maxAmount } = props;
  
  // Convert dates to ISO strings for querying
  const startDateIso = startDate ? startDate.toISOString() : null;
  const endDateIso = endDate ? endDate.toISOString() : null;
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['transaction-analytics', includeTestData, startDateIso, endDateIso, status, paymentMethod, minAmount, maxAmount],
    queryFn: async () => {
      console.log('Fetching transaction analytics with filters:', props);
      
      try {
        // Build query with filters
        let query = supabase.from('transactions').select('*');
        
        // Apply test data filter
        if (!includeTestData) {
          query = query.eq('is_test', false);
        }
        
        // Apply date filters
        if (startDateIso) {
          query = query.gte('created_at', startDateIso);
        }
        
        if (endDateIso) {
          query = query.lte('created_at', endDateIso);
        }
        
        // Apply status filter
        if (status) {
          query = query.eq('status', status);
        }
        
        // Apply payment method filter
        if (paymentMethod) {
          query = query.eq('payment_method', paymentMethod);
        }
        
        // Apply amount filters
        if (minAmount !== undefined) {
          query = query.gte('amount', minAmount);
        }
        
        if (maxAmount !== undefined) {
          query = query.lte('amount', maxAmount);
        }
        
        const { data: transactions, error } = await query;
        
        if (error) throw error;
        
        // Process the transactions for analytics
        const result = processTransactions(transactions || []);
        
        return result;
      } catch (error) {
        console.error('Error fetching transaction analytics:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Process transactions into analytics data
  const processTransactions = (transactions: any[]) => {
    if (!transactions.length) {
      return {
        totalVolume: 0,
        transactionCount: 0,
        averageTransaction: 0,
        volumeOverTime: [],
        paymentMethods: [],
        statusBreakdown: [],
        preferredMethod: 'None',
        preferredMethodPercentage: 0,
        bestDay: 'N/A',
        bestDayVolume: 0
      };
    }
    
    // Calculate total volume
    const totalVolume = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    
    // Calculate average transaction value
    const averageTransaction = totalVolume / transactions.length;
    
    // Group by day for time series
    const volumeByDay = transactions.reduce((acc, tx) => {
      const day = format(parseISO(tx.created_at), 'yyyy-MM-dd');
      if (!acc[day]) {
        acc[day] = { date: format(parseISO(tx.created_at), 'MM/dd'), amount: 0, count: 0 };
      }
      acc[day].amount += Number(tx.amount) || 0;
      acc[day].count++;
      return acc;
    }, {});
    
    // Sort days and convert to array
    const volumeOverTime = Object.values(volumeByDay).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Find best day
    let bestDay = { date: 'N/A', volume: 0 };
    Object.entries(volumeByDay).forEach(([day, data]: [string, any]) => {
      if (data.amount > bestDay.volume) {
        bestDay = { date: format(parseISO(day), 'MMM dd'), volume: data.amount };
      }
    });
    
    // Group by payment method
    const methodCounts = transactions.reduce((acc, tx) => {
      const method = tx.payment_method || 'unknown';
      if (!acc[method]) {
        acc[method] = { name: method, value: 0, count: 0 };
      }
      acc[method].value += Number(tx.amount) || 0;
      acc[method].count++;
      return acc;
    }, {});
    
    // Find preferred method
    let preferredMethod = { method: 'None', count: 0, percentage: 0 };
    Object.entries(methodCounts).forEach(([method, data]: [string, any]) => {
      if (data.count > preferredMethod.count) {
        preferredMethod = {
          method,
          count: data.count,
          percentage: Math.round((data.count / transactions.length) * 100)
        };
      }
    });
    
    // Group by status
    const statusCounts = transactions.reduce((acc, tx) => {
      const status = tx.status || 'unknown';
      if (!acc[status]) {
        acc[status] = { status, count: 0 };
      }
      acc[status].count++;
      return acc;
    }, {});
    
    return {
      totalVolume,
      transactionCount: transactions.length,
      averageTransaction,
      volumeOverTime,
      paymentMethods: Object.values(methodCounts),
      statusBreakdown: Object.values(statusCounts),
      preferredMethod: preferredMethod.method,
      preferredMethodPercentage: preferredMethod.percentage,
      bestDay: bestDay.date,
      bestDayVolume: bestDay.volume
    };
  };
  
  return {
    data,
    isLoading,
    error,
    refetch,
    includeTestData
  };
};
