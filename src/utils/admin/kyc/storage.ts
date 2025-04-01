
import { supabase } from '@/integrations/supabase/client';

// Primary bucket name for KYC documents
export const KYC_DOCUMENTS_BUCKET = 'kyc-documents';

// Initialize all required buckets for the application
export const initializeRequiredBuckets = async (): Promise<boolean> => {
  try {
    console.log('Initializing required storage buckets...');
    
    // Create an array of required buckets
    const requiredBuckets = [
      KYC_DOCUMENTS_BUCKET,
      'documents'  // Fallback/legacy bucket
    ];
    
    // Check existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    console.log('Existing buckets:', existingBuckets?.map(b => b.name) || []);
    
    // Create missing buckets
    let allSuccess = true;
    for (const bucketName of requiredBuckets) {
      const bucketExists = existingBuckets?.some(b => b.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createError } = await supabase.storage.createBucket(
          bucketName,
          { public: true }
        );
        
        if (createError) {
          console.error(`Failed to create bucket ${bucketName}:`, createError);
          allSuccess = false;
        } else {
          console.log(`Successfully created bucket: ${bucketName}`);
        }
      } else {
        console.log(`Bucket already exists: ${bucketName}`);
      }
    }
    
    return allSuccess;
  } catch (error) {
    console.error('Error initializing buckets:', error);
    return false;
  }
};

// Check if a bucket exists in Supabase storage
export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    const { data, error } = await supabase.storage.getBucket(bucketName);
    
    if (error) {
      console.error(`Bucket '${bucketName}' not found:`, error);
      return false;
    }
    
    console.log(`Bucket '${bucketName}' exists:`, data);
    return true;
  } catch (error) {
    console.error(`Error checking bucket '${bucketName}':`, error);
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

// Ensure bucket exists before upload
export const ensureBucketExists = async (bucketName: string): Promise<boolean> => {
  const exists = await checkBucketExists(bucketName);
  if (!exists) {
    try {
      console.log(`Bucket '${bucketName}' does not exist, creating it...`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
      });
      
      if (error) {
        console.error(`Error creating bucket '${bucketName}':`, error);
        return false;
      }
      
      console.log(`Successfully created bucket '${bucketName}'`);
      return true;
    } catch (error) {
      console.error(`Exception creating bucket '${bucketName}':`, error);
      return false;
    }
  }
  
  return true;
};
