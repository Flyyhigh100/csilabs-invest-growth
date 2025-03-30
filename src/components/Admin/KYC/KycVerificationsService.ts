import { supabase } from '@/integrations/supabase/client';
import { KycVerificationWithProfile } from './types';
import { toast } from 'sonner';

// Fetch KYC verifications function
export const fetchKycVerifications = async (): Promise<KycVerificationWithProfile[]> => {
  console.log('Fetching KYC verifications from database');
  
  try {
    // First, get all KYC verifications with direct query
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*');
    
    if (kycError) {
      console.error('Error fetching KYC verifications:', kycError);
      toast.error('Failed to fetch KYC verifications');
      throw kycError;
    }
    
    console.log(`Raw KYC data fetched: ${kycData?.length || 0} records`);
    console.log('Sample KYC data:', kycData?.slice(0, 2));
    
    if (!kycData || kycData.length === 0) {
      console.log('No KYC verifications found in database');
      return [];
    }
    
    // Log counts by status for debugging
    const statusCounts = kycData.reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    console.log('KYC verifications by status:', statusCounts);
    
    // Then, for each KYC verification, fetch the associated profile data
    const enhancedKycData: KycVerificationWithProfile[] = await Promise.all(
      (kycData || []).map(async (kyc) => {
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
    
    console.log('KYC verifications fetched with profiles:', enhancedKycData.length);
    console.log('Sample enhanced KYC data:', enhancedKycData.slice(0, 2));
    
    return enhancedKycData;
  } catch (error) {
    console.error('Exception in fetchKycVerifications:', error);
    throw error;
  }
};

// Function for testing direct database access without joins
export const testDirectKycAccess = async (): Promise<{count: number, pendingCount: number, statusCounts: Record<string, number>}> => {
  try {
    console.log('Testing direct KYC database access...');
    
    // Get all KYC records
    const { data, error, count } = await supabase
      .from('kyc_verifications')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('Direct KYC access test error:', error);
      throw error;
    }
    
    const pendingCount = data?.filter(item => item.status === 'pending').length || 0;
    
    // Get counts by status
    const statusCounts = (data || []).reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    console.log(`Direct KYC access test results: ${count} total records, ${pendingCount} pending`);
    console.log('Status counts:', statusCounts);
    console.log('All KYC records:', data);
    
    return {
      count: count || 0,
      pendingCount,
      statusCounts
    };
  } catch (error) {
    console.error('Exception in testDirectKycAccess:', error);
    throw error;
  }
};

// Add a function to create a test KYC record for debugging
export const createTestKycRecord = async (): Promise<boolean> => {
  try {
    // Get a random user ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (profileError || !profileData || profileData.length === 0) {
      console.error('Error finding a user profile:', profileError);
      return false;
    }
    
    const userId = profileData[0].id;
    
    // Check if this user already has a KYC record
    const { data: existingKyc, error: existingError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingError) {
      console.error('Error checking existing KYC:', existingError);
      return false;
    }
    
    const now = new Date().toISOString();
    
    if (existingKyc) {
      // Update existing record to pending
      const { data, error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending',
          first_name: 'Test',
          last_name: 'User',
          submitted_at: now,
          updated_at: now
        })
        .eq('id', existingKyc.id);
        
      if (error) {
        console.error('Error updating test KYC record:', error);
        return false;
      }
      
      console.log('Updated test KYC record to pending status');
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: userId,
          status: 'pending',
          first_name: 'Test',
          last_name: 'User',
          submitted_at: now,
          updated_at: now
        });
        
      if (error) {
        console.error('Error creating test KYC record:', error);
        return false;
      }
      
      console.log('Created new test KYC record');
    }
    
    return true;
  } catch (error) {
    console.error('Exception in createTestKycRecord:', error);
    return false;
  }
};
