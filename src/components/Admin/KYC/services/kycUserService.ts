
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isUserAdmin } from '@/utils/admin';

interface UserWithKycStatus {
  id: string;
  first_name: string | null;
  last_name: string | null;
  kyc_status: string | null;
  has_kyc: boolean;
}

// Check if a specific user has a KYC record
export const checkUserKycRecord = async (userId: string): Promise<any> => {
  try {
    console.log(`Checking KYC record for user: ${userId}`);
    
    // Verify admin permissions first
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User does not have admin permissions');
      toast.error('Admin permissions required to check user KYC');
      return null;
    }
    
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking KYC for user ${userId}:`, error);
      toast.error('Failed to check user KYC status');
      return null;
    }
    
    if (!data) {
      console.log(`No KYC record found for user ${userId}`);
      return null;
    }
    
    console.log(`Found KYC record for user ${userId}:`, data);
    return data;
  } catch (error) {
    console.error('Exception in checkUserKycRecord:', error);
    return null;
  }
};

// List all users with their KYC status for debugging
export const listAllUsersWithKycStatus = async (): Promise<UserWithKycStatus[]> => {
  try {
    console.log('Listing all users with KYC status');
    
    // Verify admin permissions first
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User does not have admin permissions');
      toast.error('Admin permissions required to list all users');
      return [];
    }
    
    // First get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      toast.error('Failed to fetch user profiles');
      return [];
    }
    
    // Then get all KYC verifications for mapping
    const { data: kycVerifications, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('user_id, status');
    
    if (kycError) {
      console.error('Error fetching KYC verifications:', kycError);
      toast.error('Failed to fetch KYC verifications');
      return [];
    }
    
    console.log(`Found ${profiles.length} profiles and ${kycVerifications.length} KYC verifications`);
    
    // Create a map of user ID to KYC status for faster lookups
    const kycStatusMap = kycVerifications.reduce((acc, kyc) => {
      acc[kyc.user_id] = kyc.status;
      return acc;
    }, {} as Record<string, string>);
    
    // Map profiles to include KYC status
    const usersWithKyc: UserWithKycStatus[] = profiles.map(profile => ({
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      kyc_status: kycStatusMap[profile.id] || null,
      has_kyc: !!kycStatusMap[profile.id]
    }));
    
    console.log('Users with KYC status:', usersWithKyc);
    return usersWithKyc;
  } catch (error) {
    console.error('Exception in listAllUsersWithKycStatus:', error);
    return [];
  }
};
