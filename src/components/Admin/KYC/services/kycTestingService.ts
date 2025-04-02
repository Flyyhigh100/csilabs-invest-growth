
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isUserAdmin } from '@/utils/admin';

// Create a test KYC record for debugging
export const createTestKycRecord = async (userId?: string): Promise<boolean> => {
  try {
    console.log('Creating test KYC record');
    
    // Verify admin access first
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      console.error('User does not have admin permissions');
      toast.error('Admin permissions required to create test KYC records');
      return false;
    }
    
    // If no userId provided, use the current user
    let targetUserId = userId;
    
    if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found and no userId provided');
        toast.error('User ID required to create test KYC record');
        return false;
      }
      targetUserId = user.id;
    }
    
    // Generate test name and details
    const testFirstName = `Test_${Math.floor(Math.random() * 1000)}`;
    const testLastName = `User_${Math.floor(Math.random() * 1000)}`;
    const now = new Date().toISOString();
    
    // Check if user already has a KYC record
    const { data: existingKyc, error: checkError } = await supabase
      .from('kyc_verifications')
      .select('id, status')
      .eq('user_id', targetUserId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing KYC:', checkError);
      toast.error('Failed to check existing KYC record');
      return false;
    }
    
    if (existingKyc) {
      console.log(`User ${targetUserId} already has a KYC record with status: ${existingKyc.status}`);
      
      // Update the existing KYC record to pending status for testing
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending',
          first_name: testFirstName,
          last_name: testLastName,
          submitted_at: now,
          updated_at: now
        })
        .eq('id', existingKyc.id);
      
      if (updateError) {
        console.error('Error updating test KYC record:', updateError);
        toast.error('Failed to update test KYC record');
        return false;
      }
      
      console.log(`Updated existing KYC record to pending status for user ${targetUserId}`);
      toast.success('Updated existing KYC record to pending status');
      return true;
    }
    
    // Create a new KYC record
    const { data, error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: targetUserId,
        status: 'pending',
        first_name: testFirstName,
        last_name: testLastName,
        date_of_birth: '1990-01-01',
        nationality: 'US',
        address: '123 Test St',
        city: 'Test City',
        postal_code: '12345',
        country: 'US',
        submitted_at: now,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating test KYC record:', error);
      toast.error('Failed to create test KYC record');
      return false;
    }
    
    console.log(`Created test KYC record for user ${targetUserId}:`, data);
    toast.success('Created test KYC record with pending status');
    return true;
  } catch (error) {
    console.error('Exception in createTestKycRecord:', error);
    toast.error('Error creating test KYC record');
    return false;
  }
};
