
import { supabase } from '@/integrations/supabase/client';

// Get a public URL for Supabase storage files
export const getKycDocumentUrl = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  
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
      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(path);
      
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
          .getPublicUrl(path);
          
        if (altData && altData.publicUrl) {
          console.log('Generated public URL from alternate bucket:', altData.publicUrl);
          return altData.publicUrl;
        }
        
        return url; // Return original URL as fallback
      }
    } catch (storageError) {
      console.error('Storage error when generating URL:', storageError);
      return url; // Return original URL as fallback
    }
  } catch (error) {
    console.error('Error processing document URL:', error);
    return url; // Return original URL if processing fails
  }
};

// Simple validation of image URL
export const verifyImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Check if URL has a valid protocol or if it's a storage path
    if (!url.startsWith('http') && !url.includes('storage/v1/object/public')) {
      console.warn('Invalid image URL protocol:', url);
      return null;
    }
    
    return url;
  } catch (error) {
    console.error('Error verifying image URL:', error);
    return null;
  }
};
