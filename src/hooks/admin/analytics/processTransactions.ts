
import { format, parseISO } from 'date-fns';
import { AnalyticsData } from './types';

/**
 * Processes raw transaction data into analytics information
 */
export const processTransactions = (transactions: any[]): AnalyticsData => {
  if (!transactions.length) {
    console.log('No transactions to process for analytics');
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
  
  console.log(`Processing ${transactions.length} transactions for analytics`);
  
  // Calculate total volume - use completed transactions unless status filter is explicitly set
  const volumeTransactions = transactions.filter(tx => tx.status === 'completed');

  console.log(`Calculating volume based on ${volumeTransactions.length} transactions (completed transactions)`);
  
  const totalVolume = volumeTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  console.log('Total calculated volume:', totalVolume);
  
  // Calculate average transaction value
  const averageTransaction = volumeTransactions.length > 0 
    ? totalVolume / volumeTransactions.length 
    : 0;
  
  // Group by day for time series
  const volumeByDay = volumeTransactions.reduce((acc, tx) => {
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
    transactionCount: volumeTransactions.length,
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
