
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { checkStorageAvailability, initializeStorage } from '@/services/storage/initStorage';
import { updateKycRecordWithDocumentUrl } from './documentRecords';
import { getAvailableBuckets } from './documentStorage';

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
    const availableBuckets = await getAvailableBuckets();
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
export const uploadToSpecificBucket = async (
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
