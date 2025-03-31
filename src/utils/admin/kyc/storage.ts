
import { supabase } from '@/integrations/supabase/client';

// Check if a bucket exists in Supabase storage
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      console.error(`Bucket '${bucketName}' not found:`, error);
      
      // Check if we can list buckets to see what's available
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (!bucketsError && buckets) {
        console.log('Available buckets:', buckets.map(b => b.name));
        // Check if there's a similar bucket that might be the correct one
        const similarBucket = buckets.find(b => 
          b.name.toLowerCase().includes('kyc') || 
          b.name.toLowerCase().includes('document')
        );
        
        if (similarBucket) {
          console.log(`Found similar bucket: ${similarBucket.name}`);
        }
      }
      
      return false;
    }
    
    console.log(`Bucket '${bucketName}' exists:`, data);
    return true;
  } catch (error) {
    console.error(`Error checking bucket '${bucketName}':`, error);
    
    // Try to list all buckets as a fallback
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets?.map(b => b.name));
    } catch (listError) {
      console.error('Error listing buckets:', listError);
    }
    
    return false;
  }
};

// List all available storage buckets - useful for debugging
export const listAllBuckets = async (): Promise<string[]> => {
  try {
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
