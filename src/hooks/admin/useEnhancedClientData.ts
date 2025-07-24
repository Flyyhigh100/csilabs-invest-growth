import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTestDataToggle } from './useTestDataToggle';

export interface EnhancedClientData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone_number: string | null;
  street_address: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  wallet_address: string | null;
  solana_wallet_address: string | null;
  created_at: string;
  updated_at: string;
  
  // KYC Information
  kyc_status: string | null;
  kyc_submitted_at: string | null;
  kyc_approved_at: string | null;
  has_kyc_record: boolean;
  
  // Transaction Summary
  total_transactions: number;
  total_invested: number;
  completed_transactions: number;
  completed_value: number;
  pending_transactions: number;
  pending_value: number;
  failed_transactions: number;
  failed_value: number;
  cancelled_transactions: number;
  cancelled_value: number;
  last_transaction_date: string | null;
  
  // Token Information - THE KEY MISSING PIECE
  total_tokens_sent: number;
  total_tokens_purchased: number;
  average_token_price: number;
  tokens_pending_delivery: number;
  
  // Test Data
  test_transactions: number;
  test_value: number;
  has_test_data: boolean;
  
  // Account Status
  status: string | null;
  role: string | null;
}

export const useEnhancedClientData = () => {
  const { includeTestData } = useTestDataToggle();

  return useQuery({
    queryKey: ['enhanced-client-data', includeTestData],
    queryFn: async (): Promise<EnhancedClientData[]> => {
      console.log('Fetching enhanced client data with comprehensive token calculations');
      
      try {
        // First, get all profiles with basic user info
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            email,
            phone_number,
            street_address,
            city,
            state_province,
            postal_code,
            wallet_address,
            solana_wallet_address,
            created_at,
            updated_at,
            status,
            role
          `);

        if (profilesError) throw profilesError;

        // Get KYC data for all users
        const { data: kycData, error: kycError } = await supabase
          .from('kyc_verifications')
          .select(`
            user_id,
            status,
            submitted_at,
            approved_at
          `);

        if (kycError) throw kycError;

        // Get comprehensive transaction data
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select(`
            user_id,
            amount,
            status,
            token_amount,
            token_price,
            token_sent,
            created_at,
            is_test,
            completed_at
          `);

        if (transactionsError) throw transactionsError;

        // Process the data to create enhanced client records
        const enhancedClients: EnhancedClientData[] = profiles.map(profile => {
          // Get KYC info for this user
          const userKyc = kycData.find(kyc => kyc.user_id === profile.id);
          
          // Filter transactions for this user
          const userTransactions = transactions.filter(tx => tx.user_id === profile.id);
          const realTransactions = userTransactions.filter(tx => !tx.is_test);
          const testTransactions = userTransactions.filter(tx => tx.is_test);
          
          // Calculate transaction summaries
          const completedReal = realTransactions.filter(tx => tx.status === 'completed');
          const pendingReal = realTransactions.filter(tx => tx.status === 'pending' || tx.status === 'processing');
          const failedReal = realTransactions.filter(tx => tx.status === 'failed' || tx.status === 'error');
          const cancelledReal = realTransactions.filter(tx => tx.status === 'cancelled' || tx.status === 'expired');
          
          // Calculate token totals - THIS IS THE KEY CALCULATION THE CEO NEEDS
          const totalTokensSent = completedReal
            .filter(tx => tx.token_sent === true && tx.token_amount)
            .reduce((sum, tx) => sum + (Number(tx.token_amount) || 0), 0);
            
          const totalTokensPurchased = completedReal
            .filter(tx => tx.token_amount)
            .reduce((sum, tx) => sum + (Number(tx.token_amount) || 0), 0);
            
          const tokensPendingDelivery = completedReal
            .filter(tx => tx.token_sent !== true && tx.token_amount)
            .reduce((sum, tx) => sum + (Number(tx.token_amount) || 0), 0);
          
          // Calculate average token price
          const tokensWithPrice = completedReal.filter(tx => tx.token_price && tx.token_amount);
          const averageTokenPrice = tokensWithPrice.length > 0
            ? tokensWithPrice.reduce((sum, tx) => sum + (Number(tx.token_price) || 0), 0) / tokensWithPrice.length
            : 0;
          
          // Find last transaction date
          const lastTransaction = realTransactions
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

          return {
            ...profile,
            
            // KYC Information
            kyc_status: userKyc?.status || null,
            kyc_submitted_at: userKyc?.submitted_at || null,
            kyc_approved_at: userKyc?.approved_at || null,
            has_kyc_record: !!userKyc,
            
            // Transaction Summary
            total_transactions: realTransactions.length,
            total_invested: realTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
            completed_transactions: completedReal.length,
            completed_value: completedReal.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
            pending_transactions: pendingReal.length,
            pending_value: pendingReal.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
            failed_transactions: failedReal.length,
            failed_value: failedReal.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
            cancelled_transactions: cancelledReal.length,
            cancelled_value: cancelledReal.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
            last_transaction_date: lastTransaction?.created_at || null,
            
            // Token Information - THE CRITICAL DATA FOR CEO
            total_tokens_sent: totalTokensSent,
            total_tokens_purchased: totalTokensPurchased,
            average_token_price: averageTokenPrice,
            tokens_pending_delivery: tokensPendingDelivery,
            
            // Test Data
            test_transactions: testTransactions.length,
            test_value: testTransactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0),
            has_test_data: testTransactions.length > 0
          };
        });

        console.log(`Enhanced client data processed for ${enhancedClients.length} clients`);
        console.log('Sample token data:', enhancedClients.slice(0, 3).map(client => ({
          name: `${client.first_name} ${client.last_name}`,
          total_tokens_sent: client.total_tokens_sent,
          total_invested: client.total_invested,
          tokens_pending: client.tokens_pending_delivery
        })));

        return enhancedClients;
        
      } catch (error) {
        console.error('Error fetching enhanced client data:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};