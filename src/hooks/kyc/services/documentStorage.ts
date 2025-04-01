
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';

// Get available buckets
export const getAvailableBuckets = async (): Promise<string[]> => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.map(b => b.name) || [];
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Error fetching available buckets:', error);
    return [];
  }
};

// Test upload function - useful for debugging
export const testUpload = async (file: File): Promise<string> => {
  try {
    kycLogger.log(LogLevel.INFO, 'Testing upload with file:', file.name);
    
    // Get available buckets
    const availableBuckets = await getAvailableBuckets();
    
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
