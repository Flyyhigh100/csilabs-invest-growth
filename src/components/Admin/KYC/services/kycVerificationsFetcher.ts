
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationWithProfile } from '../types';
import { toast } from 'sonner';
import { isUserAdmin } from '@/utils/admin';

// Fetch KYC verifications function with improved error handling and logging
export const fetchKycVerifications = async (): Promise<KycVerificationWithProfile[]> => {
  console.log('Fetching KYC verifications from database with updated RLS policies');
  
  try {
    // Verify admin access first
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User is not an admin. Cannot fetch all KYC verifications');
      throw new Error('Admin access required to fetch all KYC verifications');
    }
    
    // Use a simple, direct query now that RLS policies have been fixed
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (kycError) {
      console.error('Error fetching KYC verifications with updated RLS:', kycError);
      toast.error('Failed to fetch KYC verifications');
      throw kycError;
    }
    
    console.log(`KYC data fetched with updated RLS: ${kycData?.length || 0} records`);
    
    if (!kycData || kycData.length === 0) {
      console.log('No KYC verifications found with updated RLS');
      return [];
    }
    
    console.log('First few KYC records with updated RLS:', kycData?.slice(0, 3));
    
    const statusCounts = kycData.reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    console.log('KYC verifications by status with updated RLS:', statusCounts);
    
    const enhancedKycData: KycVerificationWithProfile[] = await Promise.all(
      (kycData || []).map(async (kyc) => {
        console.log(`Processing KYC record for user_id: ${kyc.user_id} with updated RLS`, kyc);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', kyc.user_id)
          .maybeSingle();
        
        if (profileError) {
          console.error(`Error fetching profile for user ${kyc.user_id}:`, profileError);
        }
        
        return {
          ...kyc,
          profile_first_name: profileData?.first_name || null, 
          profile_last_name: profileData?.last_name || null
        };
      })
    );
    
    console.log('KYC verifications fetched with profiles and updated RLS:', enhancedKycData.length);
    if (enhancedKycData.length > 0) {
      console.log('Sample enhanced KYC data with updated RLS:', enhancedKycData.slice(0, 3));
    }
    
    return enhancedKycData;
  } catch (error) {
    console.error('Exception in fetchKycVerifications with updated RLS:', error);
    toast.error('Error fetching KYC verifications. Please check console for details.');
    throw error;
  }
};

// Function for testing direct database access without joins
export const testDirectKycAccess = async (): Promise<{count: number, pendingCount: number, statusCounts: Record<string, number>, records: any[]}> => {
  try {
    console.log('Testing direct KYC database access with updated RLS...');
    
    // Verify admin access first
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User is not an admin. Cannot perform direct KYC database access test');
      throw new Error('Admin access required for direct database test');
    }
    
    // Get all KYC records with a more direct approach 
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Direct KYC access test error with updated RLS:', error);
      toast.error('Failed to directly access KYC records');
      throw error;
    }
    
    const pendingCount = data?.filter(item => item.status === 'pending').length || 0;
    
    const statusCounts = (data || []).reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    console.log(`Direct KYC access test results with updated RLS: ${data?.length || 0} total records, ${pendingCount} pending`);
    console.log('Status counts with updated RLS:', statusCounts);
    console.log('All KYC records (raw) with updated RLS:', data);
    
    return {
      count: data?.length || 0,
      pendingCount,
      statusCounts,
      records: data || []
    };
  } catch (error) {
    console.error('Exception in testDirectKycAccess with updated RLS:', error);
    throw error;
  }
};

// CRITICAL FIX: Add function to check admin permissions with more robust logic
export const verifyAdminAccess = async (): Promise<boolean> => {
  return isUserAdmin();
};
