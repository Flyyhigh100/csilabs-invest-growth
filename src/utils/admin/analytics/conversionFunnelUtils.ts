
import { supabase } from '@/integrations/supabase/client';

export interface ConversionStageData {
  stage: string;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeToNext?: number; // in days
}

export const calculateRealConversionFunnel = async (includeTestData: boolean = false): Promise<ConversionStageData[]> => {
  try {
    // Fetch all profiles
    const profilesQuery = supabase.from('profiles').select('id, created_at, wallet_address');
    const { data: profiles } = await profilesQuery;

    // Fetch KYC data
    const kycQuery = supabase
      .from('kyc_verifications')
      .select('user_id, status, submitted_at, approved_at, created_at');
    
    if (!includeTestData) {
      kycQuery.eq('is_test', false);
    }
    
    const { data: kycData } = await kycQuery;

    // Fetch transaction data
    const transactionsQuery = supabase
      .from('transactions')
      .select('user_id, status, created_at, token_sent');
    
    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }
    
    const { data: transactions } = await transactionsQuery;

    if (!profiles || !kycData || !transactions) {
      throw new Error('Failed to fetch required data');
    }

    // Calculate funnel stages
    const totalRegistrations = profiles.length;
    
    // Users who have saved their wallet address
    const walletAddressSavedUsers = new Set(
      profiles.filter(p => p.wallet_address && p.wallet_address.trim() !== '').map(p => p.id)
    );
    
    // Users who submitted KYC
    const kycSubmittedUsers = new Set(
      kycData.filter(k => k.status !== 'not_started').map(k => k.user_id)
    );
    
    // Users with approved KYC
    const kycApprovedUsers = new Set(
      kycData.filter(k => k.status === 'approved').map(k => k.user_id)
    );
    
    // Users who made their first purchase
    const firstPurchaseUsers = new Set(
      transactions.filter(t => t.status === 'completed').map(t => t.user_id)
    );
    
    // Users who received tokens
    const tokenReceivedUsers = new Set(
      transactions.filter(t => t.status === 'completed' && t.token_sent).map(t => t.user_id)
    );

    // Calculate average time between stages
    const calculateAverageTime = (fromSet: Set<string>, toSet: Set<string>, fromData: any[], toData: any[]) => {
      const times: number[] = [];
      for (const userId of toSet) {
        if (fromSet.has(userId)) {
          const fromRecord = fromData.find(d => d.user_id === userId || d.id === userId);
          const toRecord = toData.find(d => d.user_id === userId || d.id === userId);
          if (fromRecord && toRecord) {
            const fromTime = new Date(fromRecord.created_at || fromRecord.submitted_at);
            const toTime = new Date(toRecord.created_at || toRecord.submitted_at || toRecord.approved_at);
            const diffDays = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays >= 0) times.push(diffDays);
          }
        }
      }
      return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    };

    const funnelData: ConversionStageData[] = [
      {
        stage: 'Registration',
        users: totalRegistrations,
        conversionRate: 100,
        dropoffRate: 0,
        averageTimeToNext: calculateAverageTime(
          new Set(profiles.map(p => p.id)),
          walletAddressSavedUsers,
          profiles,
          profiles.filter(p => p.wallet_address)
        )
      },
      {
        stage: 'Wallet Address Saved',
        users: walletAddressSavedUsers.size,
        conversionRate: totalRegistrations > 0 ? (walletAddressSavedUsers.size / totalRegistrations) * 100 : 0,
        dropoffRate: totalRegistrations > 0 ? ((totalRegistrations - walletAddressSavedUsers.size) / totalRegistrations) * 100 : 0,
        averageTimeToNext: calculateAverageTime(
          walletAddressSavedUsers,
          kycSubmittedUsers,
          profiles.filter(p => p.wallet_address),
          kycData.filter(k => k.submitted_at)
        )
      },
      {
        stage: 'KYC Submitted',
        users: kycSubmittedUsers.size,
        conversionRate: walletAddressSavedUsers.size > 0 ? (kycSubmittedUsers.size / walletAddressSavedUsers.size) * 100 : 0,
        dropoffRate: walletAddressSavedUsers.size > 0 ? ((walletAddressSavedUsers.size - kycSubmittedUsers.size) / walletAddressSavedUsers.size) * 100 : 0,
        averageTimeToNext: calculateAverageTime(
          kycSubmittedUsers,
          kycApprovedUsers,
          kycData.filter(k => k.submitted_at),
          kycData.filter(k => k.approved_at)
        )
      },
      {
        stage: 'KYC Approved',
        users: kycApprovedUsers.size,
        conversionRate: kycSubmittedUsers.size > 0 ? (kycApprovedUsers.size / kycSubmittedUsers.size) * 100 : 0,
        dropoffRate: kycSubmittedUsers.size > 0 ? ((kycSubmittedUsers.size - kycApprovedUsers.size) / kycSubmittedUsers.size) * 100 : 0,
        averageTimeToNext: calculateAverageTime(
          kycApprovedUsers,
          firstPurchaseUsers,
          kycData.filter(k => k.approved_at),
          transactions.filter(t => t.status === 'completed')
        )
      },
      {
        stage: 'First Purchase',
        users: firstPurchaseUsers.size,
        conversionRate: kycApprovedUsers.size > 0 ? (firstPurchaseUsers.size / kycApprovedUsers.size) * 100 : 0,
        dropoffRate: kycApprovedUsers.size > 0 ? ((kycApprovedUsers.size - firstPurchaseUsers.size) / kycApprovedUsers.size) * 100 : 0,
        averageTimeToNext: calculateAverageTime(
          firstPurchaseUsers,
          tokenReceivedUsers,
          transactions.filter(t => t.status === 'completed'),
          transactions.filter(t => t.token_sent)
        )
      },
      {
        stage: 'Token Received',
        users: tokenReceivedUsers.size,
        conversionRate: firstPurchaseUsers.size > 0 ? (tokenReceivedUsers.size / firstPurchaseUsers.size) * 100 : 0,
        dropoffRate: firstPurchaseUsers.size > 0 ? ((firstPurchaseUsers.size - tokenReceivedUsers.size) / firstPurchaseUsers.size) * 100 : 0
      }
    ];

    return funnelData;
  } catch (error) {
    console.error('Error calculating conversion funnel:', error);
    throw error;
  }
};
