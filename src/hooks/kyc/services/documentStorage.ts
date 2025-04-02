
import { supabase } from '@/integrations/supabase/client';
import { kycLogger, LogLevel } from '@/hooks/kyc/utils/logger';

// Get available buckets
export const getAvailableBuckets = async (): Promise<string[]> => {
  try {
    // Use a direct query that doesn't depend on RLS
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      kycLogger.log(LogLevel.ERROR, 'Error fetching available buckets:', error);
      return [];
    }
    
    const bucketNames = data?.map(b => b.name) || [];
    kycLogger.log(LogLevel.INFO, 'Available storage buckets:', bucketNames);
    return bucketNames;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Exception fetching available buckets:', error);
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
    
    // Try each bucket until one works
    let uploadSuccessful = false;
    let publicUrl = '';
    
    for (const bucketName of availableBuckets) {
      try {
        kycLogger.log(LogLevel.INFO, `Attempting test upload to bucket: ${bucketName}`);
        
        const testPath = `test/test_${Date.now()}.${file.name.split('.').pop()}`;
        
        // Upload to test location
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(testPath, file);
        
        if (error) {
          kycLogger.log(LogLevel.WARN, `Test upload to bucket ${bucketName} failed:`, error);
          continue; // Try next bucket
        }
        
        kycLogger.log(LogLevel.INFO, `Test upload to bucket ${bucketName} succeeded:`, data);
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(testPath);
        
        kycLogger.log(LogLevel.INFO, `Test upload URL from ${bucketName}:`, urlData.publicUrl);
        
        publicUrl = urlData.publicUrl;
        uploadSuccessful = true;
        
        // Clean up test file
        supabase.storage
          .from(bucketName)
          .remove([testPath])
          .then(({ error }) => {
            if (error) {
              kycLogger.log(LogLevel.WARN, `Failed to clean up test file in ${bucketName}:`, error);
            } else {
              kycLogger.log(LogLevel.INFO, `Cleaned up test file in ${bucketName}`);
            }
          });
        
        break; // Exit loop if upload successful
      } catch (bucketError) {
        kycLogger.log(LogLevel.WARN, `Error in test upload to bucket ${bucketName}:`, bucketError);
      }
    }
    
    if (!uploadSuccessful) {
      throw new Error('Test upload failed on all available buckets');
    }
    
    return publicUrl;
  } catch (error) {
    kycLogger.log(LogLevel.ERROR, 'Test upload exception:', error);
    throw error;
  }
};

// Create a direct upload helper that bypasses complex logic for users
export const directUpload = async (
  file: File, 
  filePath: string,
  bucketOptions: string[] = ['kyc-documents', 'documents']
): Promise<string> => {
  kycLogger.log(LogLevel.INFO, `Starting direct upload: ${filePath}`, { fileSize: file.size, fileType: file.type });
  
  // Get available buckets
  const availableBuckets = await getAvailableBuckets();
  
  if (!availableBuckets.length) {
    throw new Error('No storage buckets available');
  }
  
  // Filter to use only our preferred buckets if they exist
  const bucketsToTry = availableBuckets.filter(b => bucketOptions.includes(b));
  
  // Fallback to any available bucket if none of our preferred buckets exist
  const targetBuckets = bucketsToTry.length > 0 ? bucketsToTry : availableBuckets;
  
  kycLogger.log(LogLevel.INFO, 'Buckets available for upload:', targetBuckets);
  
  // Try each bucket in order
  for (const bucketName of targetBuckets) {
    try {
      kycLogger.log(LogLevel.INFO, `Attempting upload to bucket: ${bucketName}`);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type // Explicitly set content type from file
        });
      
      if (error) {
        kycLogger.log(LogLevel.WARN, `Upload to bucket ${bucketName} failed:`, error);
        continue; // Try next bucket
      }
      
      kycLogger.log(LogLevel.INFO, `Upload to bucket ${bucketName} succeeded:`, data);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      kycLogger.log(LogLevel.INFO, `Generated URL from ${bucketName}:`, urlData.publicUrl);
      
      return urlData.publicUrl;
    } catch (bucketError) {
      kycLogger.log(LogLevel.WARN, `Error in upload to bucket ${bucketName}:`, bucketError);
    }
  }
  
  // If we get here, all buckets failed
  throw new Error('Upload failed on all available buckets');
};
