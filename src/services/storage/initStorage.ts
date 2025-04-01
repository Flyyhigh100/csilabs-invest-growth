
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
    
    kycLogger.log(LogLevel.INFO, `Initializing storage buckets via Edge Function (attempt ${initializationAttempts})...`);
    
    // Call the Edge Function to set up storage buckets with proper permissions
    const { data, error } = await supabase.functions.invoke('setup-storage', {
      method: 'POST',
      body: { force: initializationAttempts > 1 }  // Force recreation on retry attempts
    });
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, 'Error initializing storage:', error);
      storageStatus = 'error';
      return false;
    }
    
    kycLogger.log(LogLevel.INFO, 'Storage initialization result:', data);
    
    // Verify initialization by checking if buckets actually exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError || !buckets || buckets.length === 0) {
      kycLogger.log(LogLevel.ERROR, 'Initialization reported success but no buckets found:', listError || 'No buckets');
      storageStatus = 'error';
      return false;
    }
    
    // Reset counter on successful init
    initializationAttempts = 0;
    storageStatus = 'available';
    lastCheckTime = Date.now();
    return true;
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
