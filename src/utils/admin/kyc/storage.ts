
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
      
      // If the specific error is not found, try listing all buckets to see if it appears there
      // This is a fallback as sometimes getBucket fails with permissions but the bucket exists
      if (error.message?.includes('does not exist') || error.message?.includes('not found')) {
        const allBuckets = await listAllBuckets();
        const exists = allBuckets.includes(bucketName);
        console.log(`Fallback check for bucket '${bucketName}' result:`, exists);
        return exists;
      }
      
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

/**
 * Create a bucket if it doesn't exist
 */
export const createBucketIfNotExists = async (bucketName: string): Promise<boolean> => {
  try {
    // First check if bucket already exists
    const exists = await checkBucketExists(bucketName);
    if (exists) {
      console.log(`Bucket '${bucketName}' already exists, no need to create it`);
      return true;
    }
    
    console.log(`Creating bucket '${bucketName}'...`);
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (error) {
      console.error(`Error creating bucket ${bucketName}:`, error);
      
      // Try with edge function as fallback
      try {
        console.log("Attempting to create bucket with edge function...");
        const { data: authData } = await supabase.auth.getSession();
        const token = authData.session?.access_token;
        
        if (!token) {
          console.error("No authentication token available");
          return false;
        }
        
        const response = await fetch("https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/create-storage-bucket", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bucketName,
            isPublic: true,
            fileSizeLimit: 10485760 // 10MB
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error("Edge function error:", result);
          return false;
        }
        
        return result.success || result.bucketExists;
      } catch (edgeFuncError) {
        console.error("Failed to create bucket with edge function:", edgeFuncError);
        return false;
      }
    }
    
    console.log(`Successfully created bucket '${bucketName}'`);
    return true;
  } catch (error) {
    console.error(`Exception creating bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * Create bucket with edge function (admin-only)
 */
export const createBucketWithEdgeFunction = async (bucketName: string): Promise<boolean> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    const token = authData.session?.access_token;
    
    if (!token) {
      console.error("No authentication token available");
      return false;
    }
    
    const response = await fetch("https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/create-storage-bucket", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        bucketName,
        isPublic: true,
        fileSizeLimit: 10485760 // 10MB
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      console.error("Edge function error:", result);
      return false;
    }
    
    return result.success || result.bucketExists;
  } catch (error) {
    console.error("Failed to create bucket with edge function:", error);
    return false;
  }
};
