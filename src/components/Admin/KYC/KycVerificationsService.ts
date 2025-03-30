
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationWithProfile } from './types';
import { toast } from 'sonner';

// Fetch KYC verifications function with improved error handling and logging
export const fetchKycVerifications = async (): Promise<KycVerificationWithProfile[]> => {
  console.log('Fetching KYC verifications from database with updated RLS policies');
  
  try {
    // Verify admin access first
    const isAdmin = await verifyAdminAccess();
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
    if (kycData?.length === 0) {
      console.warn('WARNING: No KYC verifications found with updated RLS!');
      
      // Double-check database access
      const { count, error: countError } = await supabase
        .from('kyc_verifications')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error checking kyc_verifications count:', countError);
      } else {
        console.log('KYC table count check with updated RLS:', count);
      }
    } else {
      console.log('First few KYC records with updated RLS:', kycData?.slice(0, 3));
      
      // Log counts by status 
      const statusCounts = kycData.reduce((counts, item) => {
        counts[item.status] = (counts[item.status] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);
      
      console.log('KYC verifications by status with updated RLS:', statusCounts);
    }
    
    if (!kycData || kycData.length === 0) {
      console.log('No KYC verifications found with updated RLS');
      return [];
    }
    
    // Enhanced logging for user_ids to verify we're getting the right data
    console.log('User IDs in KYC records with updated RLS:', kycData.map(kyc => kyc.user_id));
    
    // Fetch profile data for each KYC verification
    const enhancedKycData: KycVerificationWithProfile[] = await Promise.all(
      (kycData || []).map(async (kyc) => {
        // Log each KYC record we're processing
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
    const isAdmin = await verifyAdminAccess();
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
    
    // Get counts by status
    const statusCounts = (data || []).reduce((counts, item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    console.log(`Direct KYC access test results with updated RLS: ${data?.length || 0} total records, ${pendingCount} pending`);
    console.log('Status counts with updated RLS:', statusCounts);
    console.log('All KYC records (raw) with updated RLS:', data);
    
    // Return the actual records for better debugging
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

// Function to list all users and their KYC status - useful for debugging
export const listAllUsersWithKycStatus = async (): Promise<any[]> => {
  try {
    console.log('Listing all users with KYC status with updated RLS...');
    
    // Verify admin access first
    const isAdmin = await verifyAdminAccess();
    if (!isAdmin) {
      console.error('User is not an admin. Cannot list all users with KYC status');
      throw new Error('Admin access required to list all users with KYC status');
    }
    
    // First get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('Error fetching profiles with updated RLS:', profilesError);
      throw profilesError;
    }
    
    console.log(`Found ${profiles?.length || 0} user profiles with updated RLS`);
    
    // Get all KYC records
    const { data: kycRecords, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*');
    
    if (kycError) {
      console.error('Error fetching KYC records with updated RLS:', kycError);
      throw kycError;
    }
    
    console.log(`Found ${kycRecords?.length || 0} KYC records with updated RLS`);
    
    // Create a map of user_id to KYC status
    const kycStatusMap = new Map();
    (kycRecords || []).forEach(kyc => {
      kycStatusMap.set(kyc.user_id, kyc);
    });
    
    // Combine profile and KYC data
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

// CRITICAL FIX: Add function to check admin permissions
export const verifyAdminAccess = async (): Promise<boolean> => {
  try {
    console.log('Verifying admin access with updated RLS policies...');
    
    // Check if the current user is in the admins table
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      console.error('No authenticated user found');
      return false;
    }
    
    const userId = session.session.user.id;
    
    // Check if user is in admins table
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (adminError) {
      console.error('Error checking admin status with updated RLS:', adminError);
      return false;
    }
    
    const isAdmin = !!adminData;
    console.log(`User ${userId} admin status with updated RLS: ${isAdmin}`);
    
    // Test KYC record access if admin
    if (isAdmin) {
      const { count, error: countError } = await supabase
        .from('kyc_verifications')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Admin cannot access KYC records with updated RLS:', countError);
        return false;
      }
      
      console.log(`Admin can access ${count} KYC records with updated RLS`);
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Error verifying admin access with updated RLS:', error);
    return false;
  }
};
