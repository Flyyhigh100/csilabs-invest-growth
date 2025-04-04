
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

// Enhanced function to list all users and their KYC status
export const listAllUsersWithKycStatus = async (): Promise<any[]> => {
  try {
    console.log('Listing all users with KYC status...');
    
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User is not an admin. Cannot list all users with KYC status');
      throw new Error('Admin access required to list all users with KYC status');
    }
    
    // First get all profiles (users)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    console.log(`Found ${profiles?.length || 0} user profiles`);
    
    // Then get all KYC records
    const { data: kycRecords, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*');
    
    if (kycError) {
      console.error('Error fetching KYC records:', kycError);
      throw kycError;
    }
    
    console.log(`Found ${kycRecords?.length || 0} KYC records`);
    
    // Create a map of user_id to KYC record for easy lookup
    const kycStatusMap = new Map();
    (kycRecords || []).forEach(kyc => {
      kycStatusMap.set(kyc.user_id, kyc);
    });
    
    // Combine the data to include all users, whether they have submitted KYC or not
    const usersWithKyc = (profiles || []).map(profile => {
      const kycRecord = kycStatusMap.get(profile.id);
      return {
        ...profile,
        kyc_record: kycRecord || null,
        has_kyc: !!kycRecord,
        kyc_status: kycRecord ? kycRecord.status : 'not_started',
        kyc_id: kycRecord ? kycRecord.id : null,
        submitted_at: kycRecord ? kycRecord.submitted_at : null,
        reviewed_at: kycRecord ? kycRecord.reviewed_at : null
      };
    });
    
    console.log('Users with KYC status compiled:', usersWithKyc.length);
    
    return usersWithKyc;
  } catch (error) {
    console.error('Error in listAllUsersWithKycStatus:', error);
    return [];
  }
};
