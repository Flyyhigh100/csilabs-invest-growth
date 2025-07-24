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
    id: string;
    time: string;
    type: 'transaction' | 'registration' | 'kyc_update' | 'token_delivery';
    amount?: number;
    userId: string;
    userEmail?: string;
    userName?: string;
    userInitials?: string;
    description: string;
    detailedDescription: string;
    status: 'success' | 'pending' | 'failed' | 'approved' | 'rejected';
    isLive: boolean;
    tokenAmount?: number;
    paymentMethod?: string;
    transactionId?: string;
    kycStatus?: string;
  }>;
}

const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '??';
};

const getFullName = (firstName?: string, lastName?: string): string => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Unknown User';
};

export const calculateRealTimeData = async (includeTestData: boolean = false): Promise<RealTimeData> => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get transactions with user profiles from last 24 hours
    const transactionsQuery = supabase
      .from('transactions')
      .select(`
        *,
        profiles!inner(id, email, first_name, last_name)
      `)
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: false });

    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }

    const { data: transactions } = await transactionsQuery;

    // Get new registrations from last 24 hours
    const profilesQuery = supabase
      .from('profiles')
      .select('*')
      .gte('created_at', last24Hours.toISOString())
      .order('created_at', { ascending: false });

    const { data: profiles } = await profilesQuery;

    // Get KYC updates from last 24 hours with user profiles
    const kycQuery = supabase
      .from('kyc_verifications')
      .select(`
        *,
        profiles!inner(id, email, first_name, last_name)
      `)
      .gte('updated_at', last24Hours.toISOString())
      .order('updated_at', { ascending: false });

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

    // Create enhanced recent activity with rich user information
    const allActivities = [
      // Transaction activities
      ...transactions.slice(0, 15).map(tx => {
        const profile = (tx as any).profiles;
        const userName = getFullName(profile?.first_name, profile?.last_name);
        const userInitials = getInitials(profile?.first_name, profile?.last_name);
        
        let activityType: 'transaction' | 'token_delivery' = 'transaction';
        let description = '';
        let detailedDescription = '';
        let status: 'success' | 'pending' | 'failed' = 'pending';
        
        if (tx.status === 'completed' && tx.token_sent) {
          activityType = 'token_delivery';
          description = `${userName} received tokens`;
          detailedDescription = `${userName} (${profile?.email}) received ${Number(tx.token_amount || 0).toFixed(2)} tokens from ${tx.payment_method} payment of $${Number(tx.amount).toFixed(2)}`;
          status = 'success';
        } else if (tx.status === 'completed') {
          description = `${userName} completed payment`;
          detailedDescription = `${userName} (${profile?.email}) completed ${tx.payment_method} payment of $${Number(tx.amount).toFixed(2)} - Tokens pending delivery`;
          status = 'success';
        } else if (tx.status === 'pending') {
          description = `${userName} initiated payment`;
          detailedDescription = `${userName} (${profile?.email}) initiated ${tx.payment_method} payment of $${Number(tx.amount).toFixed(2)} - Status: Pending`;
          status = 'pending';
        } else {
          description = `${userName} payment failed`;
          detailedDescription = `${userName} (${profile?.email}) ${tx.payment_method} payment of $${Number(tx.amount).toFixed(2)} failed`;
          status = 'failed';
        }
        
        return {
          id: tx.id,
          time: new Date(tx.created_at),
          type: activityType,
          amount: Number(tx.amount),
          userId: tx.user_id,
          userEmail: profile?.email,
          userName,
          userInitials,
          description,
          detailedDescription,
          status,
          tokenAmount: Number(tx.token_amount || 0),
          paymentMethod: tx.payment_method,
          transactionId: tx.transaction_id,
          kycStatus: undefined,
          data: tx
        };
      }),
      
      // New user registrations
      ...profiles.slice(0, 10).map(profile => {
        const userName = getFullName(profile.first_name, profile.last_name);
        const userInitials = getInitials(profile.first_name, profile.last_name);
        
        return {
          id: profile.id,
          time: new Date(profile.created_at),
          type: 'registration' as const,
          amount: undefined,
          userId: profile.id,
          userEmail: profile.email,
          userName,
          userInitials,
          description: `${userName} joined the platform`,
          detailedDescription: `New user registration: ${userName} (${profile.email}) joined the platform`,
          status: 'success' as const,
          tokenAmount: undefined,
          paymentMethod: undefined,
          transactionId: undefined,
          kycStatus: undefined,
          data: profile
        };
      }),
      
      // KYC status updates
      ...kycData.slice(0, 10).map(kyc => {
        const profile = (kyc as any).profiles;
        const userName = getFullName(profile?.first_name, profile?.last_name);
        const userInitials = getInitials(profile?.first_name, profile?.last_name);
        
        let description = '';
        let detailedDescription = '';
        let status: 'success' | 'pending' | 'failed' | 'approved' | 'rejected' = 'pending';
        
        if (kyc.status === 'approved') {
          description = `${userName} KYC approved`;
          detailedDescription = `${userName} (${profile?.email}) KYC verification was approved`;
          status = 'approved';
        } else if (kyc.status === 'rejected') {
          description = `${userName} KYC rejected`;
          detailedDescription = `${userName} (${profile?.email}) KYC verification was rejected${kyc.rejection_reason ? `: ${kyc.rejection_reason}` : ''}`;
          status = 'rejected';
        } else if (kyc.status === 'pending') {
          description = `${userName} submitted KYC`;
          detailedDescription = `${userName} (${profile?.email}) submitted KYC verification for review`;
          status = 'pending';
        } else {
          description = `${userName} KYC updated`;
          detailedDescription = `${userName} (${profile?.email}) KYC status: ${kyc.status}`;
          status = 'pending';
        }
        
        return {
          id: kyc.id,
          time: new Date(kyc.updated_at),
          type: 'kyc_update' as const,
          amount: undefined,
          userId: kyc.user_id,
          userEmail: profile?.email,
          userName,
          userInitials,
          description,
          detailedDescription,
          status,
          tokenAmount: undefined,
          paymentMethod: undefined,
          transactionId: undefined,
          kycStatus: kyc.status,
          data: kyc
        };
      })
    ];

    // Sort all activities by time and take the most recent 20
    const sortedActivities = allActivities
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 20);

    const recentActivity = sortedActivities.map(activity => {
      const timeDiff = now.getTime() - activity.time.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      
      let timeAgo: string;
      if (minutesAgo < 1) {
        timeAgo = 'Just now';
      } else if (minutesAgo < 60) {
        timeAgo = `${minutesAgo}m ago`;
      } else {
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        if (hoursAgo < 24) {
          timeAgo = `${hoursAgo}h ago`;
        } else {
          timeAgo = activity.time.toLocaleDateString();
        }
      }
      
      return {
        id: activity.id,
        time: timeAgo,
        type: activity.type,
        amount: activity.amount,
        userId: activity.userId,
        userEmail: activity.userEmail,
        userName: activity.userName,
        userInitials: activity.userInitials,
        description: activity.description,
        detailedDescription: activity.detailedDescription,
        status: activity.status,
        isLive: minutesAgo < 30, // Consider "live" if within last 30 minutes
        tokenAmount: activity.tokenAmount,
        paymentMethod: activity.paymentMethod,
        transactionId: activity.transactionId,
        kycStatus: activity.kycStatus
      };
    });

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