
import { supabase } from '@/integrations/supabase/client';

// Get a public URL for Supabase storage files
export const getKycDocumentUrl = async (url: string | null): Promise<string | null> => {
  if (!url || url.trim() === '') return null;
  
  try {
    console.log('Processing document URL:', url);
    
    // If the URL is already a complete URL (contains http or https), return it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('URL is already a complete URL:', url);
      return url;
    }
    
    // Extract bucket and path information
    let bucketName = 'documents';
    let path = url;
    
    // Handle different URL formats
    if (url.includes('/kyc_documents/')) {
      bucketName = 'kyc_documents';
      path = url.split('/kyc_documents/')[1];
    } else if (url.includes('/documents/')) {
      bucketName = 'documents';
      path = url.split('/documents/')[1];
    } else if (url.includes('/kyc/')) {
      bucketName = 'documents';
      path = url;
    } else if (url.startsWith('kyc_documents/')) {
      bucketName = 'kyc_documents';
      path = url.replace('kyc_documents/', '');
    } else if (url.startsWith('documents/')) {
      bucketName = 'documents';
      path = url.replace('documents/', '');
    }
    
    console.log(`Generating public URL - Bucket: ${bucketName}, Path: ${path}`);
    
    // Use Supabase Storage getPublicUrl method with error handling
    try {
      // Ensure the path has no leading slash
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      
      console.log(`Getting public URL for bucket: ${bucketName}, path: ${cleanPath}`);
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(cleanPath);
      
      if (data && data.publicUrl) {
        console.log('Generated public URL:', data.publicUrl);
        return data.publicUrl;
      } else {
        console.error('Failed to generate public URL - no publicUrl in response');
        
        // Try alternate bucket as fallback
        const alternateBucket = bucketName === 'documents' ? 'kyc_documents' : 'documents';
        console.log(`Trying alternate bucket: ${alternateBucket}`);
        
        const { data: altData } = supabase.storage
          .from(alternateBucket)
          .getPublicUrl(cleanPath);
          
        if (altData && altData.publicUrl) {
          console.log('Generated public URL from alternate bucket:', altData.publicUrl);
          return altData.publicUrl;
        }
        
        // If all else fails, return the original URL that was passed in
        console.log('Returning original URL as fallback:', url);
        return url;
      }
    } catch (storageError) {
      console.error('Storage error when generating URL:', storageError);
      
      // Return original URL as fallback
      console.log('Returning original URL due to storage error:', url);
      return url;
    }
  } catch (error) {
    console.error('Error processing document URL:', error);
    return url; // Return original URL if processing fails
  }
};

// Simple validation of image URL
export const verifyImageUrl = (url: string | null): string | null => {
  if (!url || url.trim() === '') return null;
  
  try {
    // More permissive check - accept URLs that have http/https or storage path patterns
    if (url.startsWith('http') || url.includes('storage/v1/object/public') || 
        url.includes('/kyc_documents/') || url.includes('/documents/') ||
        url.startsWith('kyc_documents/') || url.startsWith('documents/')) {
      return url;
    }
    
    console.warn('Possibly invalid image URL format:', url);
    // Still return the URL even if format is unexpected - let the component handle display fallbacks
    return url;
  } catch (error) {
    console.error('Error verifying image URL:', error);
    return null;
  }
};

// Check if an image exists and can be loaded
export const checkImageExists = async (url: string | null): Promise<boolean> => {
  if (!url) return false;
  
  try {
    if (url.startsWith('http') || url.startsWith('https')) {
      // For security reasons, we can't directly check remote images with fetch due to CORS
      // So we'll just return true and let the image element handle the loading failure
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking if image exists:', error);
    return false;
  }
};
