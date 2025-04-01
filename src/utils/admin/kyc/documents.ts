import { supabase } from '@/integrations/supabase/client';

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

    // Extract bucket and file path from the document path
    const parts = documentPath.split('/');
    const bucket = parts[0] || 'kyc-documents';
    const filePath = parts.slice(1).join('/');

    // Get a public URL for the document
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 60 * 5); // 5 minutes expiry

    if (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }

    return data?.signedUrl || '';
  } catch (error) {
    console.error('Error in getKycDocumentUrl:', error);
    return '';
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
