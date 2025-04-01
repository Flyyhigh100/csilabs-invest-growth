
import { supabase } from '@/integrations/supabase/client';

// Storage initialization status
export type StorageStatus = 'unchecked' | 'available' | 'unavailable' | 'initializing';

// Storage status singleton
let storageStatus: StorageStatus = 'unchecked';
let lastCheckTime = 0;
const CHECK_INTERVAL = 60 * 1000; // 1 minute

/**
 * Initialize the storage buckets using the Edge Function
 */
export const initializeStorage = async (): Promise<boolean> => {
  try {
    if (storageStatus === 'initializing') {
      console.log('Storage initialization already in progress');
      return false;
    }
    
    storageStatus = 'initializing';
    console.log('Initializing storage buckets via Edge Function...');
    
    // Call the Edge Function to set up storage buckets with proper permissions
    const { data, error } = await supabase.functions.invoke('setup-storage', {
      method: 'POST',
    });
    
    if (error) {
      console.error('Error initializing storage:', error);
      storageStatus = 'unavailable';
      return false;
    }
    
    console.log('Storage initialization result:', data);
    storageStatus = 'available';
    lastCheckTime = Date.now();
    return true;
  } catch (error) {
    console.error('Exception during storage initialization:', error);
    storageStatus = 'unavailable';
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
    !forceCheck && 
    Date.now() - lastCheckTime < CHECK_INTERVAL
  ) {
    return storageStatus;
  }
  
  try {
    console.log('Checking storage availability...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Storage not available:', error);
      storageStatus = 'unavailable';
    } else if (data && data.length > 0) {
      console.log('Storage buckets available:', data.map(b => b.name));
      storageStatus = 'available';
    } else {
      console.log('No storage buckets found, attempting to initialize...');
      await initializeStorage();
    }
  } catch (error) {
    console.error('Error checking storage:', error);
    storageStatus = 'unavailable';
  }
  
  lastCheckTime = Date.now();
  return storageStatus;
};

/**
 * Get current storage status without making API calls
 */
export const getStorageStatus = (): StorageStatus => {
  return storageStatus;
};
