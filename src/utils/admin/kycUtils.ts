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
    
    // Extract the path information - supporting multiple formats
    let bucketName = 'documents'; // default bucket
    let path = url;
    
    // If URL contains a full path with bucket info, extract it
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
    } else if (url.startsWith('kyc/')) {
      bucketName = 'documents';
      // Keep the 'kyc/' prefix for the path in the documents bucket
    }
    
    console.log(`Using bucket: ${bucketName}, path: ${path}`);
    
    // Try to get a signed URL
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, 60 * 10); // 10 minutes expiry
    
    if (error) {
      console.error('Error creating signed URL:', error);
      
      // Fallback 1: Try with alternate bucket if the first attempt failed
      if (bucketName === 'documents') {
        console.log('Trying alternate bucket: kyc_documents');
        const altResult = await supabase.storage
          .from('kyc_documents')
          .createSignedUrl(path, 60 * 10);
          
        if (!altResult.error) {
          console.log('Successfully created signed URL from alternate bucket');
          return altResult.data.signedUrl;
        }
      } else if (bucketName === 'kyc_documents') {
        console.log('Trying alternate bucket: documents');
        const altResult = await supabase.storage
          .from('documents')
          .createSignedUrl(path, 60 * 10);
          
        if (!altResult.error) {
          console.log('Successfully created signed URL from alternate bucket');
          return altResult.data.signedUrl;
        }
      }
      
      // Fallback 2: Try to construct a public URL
      const supabaseUrl = process.env.SUPABASE_URL || 'https://hrhvliqkmetcdphnetxb.supabase.co';
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${path}`;
      console.log('Constructed public URL as fallback:', publicUrl);
      return publicUrl;
    }
    
    console.log('Created signed URL:', data.signedUrl);
    return data.signedUrl;
    
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
