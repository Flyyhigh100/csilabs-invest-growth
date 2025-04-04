
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Process KYC verification - approve, reject, or request clarification
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  try {
    console.log(`🔍 Processing KYC verification ${kycId} with status: ${status}, message: ${message || 'none'}`);
    
    if (!kycId) {
      toast.error('KYC ID is required');
      return false;
    }
    
    // Add debug toast to track the start of the process with a unique ID
    const toastId = `process-kyc-${kycId}-${Date.now()}`;
    toast.loading(`Processing KYC verification (${status})...`, {
      id: toastId,
      duration: 15000 // Longer duration to ensure it stays visible during processing
    });
    
    // Verify admin permissions with improved error handling
    try {
      console.log('Checking admin permissions with improved verification...');
      
      // Trigger the admin permission listener if it exists
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('checking');
      }
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        console.error('❌ Failed to get current user:', userError);
        
        // Update the admin permission listener
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('failed');
        }
        
        toast.dismiss(toastId);
        toast.error('Authentication error: Could not verify current user');
        return false;
      }
      
      const userEmail = userData.user.email;
      const userId = userData.user.id;
      
      if (!userEmail) {
        console.error('❌ User has no email address');
        
        // Update the admin permission listener
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('failed');
        }
        
        toast.dismiss(toastId);
        toast.error('User email not found');
        return false;
      }
      
      console.log(`Verifying admin status for user: ${userId} (${userEmail})`);
      
      // First try is_admin RPC function (most reliable method)
      const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
      
      if (!rpcError && isAdminRpc === true) {
        console.log('✅ Admin permissions verified via is_admin() function');
        
        // Update the admin permission listener
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('verified');
        }
      } else {
        console.log('Admin check via is_admin() failed or returned false:', rpcError || 'Not admin');
        
        // Try direct query as backup method
        const { data: adminCheck, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .or(`id.eq.${userId},email.ilike.${userEmail.toLowerCase()}`)
          .maybeSingle();
          
        if (adminError) {
          console.error('❌ Admin permission check error:', adminError);
          
          // Update the admin permission listener
          if (typeof (window as any).kycAdminPermissionListener === 'function') {
            (window as any).kycAdminPermissionListener('failed');
          }
          
          toast.dismiss(toastId);
          toast.error('Error checking admin permissions');
          return false;
        }
        
        if (!adminCheck) {
          console.error('❌ User is not an admin:', userEmail);
          
          // Update the admin permission listener
          if (typeof (window as any).kycAdminPermissionListener === 'function') {
            (window as any).kycAdminPermissionListener('failed');
          }
          
          toast.dismiss(toastId);
          toast.error('You do not have admin permissions to process KYC verifications');
          return false;
        }
        
        console.log('✅ Admin permissions verified via database query:', adminCheck);
        
        // Update the admin permission listener
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('verified');
        }
      }
    } catch (adminErr) {
      console.error('❌ Exception during admin permission check:', adminErr);
      
      // Update the admin permission listener
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('failed');
      }
      
      toast.dismiss(toastId);
      toast.error(`Failed to verify admin permissions: ${(adminErr as Error).message}`);
      return false;
    }
    
    // Fetch the current KYC record to verify it exists
    const { data: currentKyc, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('id', kycId)
      .single();
      
    if (fetchError) {
      console.error('❌ Error fetching KYC record before update:', fetchError);
      toast.dismiss(toastId);
      toast.error(`Failed to find KYC record: ${fetchError.message}`);
      return false;
    }
    
    if (!currentKyc) {
      console.error(`❌ KYC record with ID ${kycId} not found`);
      toast.dismiss(toastId);
      toast.error(`KYC record not found`);
      return false;
    }
    
    console.log('📄 Current KYC record before update:', currentKyc);
    
    // Enhanced error handling and detailed logging
    console.log(`📤 Calling admin-operations edge function with action: processKyc, status: ${status}`);
    
    // Prepare payload for better debugging
    const payload = {
      action: 'processKyc',
      data: {
        kycId,
        status,
        rejectionReason: message
      }
    };
    
    console.log(`Request payload:`, payload);
    
    // Implement retry logic
    const maxRetries = 3;
    let retryCount = 0;
    let success = false;
    let lastError = null;
    let response = null;
    
    while (retryCount < maxRetries && !success) {
      try {
        console.log(`🔄 Attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Trigger the retry listener if it exists
        if (typeof (window as any).kycRetryListener === 'function') {
          (window as any).kycRetryListener(retryCount + 1, maxRetries);
        }
        
        // Add additional context for debugging
        console.log(`Current time before request: ${new Date().toISOString()}`);
        
        response = await supabase.functions.invoke('admin-operations', {
          body: payload
        });
        
        console.log('📥 Full response from admin-operations function:', JSON.stringify(response, null, 2));
        
        if (response.error) {
          console.error('❌ Error from admin-operations function:', response.error);
          lastError = response.error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
          }
          continue;
        }
        
        const data = response.data;
        
        // Check if the response contains an error object
        if (data && data.error) {
          console.error('❌ Error from admin-operations response:', data.error);
          lastError = new Error(data.error.message || 'Unknown error from server');
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // Handle case where response has no data
        if (!data) {
          console.error('❌ No data returned from admin-operations function');
          lastError = new Error('No response data received');
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // Handle case where response has error in data
        if (data.error) {
          console.error('❌ Error in admin-operations response data:', data.error);
          lastError = new Error(data.error.message || 'Error from server');
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        if (!data.kyc) {
          console.error('❌ Invalid response from admin-operations function:', data);
          lastError = new Error('Invalid response from server');
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // Double-check the status from the response
        const returnedStatus = data.kyc.status;
        if (returnedStatus !== status) {
          console.error(`❌ Status mismatch! Requested: ${status}, Received: ${returnedStatus}`);
          lastError = new Error(`Status mismatch: Requested ${status}, Received ${returnedStatus}`);
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // If we reach here, the operation was successful
        success = true;
        console.log(`✅ Successfully processed KYC verification with status: ${status}`, data);
        
      } catch (invokeError) {
        console.error('❌ Exception during edge function invocation:', invokeError);
        lastError = invokeError;
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // After all retries, check if we were successful
    if (!success) {
      console.error('❌ All retry attempts failed:', lastError);
      toast.dismiss(toastId);
      toast.error(`Failed to update KYC verification after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`, {
        duration: 5000
      });
      return false;
    }
    
    // Trigger a refresh of KYC data immediately
    try {
      console.log('🔄 Triggering immediate fetch of KYC data after update');
      const { data: refreshData, error: refreshError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('id', kycId)
        .single();
        
      if (refreshData) {
        console.log('✅ Verified KYC update with fresh data:', refreshData);
        console.log(`✅ Current KYC status is now: ${refreshData.status}`);
      } else if (refreshError) {
        console.error('❌ Error verifying KYC update:', refreshError);
      }
    } catch (refreshErr) {
      console.error('❌ Exception during verification refresh:', refreshErr);
    }
    
    // Clear the retry listener
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, maxRetries);
    }
    
    // Dismiss the loading toast and show success
    toast.dismiss(toastId);
    toast.success(`KYC verification ${status === 'approved' ? 'approved' : 
      status === 'rejected' ? 'rejected' : 'updated'} successfully.`, {
      duration: 5000
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error processing KYC verification:', error);
    toast.error(`An error occurred while processing KYC verification: ${(error as Error).message}`, {
      duration: 5000
    });
    return false;
  }
};

// Request clarification from user
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  if (!message || message.trim() === '') {
    toast.error('Please provide a clarification message');
    return false;
  }
  
  console.log('🔍 Requesting clarification with message:', message);
  
  const toastId = `clarify-kyc-${kycId}-${Date.now()}`;
  toast.loading(`Sending clarification request...`, {
    id: toastId,
    duration: 10000
  });
  
  try {
    // Use direct call to process with needs_clarification status
    console.log(`📤 Sending clarification request to Supabase for KYC ID: ${kycId}`);
    
    // Implement retry logic for clarification requests
    const maxRetries = 3;
    let retryCount = 0;
    let success = false;
    let lastError = null;
    
    while (retryCount < maxRetries && !success) {
      try {
        console.log(`🔄 Clarification attempt ${retryCount + 1} of ${maxRetries}`);
        
        // Trigger the retry listener if it exists
        if (typeof (window as any).kycRetryListener === 'function') {
          (window as any).kycRetryListener(retryCount + 1, maxRetries);
        }
        
        const payload = {
          action: 'requestKycClarification',
          data: {
            kycId,
            message: message.trim()
          }
        };
        
        console.log('Request payload for clarification:', payload);
        
        const response = await supabase.functions.invoke('admin-operations', {
          body: payload
        });
        
        console.log('📥 Full response from clarification request:', JSON.stringify(response, null, 2));
        
        if (response.error) {
          console.error('❌ Error from clarification request:', response.error);
          lastError = response.error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying clarification in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        const data = response.data;
        
        // Check if the response contains an error object
        if (data && data.error) {
          console.error('❌ Error from server in clarification response:', data.error);
          lastError = new Error(data.error.message || 'Unknown error from server');
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        if (!data) {
          console.error('❌ No data returned from clarification request');
          lastError = new Error('No response data received');
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying clarification in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        if (data.error) {
          console.error('❌ Error in clarification response data:', data.error);
          lastError = data.error;
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying clarification in 1 second... (attempt ${retryCount + 1})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          continue;
        }
        
        // If we reach here, the operation was successful
        success = true;
        console.log('✅ Clarification request successful:', data);
      }
      catch (invokeError) {
        console.error('❌ Exception during clarification request:', invokeError);
        lastError = invokeError;
        retryCount++;
        
        if (retryCount < maxRetries) {
          console.log(`Retrying clarification in 1 second... (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    // Clear the retry listener
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, maxRetries);
    }
    
    // After all retries, check if we were successful
    if (!success) {
      console.error('❌ All clarification retry attempts failed:', lastError);
      toast.dismiss(toastId);
      toast.error(`Failed to send clarification request after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`, {
        duration: 5000
      });
      return false;
    }
    
    // Verify the update went through
    try {
      console.log('🔄 Verifying clarification update with fresh data fetch');
      const { data: refreshData, error: refreshError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('id', kycId)
        .single();
        
      if (refreshData) {
        console.log('✅ Verified clarification update with fresh data:', refreshData);
        console.log(`✅ Current KYC status is now: ${refreshData.status}`);
        console.log(`✅ Clarification message is: ${refreshData.clarification_message}`);
        
        // Fix: Use type assertion to allow string comparison
        // This is the fix for the TypeScript error
        if (refreshData.status as string !== 'needs_clarification') {
          console.error(`⚠️ Warning: Expected status 'needs_clarification' but found '${refreshData.status}'`);
        }
      } else if (refreshError) {
        console.error('❌ Error verifying clarification update:', refreshError);
      }
    } catch (refreshErr) {
      console.error('❌ Exception during verification refresh:', refreshErr);
    }
    
    toast.dismiss(toastId);
    toast.success('Clarification request sent successfully', { duration: 5000 });
    return true;
  } catch (error) {
    console.error('❌ Error sending clarification request:', error);
    toast.dismiss(toastId);
    toast.error(`Failed to send clarification request: ${(error as Error).message}`, { 
      duration: 5000 
    });
    return false;
  }
};
