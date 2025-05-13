
import { format, parseISO, startOfDay, isValid } from 'date-fns';

/**
 * Process raw transaction data into analytics format
 */
export const processTransactions = (transactions: any[]): any => {
  if (!transactions || transactions.length === 0) {
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

  // Calculate total volume and count
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const transactionCount = transactions.length;
  const averageTransaction = totalVolume / transactionCount;

  // Process volume over time
  const volumeByDay = new Map();
  transactions.forEach(tx => {
    if (!tx.created_at) return;
    
    try {
      const date = parseISO(tx.created_at);
      if (!isValid(date)) return;
      
      const dayKey = format(date, 'yyyy-MM-dd');
      const existing = volumeByDay.get(dayKey) || { date: dayKey, amount: 0, count: 0 };
      existing.amount += tx.amount;
      existing.count += 1;
      volumeByDay.set(dayKey, existing);
    } catch (err) {
      console.error('Error processing date for transaction:', tx.id, err);
    }
  });
  
  const volumeOverTime = Array.from(volumeByDay.values())
    .sort((a, b) => a.date.localeCompare(b.date));

  // Find best day
  let bestDay = 'N/A';
  let bestDayVolume = 0;
  volumeOverTime.forEach(day => {
    if (day.amount > bestDayVolume) {
      bestDayVolume = day.amount;
      bestDay = format(parseISO(day.date), 'MMM d');
    }
  });

  // Process payment methods
  const methodCounts = new Map();
  const methodVolumes = new Map();
  
  transactions.forEach(tx => {
    const method = tx.payment_method || 'unknown';
    methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
    methodVolumes.set(method, (methodVolumes.get(method) || 0) + tx.amount);
  });
  
  const paymentMethods = Array.from(methodVolumes.entries())
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      value,
      count: methodCounts.get(name) || 0,
    }))
    .sort((a, b) => b.value - a.value);

  // Find preferred method
  let preferredMethod = 'None';
  let preferredMethodCount = 0;
  let preferredMethodPercentage = 0;
  
  if (paymentMethods.length > 0) {
    preferredMethod = paymentMethods[0].name;
    preferredMethodCount = paymentMethods[0].count;
    preferredMethodPercentage = Math.round((preferredMethodCount / transactionCount) * 100);
  }

  // Process status breakdown
  const statusCounts = new Map();
  transactions.forEach(tx => {
    const status = tx.status || 'unknown';
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  });
  
  const statusBreakdown = Array.from(statusCounts.entries())
    .map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize first letter
      count: count as number,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalVolume,
    transactionCount,
    averageTransaction,
    volumeOverTime,
    paymentMethods,
    statusBreakdown,
    preferredMethod,
    preferredMethodPercentage,
    bestDay,
    bestDayVolume
  };
};
