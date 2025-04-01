
import { supabase } from '@/integrations/supabase/client';
import { ensureBucketExists, listAllBuckets } from '@/utils/admin/kyc/storage';
import { toast } from 'sonner';

const DOCUMENTS_BUCKET = 'documents';

// Upload document for KYC verification
export const uploadKycDocument = async (
  userId: string,
  file: File,
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  console.log(`Starting upload for ${type} document for user:`, userId);
  
  try {
    // Check if bucket exists or create it
    const bucketExists = await ensureBucketExists(DOCUMENTS_BUCKET);
    
    if (!bucketExists) {
      console.error(`Cannot proceed with upload, bucket '${DOCUMENTS_BUCKET}' does not exist and could not be created`);
      // List available buckets for debugging
      await listAllBuckets();
      throw new Error(`Storage bucket '${DOCUMENTS_BUCKET}' is not available`);
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    console.log(`Uploading ${type} document to path: ${filePath}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      console.error(`Error uploading ${type} document:`, uploadError);
      toast.error(`Failed to upload ${type} document: ${uploadError.message}`);
      throw uploadError;
    }
    
    console.log(`Uploaded ${type} document:`, uploadData);
    
    // Generate a public URL
    const { data: publicUrlData } = supabase.storage
      .from(DOCUMENTS_BUCKET)
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

// Test upload function - useful for debugging
export const testUpload = async (file: File): Promise<string> => {
  try {
    console.log('Testing upload with file:', file.name);
    
    // Ensure bucket exists
    await ensureBucketExists(DOCUMENTS_BUCKET);
    
    const testPath = `test/test_${Date.now()}.${file.name.split('.').pop()}`;
    
    // Upload to test location
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(testPath, file);
    
    if (error) {
      console.error('Test upload failed:', error);
      throw error;
    }
    
    console.log('Test upload succeeded:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(DOCUMENTS_BUCKET)
      .getPublicUrl(testPath);
    
    console.log('Test upload URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Test upload exception:', error);
    throw error;
  }
};
