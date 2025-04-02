
import { supabase } from '@/integrations/supabase/client';

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
        status: 'not_started' as string
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
