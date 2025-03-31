
import { supabase } from '@/integrations/supabase/client';
import { isUserAdmin } from '@/utils/admin';

// Function to check for kyc records with a specific user id
export const checkUserKycRecord = async (userId: string): Promise<any> => {
  try {
    console.log(`Checking if KYC record exists for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking KYC record for user ${userId}:`, error);
      return null;
    }
    
    console.log(`KYC record check result for user ${userId}:`, data);
    return data;
  } catch (error) {
    console.error(`Exception checking KYC for user ${userId}:`, error);
    return null;
  }
};

// Function to list all users and their KYC status - useful for debugging
export const listAllUsersWithKycStatus = async (): Promise<any[]> => {
  try {
    console.log('Listing all users with KYC status with updated RLS...');
    
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User is not an admin. Cannot list all users with KYC status');
      throw new Error('Admin access required to list all users with KYC status');
    }
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('Error fetching profiles with updated RLS:', profilesError);
      throw profilesError;
    }
    
    console.log(`Found ${profiles?.length || 0} user profiles with updated RLS`);
    
    const { data: kycRecords, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*');
    
    if (kycError) {
      console.error('Error fetching KYC records with updated RLS:', kycError);
      throw kycError;
    }
    
    console.log(`Found ${kycRecords?.length || 0} KYC records with updated RLS`);
    
    const kycStatusMap = new Map();
    (kycRecords || []).forEach(kyc => {
      kycStatusMap.set(kyc.user_id, kyc);
    });
    
    const usersWithKyc = (profiles || []).map(profile => {
      const kycRecord = kycStatusMap.get(profile.id);
      return {
        ...profile,
        kyc_record: kycRecord,
        has_kyc: !!kycRecord,
        kyc_status: kycRecord ? kycRecord.status : 'not_started'
      };
    });
    
    console.log('Users with KYC status compiled with updated RLS:', usersWithKyc.length);
    console.log('Sample with updated RLS:', usersWithKyc.slice(0, 3));
    
    return usersWithKyc;
  } catch (error) {
    console.error('Error in listAllUsersWithKycStatus with updated RLS:', error);
    return [];
  }
};
