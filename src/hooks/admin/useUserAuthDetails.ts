
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserAuthDetails {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  emailConfirmedAt?: string | null;
  confirmationSentAt?: string | null;
  authMethod: string;
  signupMethod: string;
  hasPassword: boolean;
  loginStatus: string;
  lastSignInAt?: string | null;
  daysSinceLogin?: number | null;
  createdAt: string;
  accountAge: number;
  confirmedAt?: string | null;
  phoneConfirmedAt?: string | null;
  isAnonymous: boolean;
  providers: string[];
  walletAddress?: string | null;
  preferredNetwork?: string | null;
  kycStatus: string;
  kycSubmittedAt?: string | null;
  recentTransactions: any[];
  totalTransactions: number;
}

export const useUserAuthDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authDetails, setAuthDetails] = useState<UserAuthDetails | null>(null);

  const fetchUserAuthDetails = async (userId: string) => {
    setIsLoading(true);
    setAuthDetails(null);
    
    try {
      console.log(`🔍 Fetching auth details for user: ${userId}`);
      
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'getUserAuthDetails',
          data: { userId }
        }
      });
      
      console.log('📡 Function response received:', { data, error });
      
      if (error) {
        console.error('❌ Error calling getUserAuthDetails function:', error);
        toast.error('Failed to fetch authentication details - Function error');
        return;
      }
      
      if (data?.error) {
        console.error('❌ Error in function response:', data.error);
        toast.error(data.error.message || 'Failed to fetch authentication details');
        return;
      }
      
      if (!data?.authDetails) {
        console.error('❌ No auth details in response');
        toast.error('No authentication details received');
        return;
      }
      
      console.log('✅ Successfully fetched auth details:', data.authDetails);
      setAuthDetails(data.authDetails);
      
    } catch (err) {
      console.error('💥 Error fetching user auth details:', err);
      toast.error('Failed to fetch authentication details - Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    authDetails,
    isLoading,
    fetchUserAuthDetails
  };
};
