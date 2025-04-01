import { supabase } from '@/integrations/supabase/client';
import { 
  checkStorageAvailability, 
  initializeStorage 
} from '@/services/storage/initStorage';
import { toast } from 'sonner';
import { kycLogger, LogLevel } from '../utils/logger';

// Primary storage buckets
const KYC_DOCUMENTS_BUCKET = 'kyc-documents';
const FALLBACK_BUCKET = 'documents';

// Upload document for KYC verification
export const uploadKycDocument = async (
  userId: string,
  file: File,
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  kycLogger.log(LogLevel.INFO, `Starting upload for ${type} document for user:`, userId);
  
  try {
    // First, check if storage is available
    const storageStatus = await checkStorageAvailability();
    if (storageStatus !== 'available') {
      await initializeStorage();
      
      // Check again after initialization attempt
      const updatedStatus = await checkStorageAvailability(true);
      if (updatedStatus !== 'available') {
        throw new Error('Storage service is currently unavailable. Please try again later.');
      }
    }
    
    // Check which buckets exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const availableBuckets = buckets?.map(b => b.name) || [];
    kycLogger.log(LogLevel.INFO, 'Available buckets:', availableBuckets);
    
    // Try primary bucket first, fall back to secondary if needed
    if (availableBuckets.includes(KYC_DOCUMENTS_BUCKET)) {
      return uploadToSpecificBucket(userId, file, type, KYC_DOCUMENTS_BUCKET);
    } else if (availableBuckets.includes(FALLBACK_BUCKET)) {
      kycLogger.log(LogLevel.WARN, `Primary bucket not available, using fallback: ${FALLBACK_BUCKET}`);
      return uploadToSpecificBucket(userId, file, type, FALLBACK_BUCKET);
    } else {
      throw new Error('No storage buckets available for document upload.');
    }
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Exception in uploadKycDocument (${type}):`, error);
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
    
    kycLogger.log(LogLevel.INFO, `Uploading ${type} document to bucket '${bucketName}' at path: ${filePath}`);
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { upsert: true });
    
    if (uploadError) {
      kycLogger.log(LogLevel.ERROR, `Error uploading ${type} document:`, uploadError);
      throw uploadError;
    }
    
    kycLogger.log(LogLevel.INFO, `Uploaded ${type} document:`, uploadData);
    
    // Generate a public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    const publicUrl = publicUrlData.publicUrl;
    kycLogger.log(LogLevel.INFO, `Public URL for ${type}:`, publicUrl);
    
    // Update the KYC record with the document URL
    await updateKycRecordWithDocumentUrl(userId, type, publicUrl);
    
    return publicUrl;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Error in uploadToSpecificBucket (${type}):`, error);
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
      kycLogger.log(LogLevel.ERROR, 'Error checking for KYC record:', kycCheckError);
      throw kycCheckError;
    }
    
    // Create KYC record if it doesn't exist
    if (!existingKyc) {
      kycLogger.log(LogLevel.INFO, 'No KYC record exists, creating a new one');
      
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
        kycLogger.log(LogLevel.ERROR, 'Error creating KYC record with document URL:', insertError);
        throw insertError;
      }
      
      kycLogger.log(LogLevel.INFO, 'Created new KYC record with document URL');
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
        kycLogger.log(LogLevel.ERROR, `Error updating ${type} URL:`, updateError);
        throw updateError;
      }
      
      kycLogger.log(LogLevel.INFO, `Updated ${type} URL in KYC record`);
    }
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Error updating KYC record with document URL:', error);
    throw error;
  }
};

// Test upload function - useful for debugging
export const testUpload = async (file: File): Promise<string> => {
  try {
    kycLogger.log(LogLevel.INFO, 'Testing upload with file:', file.name);
    
    // Check storage availability and initialize if needed
    const storageStatus = await checkStorageAvailability();
    if (storageStatus !== 'available') {
      await initializeStorage();
      // Verify initialization was successful
      const updatedStatus = await checkStorageAvailability(true);
      if (updatedStatus !== 'available') {
        throw new Error('Storage service could not be initialized');
      }
    }
    
    // Get available buckets
    const { data: buckets } = await supabase.storage.listBuckets();
    const availableBuckets = buckets?.map(b => b.name) || [];
    
    if (!availableBuckets.length) {
      throw new Error('No storage buckets available');
    }
    
    const bucketToUse = availableBuckets[0]; // Use first available bucket
    kycLogger.log(LogLevel.INFO, `Using bucket for test upload: ${bucketToUse}`);
    
    const testPath = `test/test_${Date.now()}.${file.name.split('.').pop()}`;
    
    // Upload to test location
    const { data, error } = await supabase.storage
      .from(bucketToUse)
      .upload(testPath, file);
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, 'Test upload failed:', error);
      throw error;
    }
    
    kycLogger.log(LogLevel.INFO, 'Test upload succeeded:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketToUse)
      .getPublicUrl(testPath);
    
    kycLogger.log(LogLevel.INFO, 'Test upload URL:', urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Test upload exception:', error);
    throw error;
  }
};
