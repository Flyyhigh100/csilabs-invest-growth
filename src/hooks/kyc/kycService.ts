
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationData, KycFormData } from './types';

// Fetch KYC verification data for a user
export const fetchKycVerification = async (userId: string): Promise<KycVerificationData | null> => {
  if (!userId) return null;
  
  console.log(`Fetching KYC data for user: ${userId}`);
  
  // Check if there's an existing verification record
  const { data, error } = await supabase
    .from('kyc_verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching KYC data:', error);
    throw error;
  }
  
  // If no record exists, create one with not_started status
  if (!data) {
    console.log('No KYC record found, creating new one for user:', userId);
    const { data: newData, error: insertError } = await supabase
      .from('kyc_verifications')
      .insert({ user_id: userId, status: 'not_started' })
      .select('*')
      .single();
    
    if (insertError) {
      console.error('Error creating KYC record:', insertError);
      throw insertError;
    }
    
    return newData;
  }
  
  console.log(`Retrieved KYC data for user ${userId}:`, data);
  return data;
};

// Save KYC personal information
export const saveKycPersonalInfo = async (
  userId: string, 
  formData: KycFormData
): Promise<boolean> => {
  if (!userId) throw new Error('User ID is required');
  
  console.log(`Saving personal info for user ${userId}:`, formData);
  
  const { error } = await supabase
    .from('kyc_verifications')
    .update({
      ...formData,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error saving personal info:', error);
    throw error;
  }
  
  console.log(`Successfully saved personal info for user ${userId}`);
  return true;
};

// Upload document (ID front, ID back, selfie)
export const uploadKycDocument = async (
  userId: string,
  file: File, 
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  if (!userId) throw new Error('User ID is required');
  
  console.log(`Uploading ${type} document for user ${userId}...`);
  
  // Upload file to storage
  const filePath = `${userId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('kyc_documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) {
    console.error('Storage upload error:', uploadError);
    throw uploadError;
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('kyc_documents')
    .getPublicUrl(filePath);
  
  // Update KYC record with file URL
  const updateData: Record<string, string> = {};
  updateData[`${type}_url`] = urlData.publicUrl;
  
  console.log(`Updating KYC record with ${type} URL: ${urlData.publicUrl}`);
  
  const { error: updateError } = await supabase
    .from('kyc_verifications')
    .update(updateData)
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Database update error:', updateError);
    throw updateError;
  }
  
  console.log(`Successfully uploaded ${type} document for user ${userId}`);
  return urlData.publicUrl;
};

// Submit KYC verification
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  if (!userId) throw new Error('User ID is required');
  
  console.log(`Submitting KYC verification for user ${userId}...`);
  
  const currentTimestamp = new Date().toISOString();
  
  // Clear any previous rejection reason if resubmitting
  const updateData = {
    status: 'pending' as const,
    submitted_at: currentTimestamp,
    updated_at: currentTimestamp,
    rejection_reason: null,
    clarification_message: null
  };
  
  try {
    // First get current KYC data to confirm it exists and has all required documents
    const { data: kycData, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching KYC data before submission:', fetchError);
      throw fetchError;
    }
    
    if (!kycData.id_front_url || !kycData.id_back_url || !kycData.selfie_url) {
      const error = new Error('All documents must be uploaded before submission');
      console.error(error.message, {
        id_front_url: kycData.id_front_url,
        id_back_url: kycData.id_back_url,
        selfie_url: kycData.selfie_url
      });
      throw error;
    }
    
    console.log('Pre-submission checks passed, updating status to pending...');
    
    // Perform the update operation
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('Error submitting KYC verification:', error);
      throw error;
    }
    
    console.log('KYC verification submitted successfully:', data);
    
    // Force a query to verify the data was actually saved
    const { data: verifyData, error: verifyError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying KYC submission:', verifyError);
    } else {
      console.log('Verified KYC status after submission:', verifyData);
    }
    
    // Verify it shows up in the pending list
    const { data: pendingData, error: pendingError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('status', 'pending');
    
    if (pendingError) {
      console.error('Error checking pending verifications:', pendingError);
    } else {
      console.log(`Found ${pendingData.length} pending verifications after submission`);
      console.log('Pending verifications:', pendingData);
    }
    
    return true;
  } catch (err) {
    console.error('Exception during KYC verification submission:', err);
    throw err;
  }
};

// Add a special test function to manually insert a test KYC verification
export const insertTestKycVerification = async (userId: string): Promise<boolean> => {
  if (!userId) throw new Error('User ID is required');
  
  console.log(`Inserting test KYC verification for user ${userId}...`);
  
  const currentTimestamp = new Date().toISOString();
  
  const testData = {
    user_id: userId,
    status: 'pending' as const,
    first_name: 'Test',
    last_name: 'User',
    submitted_at: currentTimestamp,
    updated_at: currentTimestamp,
    id_front_url: 'https://example.com/test_id_front.jpg',
    id_back_url: 'https://example.com/test_id_back.jpg',
    selfie_url: 'https://example.com/test_selfie.jpg',
  };
  
  try {
    // Check if a record already exists
    const { data: existingData, error: checkError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing KYC record:', checkError);
      throw checkError;
    }
    
    let result;
    
    if (existingData) {
      // Update existing record
      console.log('Updating existing KYC record to pending status');
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .update({
          ...testData,
          id: existingData.id // Preserve the original ID
        })
        .eq('user_id', userId)
        .select();
      
      if (error) {
        console.error('Error updating test KYC record:', error);
        throw error;
      }
      
      result = data;
    } else {
      // Insert new record
      console.log('Inserting new test KYC record');
      
      const { data, error } = await supabase
        .from('kyc_verifications')
        .insert(testData)
        .select();
      
      if (error) {
        console.error('Error inserting test KYC record:', error);
        throw error;
      }
      
      result = data;
    }
    
    console.log('Test KYC verification inserted/updated successfully:', result);
    return true;
  } catch (err) {
    console.error('Exception during test KYC insertion:', err);
    throw err;
  }
};
