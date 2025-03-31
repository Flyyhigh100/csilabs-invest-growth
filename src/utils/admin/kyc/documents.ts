
import { supabase } from '@/integrations/supabase/client';

// Get a public URL for Supabase storage files
export const getKycDocumentUrl = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  
  try {
    console.log('Processing document URL:', url);
    
    // If the URL is already in the correct format (contains storage/v1/object/public), return it
    if (url.includes('storage/v1/object/public/')) {
      console.log('URL is already in the public format:', url);
      return url;
    }
    
    // Extract bucket and path information
    let bucketName = 'kyc_documents'; // Default bucket
    let path = url;
    
    // Handle different URL formats
    if (url.includes('/kyc_documents/')) {
      bucketName = 'kyc_documents';
      path = url.split('/kyc_documents/')[1];
    } else if (url.includes('/documents/')) {
      bucketName = 'documents';
      path = url.split('/documents/')[1];
    } else if (url.startsWith('kyc_documents/')) {
      path = url.replace('kyc_documents/', '');
    } else if (url.startsWith('documents/')) {
      bucketName = 'documents';
      path = url.replace('documents/', '');
    }
    
    console.log(`Generating public URL - Bucket: ${bucketName}, Path: ${path}`);
    
    // Use Supabase Storage getPublicUrl method
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(path);
    
    if (data && data.publicUrl) {
      console.log('Generated public URL:', data.publicUrl);
      return data.publicUrl;
    } else {
      console.error('Failed to generate public URL');
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
