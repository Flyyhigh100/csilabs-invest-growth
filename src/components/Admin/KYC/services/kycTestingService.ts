
import { supabase } from '@/integrations/supabase/client';

// Add a function to create a test KYC record for debugging
export const createTestKycRecord = async (): Promise<boolean> => {
  try {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (profileError || !profileData || profileData.length === 0) {
      console.error('Error finding a user profile:', profileError);
      return false;
    }
    
    const userId = profileData[0].id;
    
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
