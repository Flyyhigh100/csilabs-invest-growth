
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a specific bucket exists in Supabase storage
 */
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .storage
      .getBucket(bucketName);
    
    if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Exception checking bucket ${bucketName}:`, error);
    return false;
  }
};
