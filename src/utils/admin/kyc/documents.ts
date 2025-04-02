
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Retrieves a publicly accessible URL for a KYC document
 * 
 * @param documentPath The storage path of the document
 * @returns A URL string or a Promise that resolves to a URL string
 */
export const getKycDocumentUrl = async (documentPath: string): Promise<string> => {
  try {
    if (!documentPath) {
      throw new Error('Document path is required');
    }
    
    console.log(`Getting KYC document URL for path: ${documentPath}`);
    
    // Handle URLs that are already public
    if (documentPath.startsWith('http')) {
      console.log('Document path is already a URL:', documentPath);
      return documentPath;
    }

    // Extract bucket and file path from the document path
    // The format could be either "bucket_name/path/to/file" or just "path/to/file"
    let bucket = 'kyc-documents'; // Default bucket
    let filePath = documentPath;
    
    if (documentPath.includes('/')) {
      const firstSlashIndex = documentPath.indexOf('/');
      const possibleBucket = documentPath.substring(0, firstSlashIndex);
      
      // Check if the first segment is a valid bucket
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketNames = buckets?.map(b => b.name) || [];
      
      if (bucketNames.includes(possibleBucket)) {
        bucket = possibleBucket;
        filePath = documentPath.substring(firstSlashIndex + 1);
      }
    }
    
    console.log(`Resolved to bucket: "${bucket}", file path: "${filePath}"`);

    // Get a signed URL for the document with a 30-minute expiry
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 30);

    if (error) {
      console.error('Error getting document URL:', error);
      
      // Check if it's because the file doesn't exist
      if (error.message.includes('Not Found') || error.message.includes('does not exist')) {
        throw new Error(`File not found: ${bucket}/${filePath}`);
      }
      
      // If there's an error with the signed URL, try getting a public URL as fallback
      console.log('Trying to get public URL as fallback...');
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      if (publicUrlData?.publicUrl) {
        console.log('Using public URL as fallback:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;
      }
      
      throw error;
    }
    
    console.log('Successfully generated signed URL:', data?.signedUrl);
    return data?.signedUrl || '';
  } catch (error) {
    console.error('Error in getKycDocumentUrl:', error);
    
    // Return original path as fallback in case of error
    if (documentPath && documentPath.startsWith('http')) {
      return documentPath;
    }
    
    throw error;
  }
};

// Simple validation of image URL
export const verifyImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Check if URL has a valid protocol
    if (!url.startsWith('http')) {
      console.warn('Invalid image URL protocol:', url);
      return null;
    }
    
    return url;
  } catch (error) {
    console.error('Error verifying image URL:', error);
    return null;
  }
};

/**
 * Tests if a document exists and can be accessed
 */
export const testDocumentAccess = async (documentPath: string): Promise<boolean> => {
  try {
    if (!documentPath) return false;
    
    // Handle URLs that are already public
    if (documentPath.startsWith('http')) {
      try {
        const response = await fetch(documentPath, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        console.error('Error testing direct URL access:', error);
        return false;
      }
    }

    // Extract bucket and file path
    let bucket = 'kyc-documents'; // Default bucket
    let filePath = documentPath;
    
    if (documentPath.includes('/')) {
      const firstSlashIndex = documentPath.indexOf('/');
      const possibleBucket = documentPath.substring(0, firstSlashIndex);
      
      // Check if the first segment is a valid bucket
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketNames = buckets?.map(b => b.name) || [];
      
      if (bucketNames.includes(possibleBucket)) {
        bucket = possibleBucket;
        filePath = documentPath.substring(firstSlashIndex + 1);
      }
    }
    
    // Try to download the file to test access (we only need metadata)
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath, { transform: { width: 10, height: 10 } }); // Tiny transform to minimize data transfer
    
    if (error) {
      console.error(`File access test failed for ${bucket}/${filePath}:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error testing document access:', error);
    return false;
  }
};

/**
 * Lists objects in a bucket for debugging purposes
 */
export const listBucketContents = async (bucketName: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list();
    
    if (error) {
      console.error(`Error listing contents of bucket ${bucketName}:`, error);
      return [];
    }
    
    return data?.map(item => item.name) || [];
  } catch (error) {
    console.error(`Error listing bucket ${bucketName}:`, error);
    return [];
  }
};
