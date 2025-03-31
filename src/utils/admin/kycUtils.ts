
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Process KYC verification - approve, reject, or request clarification
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  try {
    console.log(`Processing KYC verification ${kycId} with status: ${status}`);
    
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    
    if (status === 'rejected' && message) {
      updateData.rejection_reason = message;
    } else if (status === 'approved') {
      updateData.rejection_reason = null;
      updateData.clarification_message = null;
    }
    
    const { error, data } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select();
    
    if (error) {
      console.error('Error updating KYC verification:', error);
      toast.error('Failed to update KYC verification');
      return false;
    }
    
    console.log(`Successfully processed KYC verification with status: ${status}`, data);
    toast.success(`KYC verification ${status}`);
    return true;
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    toast.error('An error occurred while processing KYC verification');
    return false;
  }
};

// Request clarification from user
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  try {
    console.log(`Requesting clarification for KYC ${kycId}: ${message}`);
    
    const updateData = {
      clarification_message: message,
      reviewed_at: new Date().toISOString(),
    };
    
    const { error, data } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select();
    
    if (error) {
      console.error('Error requesting clarification:', error);
      toast.error('Failed to send clarification request');
      return false;
    }
    
    console.log('Clarification request sent successfully:', data);
    toast.success('Clarification request sent');
    return true;
  } catch (error) {
    console.error('Error requesting clarification:', error);
    toast.error('An error occurred while requesting clarification');
    return false;
  }
};

// Get a public URL for Supabase storage files
export const getKycDocumentUrl = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  
  try {
    console.log('Processing document URL:', url);
    
    // If the URL is already in the correct format, return it
    if (url.includes('storage/v1/object/public/')) {
      console.log('URL is already in the public format:', url);
      return url;
    }
    
    // Get the Supabase project URL from environment or use default
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hrhvliqkmetcdphnetxb.supabase.co';
    
    // Extract bucket and path information
    let bucketName = 'kyc_documents'; // Default to kyc_documents bucket
    let path = url;
    
    // Handle different URL formats
    if (url.includes('/kyc_documents/')) {
      bucketName = 'kyc_documents';
      path = url.split('/kyc_documents/')[1];
    } else if (url.includes('/documents/')) {
      bucketName = 'documents';
      path = url.split('/documents/')[1];
    } else if (url.startsWith('kyc_documents/')) {
      bucketName = 'kyc_documents';
      path = url.replace('kyc_documents/', '');
    } else if (url.startsWith('documents/')) {
      bucketName = 'documents';
      path = url.replace('documents/', '');
    }
    
    console.log(`Constructed path info - Bucket: ${bucketName}, Path: ${path}`);
    
    // Create the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
    console.log('Constructed public URL:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('Error processing document URL:', error);
    return url; // Return original URL if processing fails
  }
};

// Verify if a URL is valid before attempting to load it
export const verifyImageUrl = (url: string | null): string | null => {
  if (!url) return null;
  
  try {
    // Decode the URL to handle any URL encoding issues
    const decodedUrl = decodeURIComponent(url);
    
    // Check if URL has a valid protocol
    if (!decodedUrl.startsWith('http')) {
      console.warn('Invalid image URL protocol:', decodedUrl);
      return null;
    }
    
    console.log('Verified image URL:', decodedUrl);
    return decodedUrl;
  } catch (error) {
    console.error('Error verifying image URL:', error);
    return null;
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
