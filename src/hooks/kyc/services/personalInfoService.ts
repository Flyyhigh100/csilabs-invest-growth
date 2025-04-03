
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationData, KycFormData, KycStatus } from '../types';

// Fetch a user's KYC verification data
export const fetchKycVerification = async (userId: string): Promise<KycVerificationData | null> => {
  console.log('Fetching KYC verification for user:', userId);
  
  try {
    // First check if a KYC record exists
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching KYC verification:', error);
      throw error;
    }
    
    console.log('KYC verification data:', data);
    
    // If no KYC record exists, create one
    if (!data) {
      console.log('No KYC record found, creating one...');
      
      const newKycData = {
        user_id: userId,
        status: 'not_started', // Use the string literal directly
        first_name: null,
        last_name: null,
        date_of_birth: null,
        nationality: null,
        address: null,
        city: null,
        postal_code: null,
        country: null,
        id_front_url: null,
        id_back_url: null,
        selfie_url: null
      };
      
      const { data: newData, error: insertError } = await supabase
        .from('kyc_verifications')
        .insert(newKycData)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating KYC verification record:', insertError);
        throw insertError;
      }
      
      console.log('Created new KYC verification record:', newData);
      return newData;
    }
    
    return data;
  } catch (error) {
    console.error('Exception in fetchKycVerification:', error);
    throw error;
  }
};

// Save personal information for KYC
export const saveKycPersonalInfo = async (userId: string, formData: KycFormData): Promise<KycVerificationData> => {
  console.log('Saving KYC personal info for user:', userId, formData);
  
  try {
    // Check first if a KYC record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking for existing KYC record:', checkError);
      throw checkError;
    }
    
    if (!existingRecord) {
      console.log('No KYC record exists, creating a new one');
      
      // Create a new record
      const { data: newData, error: insertError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: userId,
          status: 'not_started', // Use the string literal directly
          first_name: formData.first_name,
          last_name: formData.last_name,
          date_of_birth: formData.date_of_birth,
          nationality: formData.nationality,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating KYC record:', insertError);
        throw insertError;
      }
      
      console.log('Created new KYC record with personal info:', newData);
      return newData;
    }
    
    // Update the existing record
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update({
        first_name: formData.first_name,
        last_name: formData.last_name,
        date_of_birth: formData.date_of_birth,
        nationality: formData.nationality,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating KYC personal info:', error);
      throw error;
    }
    
    console.log('Updated KYC personal info:', data);
    return data;
  } catch (error) {
    console.error('Exception in saveKycPersonalInfo:', error);
    throw error;
  }
};

// This function is used to check if a user has a KYC record, and create one if not
export const ensureKycRecordExists = async (userId: string): Promise<boolean> => {
  console.log('Ensuring KYC record exists for user:', userId);
  
  try {
    // Check if a KYC record exists
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking for KYC record:', error);
      throw error;
    }
    
    // If no record exists, create one
    if (!data) {
      console.log('No KYC record found, creating one...');
      
      const { error: insertError } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: userId,
          status: 'not_started' // Use the string literal directly
        });
      
      if (insertError) {
        console.error('Error creating KYC record:', insertError);
        throw insertError;
      }
      
      console.log('Created new KYC record for user:', userId);
      return true;
    }
    
    console.log('KYC record already exists for user:', userId);
    return false;
  } catch (error) {
    console.error('Exception in ensureKycRecordExists:', error);
    return false;
  }
};
