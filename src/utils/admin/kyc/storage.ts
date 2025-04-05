
import { supabase } from '@/integrations/supabase/client';

/**
 * Check if a specific bucket exists in Supabase storage
 */
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    const { data, error } = await supabase
      .storage
      .getBucket(bucketName);
    
    if (error) {
      console.error(`Error checking bucket ${bucketName}:`, error);
      return false;
    }
    
    console.log(`Bucket check result for '${bucketName}':`, !!data);
    return !!data;
  } catch (error) {
    console.error(`Exception checking bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * List all available storage buckets - useful for debugging
 */
export const listAllBuckets = async (): Promise<string[]> => {
  try {
    console.log('Listing all storage buckets...');
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return [];
    }
    
    const bucketNames = data.map(bucket => bucket.name);
    console.log('Available storage buckets:', bucketNames);
    return bucketNames;
  } catch (error) {
    console.error('Exception listing buckets:', error);
    return [];
  }
};
