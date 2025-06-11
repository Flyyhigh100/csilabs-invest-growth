
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeData {
  hourlyActivity: Array<{
    hour: string;
    transactions: number;
    registrations: number;
    revenue: number;
  }>;
  currentMetrics: {
    activeUsers: number;
    onlineUsers: number;
    todayRevenue: number;
    todayTransactions: number;
  };
  recentActivity: Array<{
    time: string;
    type: string;
    amount?: number;
    user: string;
  }>;
}

export const calculateRealTimeData = async (includeTestData: boolean = false): Promise<RealTimeData> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get transactions from last 24 hours
    const transactionsQuery = supabase
      .from('transactions')
      .select('*')
      .gte('created_at', last24Hours.toISOString());

    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }

    const { data: transactions } = await transactionsQuery;

    // Get registrations from last 24 hours
    const profilesQuery = supabase
      .from('profiles')
      .select('*')
      .gte('created_at', last24Hours.toISOString());

    const { data: profiles } = await profilesQuery;

    // Get KYC submissions from last 24 hours
    const kycQuery = supabase
      .from('kyc_verifications')
      .select('*')
      .gte('created_at', last24Hours.toISOString());

    if (!includeTestData) {
      kycQuery.eq('is_test', false);
    }

    const { data: kycData } = await kycQuery;

    if (!transactions || !profiles || !kycData) {
      throw new Error('Failed to fetch real-time data');
    }

    // Calculate hourly activity
    const hourlyActivity = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(last24Hours.getTime() + i * 60 * 60 * 1000);
      const hourStr = hour.getHours().toString().padStart(2, '0') + ':00';
      
      const hourTransactions = transactions.filter(tx => {
        const txHour = new Date(tx.created_at).getHours();
        return txHour === hour.getHours();
      });

      const hourRegistrations = profiles.filter(profile => {
        const regHour = new Date(profile.created_at).getHours();
        return regHour === hour.getHours();
      });

      const hourRevenue = hourTransactions
        .filter(tx => tx.status === 'completed')
        .reduce((sum, tx) => sum + Number(tx.amount), 0);

      return {
        hour: hourStr,
        transactions: hourTransactions.length,
        registrations: hourRegistrations.length,
        revenue: hourRevenue
      };
    });

    // Calculate current metrics
    const todayTransactions = transactions.filter(tx => 
      new Date(tx.created_at) >= today
    );

    const todayRevenue = todayTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    // Count unique users who had transactions in last 24h as "active"
    const activeUserIds = new Set(transactions.map(tx => tx.user_id));
    const activeUsers = activeUserIds.size;

    // Simulate online users (would need real presence tracking)
    const onlineUsers = Math.floor(activeUsers * 0.3); // Rough estimate

    // Recent activity (last 10 activities) - fix the amount property issue
    const allActivities = [
      ...transactions.map(tx => ({
        time: new Date(tx.created_at),
        type: 'transaction',
        amount: Number(tx.amount),
        userId: tx.user_id,
        data: tx
      })),
      ...profiles.map(profile => ({
        time: new Date(profile.created_at),
        type: 'registration',
        amount: undefined, // No amount for registrations
        userId: profile.id,
        data: profile
      })),
      ...kycData.map(kyc => ({
        time: new Date(kyc.created_at),
        type: 'kyc',
        amount: undefined, // No amount for KYC submissions
        userId: kyc.user_id,
        data: kyc
      }))
    ];

    const sortedActivities = allActivities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 10);

    const recentActivity = sortedActivities.map(activity => ({
      time: activity.time.toLocaleTimeString(),
      type: activity.type,
      amount: activity.amount, // This will be undefined for non-transaction activities
      user: activity.userId.slice(0, 8) + '...' // Truncated user ID for privacy
    }));

    return {
      hourlyActivity,
      currentMetrics: {
        activeUsers,
        onlineUsers,
        todayRevenue,
        todayTransactions: todayTransactions.length
      },
      recentActivity
    };
  } catch (error) {
    console.error('Error calculating real-time data:', error);
    throw error;
  }
};
