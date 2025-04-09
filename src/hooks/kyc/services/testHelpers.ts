
import { supabase } from '@/integrations/supabase/client';

// This is for tests only - create a test verification record
export const insertTestKycVerification = async (userId: string): Promise<boolean> => {
  try {
    console.log('Creating test KYC verification for user:', userId);
    
    if (!userId) {
      console.error('Error: No user ID provided to insertTestKycVerification');
      return false;
    }
    
    const now = new Date().toISOString();
    
    // Check if user already has a record
    const { data: existing, error: checkError } = await supabase
      .from('kyc_verifications')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing KYC record:', checkError);
      throw checkError;
    }
    
    if (existing) {
      console.log('Existing KYC record found, updating to pending status...');
      // Update the existing record
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending',
          first_name: 'Test',
          last_name: 'User',
          date_of_birth: '1990-01-01',
          nationality: 'US',
          address: '123 Test St',
          city: 'Test City',
          postal_code: '12345',
          country: 'US',
          submitted_at: now
        })
        .eq('id', existing.id);
        
      if (error) {
        console.error('Error updating test KYC verification:', error);
        throw error;
      }
      
      console.log('Updated test KYC verification:', existing.id);
    } else {
      console.log('No existing KYC record, creating new one...');
      // Insert new record
      const { error } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: userId,
          status: 'pending',
          first_name: 'Test',
          last_name: 'User',
          date_of_birth: '1990-01-01',
          nationality: 'US',
          address: '123 Test St',
          city: 'Test City',
          postal_code: '12345',
          country: 'US',
          submitted_at: now
        });
        
      if (error) {
        console.error('Error creating test KYC verification:', error);
        throw error;
      }
      
      console.log('Created new test KYC verification for user:', userId);
    }
    
    // Double-check the record was created/updated successfully
    const { data: verifyRecord, error: verifyError } = await supabase
      .from('kyc_verifications')
      .select('status')
      .eq('user_id', userId)
      .single();
      
    if (verifyError) {
      console.error('Error verifying KYC record creation:', verifyError);
      return false;
    }
    
    console.log('Verified KYC status after update:', verifyRecord?.status);
    return verifyRecord?.status === 'pending';
  } catch (error) {
    console.error('Error in insertTestKycVerification:', error);
    return false;
  }
};

// Export the insertTestKycVerification function for VerificationStatusTab
export { insertTestKycVerification as createTestKycRecord };
