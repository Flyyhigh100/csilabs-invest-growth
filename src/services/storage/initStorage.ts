
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';

// Storage initialization status
export type StorageStatus = 'unchecked' | 'available' | 'unavailable' | 'initializing' | 'error';

// Storage status singleton
let storageStatus: StorageStatus = 'unchecked';
let lastCheckTime = 0;
let initializationAttempts = 0;
const CHECK_INTERVAL = 60 * 1000; // 1 minute
const MAX_INIT_ATTEMPTS = 3;
const INIT_COOLDOWN = 5 * 60 * 1000; // 5 minutes
let lastInitAttemptTime = 0;

/**
 * Initialize the storage buckets using the Edge Function
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    if (storageStatus === 'initializing') {
      kycLogger.log(LogLevel.INFO, 'Storage initialization already in progress');
      return false;
    }
    
    // Add cooldown period between attempts
    const now = Date.now();
    if (initializationAttempts >= MAX_INIT_ATTEMPTS && now - lastInitAttemptTime < INIT_COOLDOWN) {
      kycLogger.log(
        LogLevel.WARN, 
        `Too many initialization attempts (${initializationAttempts}). Cooling down until ${new Date(lastInitAttemptTime + INIT_COOLDOWN).toISOString()}`
      );
      storageStatus = 'error';
      return false;
    }
    
    storageStatus = 'initializing';
    lastInitAttemptTime = now;
    initializationAttempts++;
    
    kycLogger.log(LogLevel.INFO, `Initializing storage buckets via manual check (attempt ${initializationAttempts})...`);
    
    // Directly try to access the buckets to see if they exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      kycLogger.log(LogLevel.ERROR, 'Cannot access storage buckets:', bucketsError);
      storageStatus = 'error';
      return false;
    }
    
    // Check if our required buckets exist
    const kycBucketExists = buckets?.some(b => b.name === 'kyc-documents');
    const docsBucketExists = buckets?.some(b => b.name === 'documents');
    
    kycLogger.log(LogLevel.INFO, 'Bucket check results:', {
      buckets: buckets?.map(b => b.name),
      kycBucketExists,
      docsBucketExists
    });
    
    // If buckets are found, consider storage available
    if (kycBucketExists || docsBucketExists) {
      storageStatus = 'available';
      lastCheckTime = Date.now();
      return true;
    }
    
    // If no required buckets exist, make another attempt to access public bucket list
    const { data: publicBuckets } = await supabase.storage.listBuckets();
    
    if (publicBuckets && publicBuckets.length > 0) {
      // Some buckets exist, so storage is available
      kycLogger.log(LogLevel.INFO, 'Found alternative buckets:', publicBuckets.map(b => b.name));
      storageStatus = 'available';
      lastCheckTime = Date.now();
      return true;
    }
    
    kycLogger.log(LogLevel.ERROR, 'No storage buckets found during initialization');
    storageStatus = 'unavailable';
    return false;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Exception during storage initialization:', error);
    storageStatus = 'error';
    return false;
  }
};

/**
 * Check if storage is available by trying to list buckets
 */
export const checkStorageAvailability = async (forceCheck = false): Promise<StorageStatus> => {
  // Return cached status if recent check and not forcing
  if (
    storageStatus !== 'unchecked' && 
    storageStatus !== 'error' &&
    !forceCheck && 
    Date.now() - lastCheckTime < CHECK_INTERVAL
  ) {
    return storageStatus;
  }
  
  try {
    kycLogger.log(LogLevel.INFO, 'Checking storage availability...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, 'Storage not available:', error);
      storageStatus = 'unavailable';
    } else if (data && data.length > 0) {
      const bucketNames = data.map(b => b.name).join(', ');
      kycLogger.log(LogLevel.INFO, `Storage buckets available: ${bucketNames}`);
      storageStatus = 'available';
      // Reset initialization attempts on successful connection
      initializationAttempts = 0;
    } else {
      kycLogger.log(LogLevel.WARN, 'No storage buckets found, attempting to initialize...');
      await initializeStorage();
    }
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Error checking storage:', error);
    storageStatus = 'unavailable';
  }
  
  lastCheckTime = Date.now();
  return storageStatus;
};

/**
 * Test the connection to storage by attempting a simple operation
 */
export const testStorageConnection = async (): Promise<boolean> => {
  try {
    kycLogger.log(LogLevel.INFO, 'Testing storage connection with a simple operation');
    
    // Try to list buckets as a simple test
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, 'Storage connection test failed:', error);
      return false;
    }
    
    kycLogger.log(LogLevel.INFO, 'Storage connection test succeeded, found buckets:', 
      data ? data.map(b => b.name).join(', ') : 'none');
    return true;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Storage connection test exception:', error);
    return false;
  }
};

/**
 * Get current storage status without making API calls
 */
export const getStorageStatus = (): StorageStatus => {
  return storageStatus;
};

/**
 * Reset the initialization counter and status
 * Useful when manually triggering a retry after errors
 */
export const resetStorageInitialization = (): void => {
  initializationAttempts = 0;
  lastInitAttemptTime = 0;
  storageStatus = 'unchecked';
  lastCheckTime = 0;
  kycLogger.log(LogLevel.INFO, 'Storage initialization state has been reset');
};
