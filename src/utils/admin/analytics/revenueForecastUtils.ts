
import { supabase } from '@/integrations/supabase/client';

export interface HistoricalData {
  period: string;
  actualRevenue: number;
  actualUsers: number;
}

export interface PredictedData {
  period: string;
  predictedRevenue: number;
  predictedUsers: number;
  confidence: number;
}

export const calculateRealRevenueForecasting = async (
  includeTestData: boolean = false
): Promise<{ historicalData: HistoricalData[]; predictedData: PredictedData[] }> => {
  try {
    // Fetch historical transaction data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const transactionsQuery = supabase
      .from('transactions')
      .select('amount, created_at, user_id, status')
      .eq('status', 'completed')
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }

    const { data: transactions } = await transactionsQuery;

    if (!transactions) {
      throw new Error('Failed to fetch transaction data');
    }

    // Group transactions by month
    const monthlyGroups = new Map<string, any[]>();
    transactions.forEach(tx => {
      const date = new Date(tx.created_at);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, []);
      }
      monthlyGroups.get(monthKey)!.push(tx);
    });

    // Calculate historical data
    const historicalData: HistoricalData[] = [];
    const sortedMonths = Array.from(monthlyGroups.keys()).sort();

    sortedMonths.forEach(monthKey => {
      const monthTransactions = monthlyGroups.get(monthKey)!;
      const revenue = monthTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const uniqueUsers = new Set(monthTransactions.map(tx => tx.user_id)).size;

      const date = new Date(monthKey + '-01');
      const periodLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      historicalData.push({
        period: periodLabel,
        actualRevenue: revenue,
        actualUsers: uniqueUsers
      });
    });

    // Simple linear regression for revenue prediction
    const calculateLinearTrend = (data: number[]): { slope: number; intercept: number } => {
      const n = data.length;
      const xSum = data.reduce((sum, _, i) => sum + i, 0);
      const ySum = data.reduce((sum, val) => sum + val, 0);
      const xySum = data.reduce((sum, val, i) => sum + (i * val), 0);
      const xxSum = data.reduce((sum, _, i) => sum + (i * i), 0);

      const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
      const intercept = (ySum - slope * xSum) / n;

      return { slope, intercept };
    };

    // Calculate trends for revenue and users
    const revenueValues = historicalData.map(d => d.actualRevenue);
    const userValues = historicalData.map(d => d.actualUsers);

    const revenueTrend = calculateLinearTrend(revenueValues);
    const userTrend = calculateLinearTrend(userValues);

    // Generate predictions for next 3 months
    const predictedData: PredictedData[] = [];
    const lastIndex = historicalData.length - 1;

    for (let i = 1; i <= 3; i++) {
      const nextIndex = lastIndex + i;
      const predictedRevenue = revenueTrend.slope * nextIndex + revenueTrend.intercept;
      const predictedUsers = userTrend.slope * nextIndex + userTrend.intercept;

      // Calculate confidence based on data variance
      const revenueVariance = revenueValues.reduce((sum, val) => {
        const predicted = revenueTrend.slope * revenueValues.indexOf(val) + revenueTrend.intercept;
        return sum + Math.pow(val - predicted, 2);
      }, 0) / revenueValues.length;

      const confidence = Math.max(60, Math.min(95, 100 - (Math.sqrt(revenueVariance) / Math.max(...revenueValues)) * 100));

      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + i);
      const periodLabel = futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      predictedData.push({
        period: periodLabel,
        predictedRevenue: Math.max(0, predictedRevenue),
        predictedUsers: Math.max(0, Math.round(predictedUsers)),
        confidence: Math.round(confidence)
      });
    }

    return { historicalData, predictedData };
  } catch (error) {
    console.error('Error calculating revenue forecasting:', error);
    throw error;
  }
};
