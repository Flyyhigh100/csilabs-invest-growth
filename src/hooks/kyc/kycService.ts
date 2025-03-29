
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationData, KycFormData } from './types';

// Fetch KYC verification data for a user
export const fetchKycVerification = async (userId: string): Promise<KycVerificationData | null> => {
  if (!userId) return null;
  
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
  
  return data;
};

// Save KYC personal information
export const saveKycPersonalInfo = async (
  userId: string, 
  formData: KycFormData
): Promise<boolean> => {
  if (!userId) throw new Error('User ID is required');
  
  const { error } = await supabase
    .from('kyc_verifications')
    .update({
      ...formData,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (error) throw error;
  return true;
};

// Upload document (ID front, ID back, selfie)
export const uploadKycDocument = async (
  userId: string,
  file: File, 
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  if (!userId) throw new Error('User ID is required');
  
  // Upload file to storage
  const filePath = `${userId}/${type}_${Date.now()}.${file.name.split('.').pop()}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('kyc_documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('kyc_documents')
    .getPublicUrl(filePath);
  
  // Update KYC record with file URL
  const updateData: Record<string, string> = {};
  updateData[`${type}_url`] = urlData.publicUrl;
  
  const { error: updateError } = await supabase
    .from('kyc_verifications')
    .update(updateData)
    .eq('user_id', userId);
  
  if (updateError) throw updateError;
  
  return urlData.publicUrl;
};

// Submit KYC verification
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  if (!userId) throw new Error('User ID is required');
  
  const currentTimestamp = new Date().toISOString();
  
  // Clear any previous rejection reason if resubmitting
  const updateData = {
    status: 'pending' as const,
    submitted_at: currentTimestamp,
    updated_at: currentTimestamp,
    rejection_reason: null
  };
  
  const { error } = await supabase
    .from('kyc_verifications')
    .update(updateData)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error submitting KYC verification:', error);
    throw error;
  }
  
  return true;
};
