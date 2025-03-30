
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationData, KycFormData, KycStatus } from './types';

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
        status: 'not_started' as KycStatus,
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
          status: 'not_started' as KycStatus,
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

// Upload document for KYC verification
export const uploadKycDocument = async (
  userId: string,
  file: File,
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  console.log(`Uploading ${type} document for user:`, userId);
  
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      console.error(`Error uploading ${type} document:`, uploadError);
      throw uploadError;
    }
    
    console.log(`Uploaded ${type} document:`, uploadData);
    
    // Generate a public URL
    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    console.log(`Public URL for ${type}:`, publicUrl);
    
    // Ensure KYC record exists
    const { data: existingKyc, error: kycCheckError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (kycCheckError) {
      console.error('Error checking for KYC record:', kycCheckError);
      throw kycCheckError;
    }
    
    // Create KYC record if it doesn't exist
    if (!existingKyc) {
      console.log('No KYC record exists, creating a new one');
      
      const updateData: any = {
        user_id: userId,
        status: 'not_started' as KycStatus
      };
      
      // Set the appropriate URL field
      if (type === 'id_front') {
        updateData.id_front_url = publicUrl;
      } else if (type === 'id_back') {
        updateData.id_back_url = publicUrl;
      } else if (type === 'selfie') {
        updateData.selfie_url = publicUrl;
      }
      
      const { error: insertError } = await supabase
        .from('kyc_verifications')
        .insert(updateData);
      
      if (insertError) {
        console.error('Error creating KYC record with document URL:', insertError);
        throw insertError;
      }
      
      console.log('Created new KYC record with document URL');
    } else {
      // Update the appropriate URL field based on the document type
      const updateData: any = {};
      
      if (type === 'id_front') {
        updateData.id_front_url = publicUrl;
      } else if (type === 'id_back') {
        updateData.id_back_url = publicUrl;
      } else if (type === 'selfie') {
        updateData.selfie_url = publicUrl;
      }
      
      const { error: updateError } = await supabase
        .from('kyc_verifications')
        .update(updateData)
        .eq('user_id', userId);
      
      if (updateError) {
        console.error(`Error updating ${type} URL:`, updateError);
        throw updateError;
      }
      
      console.log(`Updated ${type} URL in KYC record`);
    }
    
    return publicUrl;
  } catch (error) {
    console.error(`Exception in uploadKycDocument (${type}):`, error);
    throw error;
  }
};

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  console.log('Submitting KYC verification for user:', userId);
  
  try {
    // Ensure KYC record exists and has all required fields
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (kycError) {
      console.error('Error fetching KYC verification:', kycError);
      throw kycError;
    }
    
    if (!kycData) {
      console.error('No KYC record found for user');
      throw new Error('No KYC record found');
    }
    
    if (!kycData.first_name || !kycData.last_name || !kycData.date_of_birth || 
        !kycData.nationality || !kycData.address || !kycData.city || 
        !kycData.postal_code || !kycData.country || !kycData.id_front_url || 
        !kycData.id_back_url || !kycData.selfie_url) {
      console.error('KYC record is missing required fields');
      throw new Error('Please complete all required fields before submitting');
    }
    
    // Update status to 'pending' and set submitted_at timestamp
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'pending' as KycStatus,
        submitted_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error submitting KYC verification:', error);
      throw error;
    }
    
    console.log('KYC verification submitted successfully');
    return true;
  } catch (error) {
    console.error('Exception in submitKycVerification:', error);
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
          status: 'not_started' as KycStatus
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

// This is for tests only - create a test verification record
export const insertTestKycVerification = async (userId: string): Promise<boolean> => {
  try {
    console.log('Creating test KYC verification for user:', userId);
    
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
      // Update the existing record
      const { error } = await supabase
        .from('kyc_verifications')
        .update({
          status: 'pending' as KycStatus,
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
      // Insert new record
      const { error } = await supabase
        .from('kyc_verifications')
        .insert({
          user_id: userId,
          status: 'pending' as KycStatus,
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
    
    return true;
  } catch (error) {
    console.error('Error in insertTestKycVerification:', error);
    return false;
  }
};

// Export the insertTestKycVerification function for VerificationStatusTab
export { insertTestKycVerification as createTestKycRecord };
