
import { supabase } from '@/integrations/supabase/client';

export interface ProcessingTimeData {
  kycProcessingTime: number;
  transactionProcessingTime: number;
  paymentMethodTimes: Array<{
    method: string;
    avgTime: number;
    count: number;
  }>;
  conversionStageTimes: Array<{
    stage: string;
    avgDays: number;
  }>;
}

export const calculateRealProcessingTimes = async (includeTestData: boolean = false): Promise<ProcessingTimeData> => {
  try {
    // Get KYC processing times
    const kycQuery = supabase
      .from('kyc_verifications')
      .select('submitted_at, approved_at, status');

    if (!includeTestData) {
      kycQuery.eq('is_test', false);
    }

    const { data: kycData } = await kycQuery;

    // Get transaction processing times - include user_id in the select
    const transactionsQuery = supabase
      .from('transactions')
      .select('user_id, created_at, completed_at, status, payment_method');

    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }

    const { data: transactions } = await transactionsQuery;

    // Get user registration to first transaction times
    const profilesQuery = supabase
      .from('profiles')
      .select('id, created_at');

    const { data: profiles } = await profilesQuery;

    if (!kycData || !transactions || !profiles) {
      throw new Error('Failed to fetch processing time data');
    }

    // Calculate KYC processing time
    const approvedKycs = kycData.filter(kyc => 
      kyc.status === 'approved' && kyc.submitted_at && kyc.approved_at
    );

    const kycProcessingTime = approvedKycs.length > 0 
      ? approvedKycs.reduce((sum, kyc) => {
          const submitted = new Date(kyc.submitted_at!);
          const approved = new Date(kyc.approved_at!);
          return sum + (approved.getTime() - submitted.getTime()) / (1000 * 60 * 60); // hours
        }, 0) / approvedKycs.length
      : 0;

    // Calculate transaction processing time
    const completedTxs = transactions.filter(tx => 
      tx.status === 'completed' && tx.created_at && tx.completed_at
    );

    const transactionProcessingTime = completedTxs.length > 0
      ? completedTxs.reduce((sum, tx) => {
          const created = new Date(tx.created_at);
          const completed = new Date(tx.completed_at!);
          return sum + (completed.getTime() - created.getTime()) / (1000 * 60); // minutes
        }, 0) / completedTxs.length
      : 0;

    // Calculate payment method processing times
    const paymentMethodGroups = new Map<string, number[]>();
    
    completedTxs.forEach(tx => {
      const method = tx.payment_method || 'Unknown';
      if (!paymentMethodGroups.has(method)) {
        paymentMethodGroups.set(method, []);
      }
      
      const created = new Date(tx.created_at);
      const completed = new Date(tx.completed_at!);
      const processingMinutes = (completed.getTime() - created.getTime()) / (1000 * 60);
      
      paymentMethodGroups.get(method)!.push(processingMinutes);
    });

    const paymentMethodTimes = Array.from(paymentMethodGroups.entries()).map(([method, times]) => ({
      method,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      count: times.length
    }));

    // Calculate conversion stage times
    const userFirstTransactions = new Map<string, Date>();
    transactions.forEach(tx => {
      if (tx.status === 'completed') {
        const txDate = new Date(tx.created_at);
        if (!userFirstTransactions.has(tx.user_id) || 
            txDate < userFirstTransactions.get(tx.user_id)!) {
          userFirstTransactions.set(tx.user_id, txDate);
        }
      }
    });

    // Registration to first transaction time
    const registrationToFirstTx = profiles
      .filter(profile => userFirstTransactions.has(profile.id))
      .map(profile => {
        const regDate = new Date(profile.created_at);
        const firstTxDate = userFirstTransactions.get(profile.id)!;
        return (firstTxDate.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24); // days
      });

    const avgRegistrationToFirstTx = registrationToFirstTx.length > 0
      ? registrationToFirstTx.reduce((a, b) => a + b, 0) / registrationToFirstTx.length
      : 0;

    const conversionStageTimes = [
      {
        stage: 'Registration to First Transaction',
        avgDays: avgRegistrationToFirstTx
      },
      {
        stage: 'KYC Submission to Approval',
        avgDays: kycProcessingTime / 24 // Convert hours to days
      },
      {
        stage: 'Transaction Creation to Completion',
        avgDays: transactionProcessingTime / (60 * 24) // Convert minutes to days
      }
    ];

    return {
      kycProcessingTime,
      transactionProcessingTime,
      paymentMethodTimes,
      conversionStageTimes
    };
  } catch (error) {
    console.error('Error calculating processing times:', error);
    throw error;
  }
};
