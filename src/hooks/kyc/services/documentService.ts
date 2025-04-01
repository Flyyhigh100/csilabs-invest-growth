
import { supabase } from '@/integrations/supabase/client';
import { 
  ensureBucketExists, 
  listAllBuckets, 
  KYC_DOCUMENTS_BUCKET, 
  initializeRequiredBuckets 
} from '@/utils/admin/kyc/storage';
import { toast } from 'sonner';

// Upload document for KYC verification
export const uploadKycDocument = async (
  userId: string,
  file: File,
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  console.log(`Starting upload for ${type} document for user:`, userId);
  
  try {
    // First, try to initialize all required buckets
    await initializeRequiredBuckets();
    
    // Check if the primary bucket exists or create it
    const bucketExists = await ensureBucketExists(KYC_DOCUMENTS_BUCKET);
    
    if (!bucketExists) {
      console.error(`Cannot proceed with upload, bucket '${KYC_DOCUMENTS_BUCKET}' does not exist and could not be created`);
      // List available buckets for debugging
      const availableBuckets = await listAllBuckets();
      console.log('Available buckets:', availableBuckets);
      
      // If primary bucket failed, try the fallback bucket
      const fallbackBucket = 'documents';
      const fallbackExists = await ensureBucketExists(fallbackBucket);
      
      if (!fallbackExists) {
        throw new Error('Storage buckets are not available. Please try again later.');
      }
      
      // Use fallback bucket instead
      return uploadToSpecificBucket(userId, file, type, fallbackBucket);
    }
    
    return uploadToSpecificBucket(userId, file, type, KYC_DOCUMENTS_BUCKET);
  } catch (error) {
    console.error(`Exception in uploadKycDocument (${type}):`, error);
    throw error;
  }
};

// Helper function to upload to a specific bucket
const uploadToSpecificBucket = async (
  userId: string, 
  file: File, 
  type: 'id_front' | 'id_back' | 'selfie',
  bucketName: string
): Promise<string> => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    console.log(`Uploading ${type} document to bucket '${bucketName}' at path: ${filePath}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      console.error(`Error uploading ${type} document:`, uploadError);
      throw uploadError;
    }
    
    console.log(`Uploaded ${type} document:`, uploadData);
    
    // Generate a public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    console.log(`Public URL for ${type}:`, publicUrl);
    
    // Update the KYC record with the document URL
    await updateKycRecordWithDocumentUrl(userId, type, publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error(`Error in uploadToSpecificBucket (${type}):`, error);
    throw error;
  }
};

// Update KYC record with document URL
const updateKycRecordWithDocumentUrl = async (
  userId: string,
  type: 'id_front' | 'id_back' | 'selfie',
  url: string
): Promise<void> => {
  try {
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
        updateData.id_front_url = url;
      } else if (type === 'id_back') {
        updateData.id_back_url = url;
      } else if (type === 'selfie') {
        updateData.selfie_url = url;
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
        updateData.id_front_url = url;
      } else if (type === 'id_back') {
        updateData.id_back_url = url;
      } else if (type === 'selfie') {
        updateData.selfie_url = url;
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
  } catch (error) {
    console.error('Error updating KYC record with document URL:', error);
    throw error;
  }
};

// Test upload function - useful for debugging
export const testUpload = async (file: File): Promise<string> => {
  try {
    console.log('Testing upload with file:', file.name);
    
    // Initialize required buckets
    await initializeRequiredBuckets();
    
    // Check for any available bucket
    const buckets = await listAllBuckets();
    if (!buckets.length) {
      throw new Error('No storage buckets available');
    }
    
    const bucketToUse = buckets[0]; // Use first available bucket
    console.log(`Using bucket for test upload: ${bucketToUse}`);
    
    const testPath = `test/test_${Date.now()}.${file.name.split('.').pop()}`;
    
    // Upload to test location
    const { data, error } = await supabase.storage
      .from(bucketToUse)
      .upload(testPath, file);
    
    if (error) {
      console.error('Test upload failed:', error);
      throw error;
    }
    
    console.log('Test upload succeeded:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketToUse)
      .getPublicUrl(testPath);
    
    console.log('Test upload URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Test upload exception:', error);
    throw error;
  }
};
