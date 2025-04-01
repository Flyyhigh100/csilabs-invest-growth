
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { checkStorageAvailability, initializeStorage } from '@/services/storage/initStorage';
import { updateKycRecordWithDocumentUrl } from './documentRecords';
import { getAvailableBuckets } from './documentStorage';
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
    
    // Check which buckets exist
    const availableBuckets = await getAvailableBuckets();
    kycLogger.log(LogLevel.INFO, 'Available buckets:', availableBuckets);
    
    if (availableBuckets.length === 0) {
      kycLogger.log(LogLevel.WARN, 'No buckets found, running full storage diagnosis');
      
      // Run a full diagnosis
      const diagnosis = await diagnoseStorageIssues();
      
      if (!diagnosis.success) {
        kycLogger.log(LogLevel.ERROR, 'Storage diagnosis failed:', diagnosis);
        throw new Error(`Storage service is not properly configured: ${diagnosis.errors.join(', ')}`);
      }
      
      // Use diagnosed accessible buckets
      if (diagnosis.accessibleBuckets.includes(KYC_DOCUMENTS_BUCKET)) {
        return uploadToSpecificBucket(userId, file, type, KYC_DOCUMENTS_BUCKET);
      } else if (diagnosis.accessibleBuckets.includes(FALLBACK_BUCKET)) {
        kycLogger.log(LogLevel.WARN, `Using fallback bucket from diagnosis: ${FALLBACK_BUCKET}`);
        return uploadToSpecificBucket(userId, file, type, FALLBACK_BUCKET);
      } else if (diagnosis.accessibleBuckets.length > 0) {
        // Use first available bucket as last resort
        const emergencyBucket = diagnosis.accessibleBuckets[0];
        kycLogger.log(LogLevel.WARN, `Using emergency fallback bucket: ${emergencyBucket}`);
        return uploadToSpecificBucket(userId, file, type, emergencyBucket);
      }
      
      throw new Error('No storage buckets available for document upload.');
    }
    
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

// Helper function to upload to a specific bucket with retries
export const uploadToSpecificBucket = async (
  userId: string, 
  file: File, 
  type: 'id_front' | 'id_back' | 'selfie',
  bucketName: string,
  retryCount = 0
): Promise<string> => {
  try {
    // Ensure bucket exists first
    const bucketExists = await ensureBucketExists(bucketName);
    if (!bucketExists) {
      if (bucketName === KYC_DOCUMENTS_BUCKET && FALLBACK_BUCKET) {
        // Try fallback bucket
        kycLogger.log(LogLevel.WARN, `Primary bucket '${bucketName}' unavailable, trying fallback: ${FALLBACK_BUCKET}`);
        return uploadToSpecificBucket(userId, file, type, FALLBACK_BUCKET);
      }
      throw new Error(`Storage bucket '${bucketName}' is not available`);
    }
    
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
        throw new Error('You do not have permission to upload files. Please try logging out and back in.');
      }
      
      // Retry logic for temporary errors
      if (retryCount < MAX_UPLOAD_RETRIES) {
        kycLogger.log(LogLevel.WARN, `Retrying upload for ${type}, attempt ${retryCount + 1}/${MAX_UPLOAD_RETRIES}`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return uploadToSpecificBucket(userId, file, type, bucketName, retryCount + 1);
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
    
    // Verify the URL is accessible by attempting to fetch the headers
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' });
      if (!response.ok) {
        kycLogger.log(LogLevel.WARN, `Generated URL is not accessible: ${publicUrl}, status: ${response.status}`);
      }
    } catch (fetchError) {
      // Non-blocking warning, don't throw
      kycLogger.log(LogLevel.WARN, `Could not verify URL accessibility: ${publicUrl}`, fetchError);
    }
    
    // Update the KYC record with the document URL
    await updateKycRecordWithDocumentUrl(userId, type, publicUrl);
    
    return publicUrl;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Error in uploadToSpecificBucket (${type}):`, error);
    throw error;
  }
};
