import { supabase } from '@/integrations/supabase/client';

export interface HistoricalMetrics {
  totalRevenue: number;
  completedTransactions: number;
  pendingTransactions: number;
  approvedKyc: number;
  activeUsers: number;
  tokensDistributed: number;
}

export interface MetricComparison {
  current: number;
  previous: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
  hasData: boolean;
  baseline: string;
}

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getTrend = (change: number): 'up' | 'down' | 'stable' => {
  if (change > 1) return 'up';
  if (change < -1) return 'down';
  return 'stable';
};

export const fetchMetricsForPeriod = async (
  startDate: Date, 
  endDate: Date, 
  includeTestData: boolean = false
): Promise<HistoricalMetrics> => {
  try {
    // Fetch data for the specified period
    const [transactionsRes, profilesRes, kycRes] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('is_test', includeTestData),
      supabase
        .from('profiles')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      supabase
        .from('kyc_verifications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('is_test', includeTestData)
    ]);

    const transactions = transactionsRes.data || [];
    const profiles = profilesRes.data || [];
    const kycVerifications = kycRes.data || [];

    const totalRevenue = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;
    const approvedKyc = kycVerifications.filter(k => k.status === 'approved').length;
    
    const tokensDistributed = transactions
      .filter(t => t.status === 'completed' && t.token_sent === true && t.token_amount != null)
      .reduce((sum, t) => sum + (Number(t.token_amount) || 0), 0);

    return {
      totalRevenue,
      completedTransactions,
      pendingTransactions,
      approvedKyc,
      activeUsers: profiles.length,
      tokensDistributed
    };
  } catch (error) {
    console.error('Error fetching historical metrics:', error);
    return {
      totalRevenue: 0,
      completedTransactions: 0,
      pendingTransactions: 0,
      approvedKyc: 0,
      activeUsers: 0,
      tokensDistributed: 0
    };
  }
};

export const compareMetrics = async (
  metric: keyof HistoricalMetrics,
  comparisonPeriod: 'day' | 'week' | 'month' = 'week',
  includeTestData: boolean = false
): Promise<MetricComparison> => {
  const now = new Date();
  
  // Calculate date ranges based on comparison period
  let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
  let baseline: string;

  switch (comparisonPeriod) {
    case 'day':
      // Today vs Yesterday
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      currentEnd = now;
      previousEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      previousStart = new Date(previousEnd.getTime() - 24 * 60 * 60 * 1000);
      baseline = 'vs. yesterday';
      break;
    
    case 'week':
      // This week vs Last week
      const daysFromMonday = (now.getDay() + 6) % 7;
      currentStart = new Date(now.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = now;
      previousEnd = new Date(currentStart.getTime());
      previousStart = new Date(previousEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      baseline = 'vs. last week';
      break;
    
    case 'month':
      // This month vs Last month
      currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
      currentEnd = now;
      previousEnd = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth() - 1, 1);
      baseline = 'vs. last month';
      break;
  }

  // Fetch metrics for both periods
  const [currentMetrics, previousMetrics] = await Promise.all([
    fetchMetricsForPeriod(currentStart, currentEnd, includeTestData),
    fetchMetricsForPeriod(previousStart, previousEnd, includeTestData)
  ]);

  const current = currentMetrics[metric];
  const previous = previousMetrics[metric];
  
  // Check if we have meaningful data
  const hasData = previous > 0 || current > 0;
  
  const percentageChange = calculatePercentageChange(current, previous);
  const trend = getTrend(percentageChange);

  return {
    current,
    previous,
    percentageChange,
    trend,
    hasData,
    baseline
  };
};

export const getCurrentMetrics = async (includeTestData: boolean = false): Promise<HistoricalMetrics> => {
  const now = new Date();
  const startOfTime = new Date('2020-01-01'); // Far enough back to include all data
  
  return fetchMetricsForPeriod(startOfTime, now, includeTestData);
};