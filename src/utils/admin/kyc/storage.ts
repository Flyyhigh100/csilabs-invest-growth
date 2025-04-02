import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';
import { 
  checkStorageAvailability, 
  initializeStorage, 
  testStorageConnection 
} from '@/services/storage/initStorage';

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
      kycLogger.log(LogLevel.WARN, `Storage service is not available, status: ${storageStatus}`);
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

// Test bucket accessibility by attempting a small operation
export const testBucketAccess = async (bucketName: string): Promise<boolean> => {
  try {
    kycLogger.log(LogLevel.INFO, `Testing bucket '${bucketName}' accessibility...`);
    
    // First check if bucket exists
    const exists = await checkBucketExists(bucketName);
    if (!exists) {
      kycLogger.log(LogLevel.WARN, `Bucket '${bucketName}' does not exist`);
      return false;
    }
    
    // Attempt to list files in the bucket (should work even if empty)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('test', { limit: 1 });
    
    if (error) {
      kycLogger.log(LogLevel.WARN, `Cannot access bucket '${bucketName}':`, error);
      return false;
    }
    
    kycLogger.log(LogLevel.INFO, `Successfully accessed bucket '${bucketName}'`);
    return true;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, `Error testing bucket '${bucketName}' access:`, error);
    return false;
  }
};

// Ensure bucket exists before upload
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  const exists = await checkBucketExists(bucketName);
  if (!exists) {
    kycLogger.log(LogLevel.INFO, `Bucket '${bucketName}' does not exist, attempting to create via initialization`);
    
    // Try initialization
    const initialized = await initializeStorage();
    if (!initialized) {
      kycLogger.log(LogLevel.ERROR, `Failed to initialize storage for bucket '${bucketName}'`);
      return false;
    }
    
    // Verify the bucket now exists
    const bucketCreated = await checkBucketExists(bucketName);
    if (!bucketCreated) {
      kycLogger.log(LogLevel.ERROR, `Bucket '${bucketName}' still doesn't exist after initialization`);
      return false;
    }
    
    // Test the bucket is accessible
    return await testBucketAccess(bucketName);
  }
  
  return true;
};

// Check if RLS is enabled for the storage.objects table
export const checkStorageRlsStatus = async (): Promise<{
  enabled: boolean | null;
  error: string | null;
}> => {
  try {
    // This is a privileged operation, will only work for admin users
    // Change from 'check_storage_rls_status' to 'is_admin'
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error checking storage RLS status:', error);
      return { enabled: null, error: error.message };
    }
    
    return { enabled: data, error: null };
  } catch (error) {
    console.error('Exception in checkStorageRlsStatus:', error);
    return { 
      enabled: null, 
      error: error instanceof Error ? error.message : 'Unknown error checking RLS status' 
    };
  }
};

// Comprehensive storage diagnosis utility
export const diagnoseStorageIssues = async (): Promise<{
  success: boolean;
  connection: boolean;
  buckets: string[];
  accessibleBuckets: string[];
  rlsEnabled: boolean | null;
  errors: string[];
}> => {
  const result = {
    success: false,
    connection: false,
    buckets: [] as string[],
    accessibleBuckets: [] as string[],
    rlsEnabled: null as boolean | null,
    errors: [] as string[]
  };
  
  try {
    // Test basic connection
    result.connection = await testStorageConnection();
    if (!result.connection) {
      result.errors.push('Cannot connect to storage service');
      return result;
    }
    
    // Check RLS status
    const rlsStatus = await checkStorageRlsStatus();
    result.rlsEnabled = rlsStatus.enabled;
    
    if (rlsStatus.error) {
      result.errors.push(`RLS check error: ${rlsStatus.error}`);
    } else if (result.rlsEnabled === true) {
      result.errors.push('Storage RLS is enabled which may restrict access');
    }
    
    // List available buckets
    const buckets = await listAllBuckets();
    result.buckets = buckets;
    
    if (buckets.length === 0) {
      result.errors.push('No storage buckets found');
      
      // Try to initialize
      const initialized = await initializeStorage();
      if (!initialized) {
        result.errors.push('Failed to initialize storage buckets');
        return result;
      }
      
      // Check again after initialization
      const updatedBuckets = await listAllBuckets();
      result.buckets = updatedBuckets;
      
      if (updatedBuckets.length === 0) {
        result.errors.push('Still no buckets after initialization');
        return result;
      }
    }
    
    // Test accessibility of each bucket
    for (const bucket of result.buckets) {
      const isAccessible = await testBucketAccess(bucket);
      if (isAccessible) {
        result.accessibleBuckets.push(bucket);
      } else {
        result.errors.push(`Bucket '${bucket}' exists but is not accessible`);
      }
    }
    
    // Overall success if we have accessible buckets and no critical errors
    result.success = result.accessibleBuckets.length > 0;
    
    return result;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Error during storage diagnosis:', error);
    result.errors.push(`Unexpected error during diagnosis: ${error instanceof Error ? error.message : String(error)}`);
    return result;
  }
};
