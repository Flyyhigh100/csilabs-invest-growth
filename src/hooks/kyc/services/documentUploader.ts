
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { checkStorageAvailability, initializeStorage } from '@/services/storage/initStorage';
import { updateKycRecordWithDocumentUrl } from './documentRecords';
import { getAvailableBuckets, directUpload } from './documentStorage';
import { diagnoseStorageIssues, ensureBucketExists } from '@/utils/admin/kyc/storage';

// Primary storage buckets
const KYC_DOCUMENTS_BUCKET = 'kyc-documents';
const FALLBACK_BUCKET = 'documents';

// Max retries for uploads
const MAX_UPLOAD_RETRIES = 2;

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
      kycLogger.log(LogLevel.WARN, `Storage not available (status: ${storageStatus}), attempting initialization`);
      
      await initializeStorage();
      
      // Check again after initialization attempt
      const updatedStatus = await checkStorageAvailability(true);
      if (updatedStatus !== 'available') {
        kycLogger.log(LogLevel.ERROR, `Storage still unavailable after initialization (status: ${updatedStatus})`);
        throw new Error('Storage service is currently unavailable. Please try again later.');
      }
    }
    
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    kycLogger.log(LogLevel.INFO, `Attempting direct upload for ${type} with path: ${filePath}`);
    
    // Use our simplified direct upload helper
    try {
      const publicUrl = await directUpload(file, filePath, [KYC_DOCUMENTS_BUCKET, FALLBACK_BUCKET]);
      
      // Update the KYC record with the document URL
      await updateKycRecordWithDocumentUrl(userId, type, publicUrl);
      
      return publicUrl;
    } catch (directUploadError) {
      kycLogger.log(LogLevel.ERROR, `Direct upload failed for ${type}:`, directUploadError);
      
      // Fallback to original upload method if direct upload fails
      return uploadToSpecificBucket(userId, file, type, KYC_DOCUMENTS_BUCKET);
    }
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Exception in uploadKycDocument (${type}):`, error);
    throw error;
  }
};

// Helper function to upload to a specific bucket with retries
export const uploadToSpecificBucket = async (
  userId: string, 
  file: File, 
  type: 'id_front' | 'id_back' | 'selfie',
  bucketName: string,
  retryCount = 0
): Promise<string> => {
  try {
    // Create a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    kycLogger.log(LogLevel.INFO, `Uploading ${type} document to bucket '${bucketName}' at path: ${filePath}`);
    
    // Upload to Supabase Storage with automatic content type detection
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type // Explicitly set content type from file
      });
    
    if (uploadError) {
      kycLogger.log(LogLevel.ERROR, `Error uploading ${type} document:`, uploadError);
      
      // Handle specific error cases
      if (uploadError.message.includes('Permission') || uploadError.message.includes('auth')) {
        // Try without specific bucket as a last resort
        const { data: buckets } = await supabase.storage.listBuckets();
        if (buckets && buckets.length > 0) {
          const anyBucket = buckets[0].name;
          kycLogger.log(LogLevel.WARN, `Permission error, trying generic bucket: ${anyBucket}`);
          return uploadToSpecificBucket(userId, file, type, anyBucket);
        }
        
        throw new Error('Permission denied for file upload.');
      }
      
      // Retry logic for temporary errors
      if (retryCount < MAX_UPLOAD_RETRIES) {
        kycLogger.log(LogLevel.WARN, `Retrying upload for ${type}, attempt ${retryCount + 1}/${MAX_UPLOAD_RETRIES}`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return uploadToSpecificBucket(userId, file, type, bucketName, retryCount + 1);
      }
      
      // Try alternate bucket as last resort
      if (bucketName === KYC_DOCUMENTS_BUCKET && FALLBACK_BUCKET) {
        kycLogger.log(LogLevel.WARN, `Trying fallback bucket: ${FALLBACK_BUCKET}`);
        return uploadToSpecificBucket(userId, file, type, FALLBACK_BUCKET);
      }
      
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

// Create a simpler upload function for frontend use
export const simplifiedUploadDocument = async (
  userId: string,
  file: File,
  type: 'id_front' | 'id_back' | 'selfie'
): Promise<string> => {
  try {
    kycLogger.log(LogLevel.INFO, `Starting simplified upload for ${type} document`);
    
    // Create a unique path
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `kyc/${fileName}`;
    
    // Get all available buckets
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketNames = buckets?.map(b => b.name) || [];
    
    if (bucketNames.length === 0) {
      throw new Error('No storage buckets available');
    }
    
    kycLogger.log(LogLevel.INFO, `Available buckets: ${bucketNames.join(', ')}`);
    
    // Try to find our preferred buckets
    let bucketToUse = bucketNames.find(b => b === 'kyc-documents') || 
                      bucketNames.find(b => b === 'documents') || 
                      bucketNames[0]; // Fallback to first available
    
    kycLogger.log(LogLevel.INFO, `Using bucket for upload: ${bucketToUse}`);
    
    // Upload to the selected bucket
    const { data, error } = await supabase.storage
      .from(bucketToUse)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, `Upload error: ${error.message}`);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketToUse)
      .getPublicUrl(filePath);
    
    // Update the KYC record
    await updateKycRecordWithDocumentUrl(userId, type, urlData.publicUrl);
    
    return urlData.publicUrl;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Simplified upload error for ${type}:`, error);
    throw error;
  }
};
