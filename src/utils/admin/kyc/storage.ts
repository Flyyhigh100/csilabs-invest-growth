
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { checkStorageAvailability, initializeStorage } from '@/services/storage/initStorage';

// Primary bucket name for KYC documents
export const KYC_DOCUMENTS_BUCKET = 'kyc-documents';

// Initialize all required buckets for the application
export const initializeRequiredBuckets = async (): Promise<boolean> => {
  try {
    kycLogger.log(LogLevel.INFO, 'Initializing required storage buckets...');
    return await initializeStorage();
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Error initializing buckets:', error);
    return false;
  }
};

// Check if a bucket exists in Supabase storage
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    kycLogger.log(LogLevel.INFO, `Checking if bucket '${bucketName}' exists...`);
    
    // Use the storage service to check availability first
    const storageStatus = await checkStorageAvailability();
    if (storageStatus !== 'available') {
      kycLogger.log(LogLevel.WARN, 'Storage service is not available');
      return false;
    }
    
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      kycLogger.log(LogLevel.WARN, `Bucket '${bucketName}' not found:`, error);
      return false;
    }
    
    kycLogger.log(LogLevel.INFO, `Bucket '${bucketName}' exists:`, data);
    return true;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Error checking bucket '${bucketName}':`, error);
    return false;
  }
};

// List all available storage buckets - useful for debugging
export const listAllBuckets = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, 'Error listing buckets:', error);
      return [];
    }
    
    const bucketNames = data.map(bucket => bucket.name);
    kycLogger.log(LogLevel.INFO, 'Available storage buckets:', bucketNames);
    return bucketNames;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Exception listing buckets:', error);
    return [];
  }
};

// Ensure bucket exists before upload
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  const exists = await checkBucketExists(bucketName);
  if (!exists) {
    kycLogger.log(LogLevel.INFO, `Bucket '${bucketName}' does not exist, attempting to create via initialization`);
    return await initializeStorage();
  }
  
  return true;
};
