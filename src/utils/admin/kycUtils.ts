
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

// Get a signed URL for private storage bucket files, or return the public URL if it's already public
export const getKycDocumentUrl = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  
  try {
    console.log('Processing document URL:', url);
    
    // Check if URL is already a valid Supabase storage URL
    if (url.includes('storage/v1/object/public/')) {
      console.log('URL is already a public storage URL:', url);
      return url;
    }
    
    // Check if URL is a path to a file in storage (might be in kyc_documents bucket instead of documents)
    const bucketPaths = ['kyc/', 'documents/', 'kyc_documents/'];
    let isBucketPath = false;
    let pathMatch = null;
    let bucket = 'documents'; // default bucket
    
    // Try to match against different possible bucket paths
    for (const bucketPath of bucketPaths) {
      if (url.includes(`/${bucketPath}`) || url.startsWith(bucketPath)) {
        isBucketPath = true;
        // Extract the path after the bucket identifier
        const regex = new RegExp(`(?:${bucketPath})(.+)`);
        pathMatch = url.match(regex);
        if (bucketPath === 'kyc_documents/') bucket = 'kyc_documents';
        else if (bucketPath === 'kyc/') bucket = 'kyc_documents';
        break;
      }
    }
    
    if (isBucketPath && pathMatch) {
      const path = pathMatch[1];
      console.log(`URL appears to be a storage path in ${bucket} bucket:`, path);
      
      // Get signed URL for private storage (adjust the path based on the bucket)
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 5); // 5 minutes expiry
      
      if (error) {
        console.error('Error creating signed URL:', error);
        return url; // Fall back to original URL if signing fails
      }
      
      console.log('Created signed URL:', data.signedUrl);
      return data.signedUrl;
    }
    
    // If URL is external (http/https), return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // Handle any other format - try to construct a public URL for kyc_documents bucket
    const supabaseUrl = process.env.SUPABASE_URL || 'https://hrhvliqkmetcdphnetxb.supabase.co';
    // Try both possible buckets
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/kyc_documents/${url}`;
    console.log('Constructed public URL:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Error processing document URL:', error);
    return url; // Return original URL if processing fails
  }
};

// Verify if an image URL is valid before attempting to load it
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
