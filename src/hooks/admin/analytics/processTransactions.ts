
import { format, parseISO, subMonths, startOfMonth } from 'date-fns';
import { AnalyticsData } from './types';

interface DayData {
  date: string;
  amount: number;
  count: number;
}

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
  const volumeByDay: Record<string, DayData> = volumeTransactions.reduce((acc, tx) => {
    const day = format(parseISO(tx.created_at), 'yyyy-MM-dd');
    if (!acc[day]) {
      acc[day] = { date: format(parseISO(tx.created_at), 'MM/dd'), amount: 0, count: 0 };
    }
    acc[day].amount += Number(tx.amount) || 0;
    acc[day].count++;
    return acc;
  }, {} as Record<string, DayData>);
  
  // Sort days and convert to array
  const volumeOverTime: DayData[] = Object.values(volumeByDay).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // If we have no data points, create placeholder months starting from March
  if (volumeOverTime.length === 0) {
    const currentDate = new Date();
    const startDate = new Date(2025, 2, 1); // March 1, 2025
    
    // Generate monthly placeholders from March to current month
    let currentMonth = startDate;
    while (currentMonth <= currentDate) {
      const monthLabel = format(currentMonth, 'MM/dd');
      volumeOverTime.push({
        date: monthLabel,
        amount: 0,
        count: 0
      });
      currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    }
  }
  
  // Find best day
  let bestDay = { date: 'N/A', volume: 0 };
  Object.entries(volumeByDay).forEach(([day, data]) => {
    if (data.amount > bestDay.volume) {
      bestDay = { date: format(parseISO(day), 'MMM dd'), volume: data.amount };
    }
  });
  
  // Group by payment method
  const methodCounts: Record<string, { name: string; value: number; count: number }> = transactions.reduce((acc, tx) => {
    const method = tx.payment_method || 'unknown';
    if (!acc[method]) {
      acc[method] = { name: method, value: 0, count: 0 };
    }
    acc[method].value += Number(tx.amount) || 0;
    acc[method].count++;
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number }>);
  
  // Find preferred method
  let preferredMethod = { method: 'None', count: 0, percentage: 0 };
  Object.entries(methodCounts).forEach(([method, data]) => {
    if (data.count > preferredMethod.count) {
      preferredMethod = {
        method,
        count: data.count,
        percentage: Math.round((data.count / transactions.length) * 100)
      };
    }
  });
  
  // Group by status
  const statusCounts: Record<string, { status: string; count: number }> = transactions.reduce((acc, tx) => {
    const status = tx.status || 'unknown';
    if (!acc[status]) {
      acc[status] = { status, count: 0 };
    }
    acc[status].count++;
    return acc;
  }, {} as Record<string, { status: string; count: number }>);
  
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
