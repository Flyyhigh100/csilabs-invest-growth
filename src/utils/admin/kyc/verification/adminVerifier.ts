
import { supabase } from '@/integrations/supabase/client';

/**
 * Verify admin permissions with detailed error handling
 */
export const verifyAdminPermissions = async (): Promise<boolean> => {
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
      
      throw new Error('Authentication error: Could not verify current user');
    }
    
    const userEmail = userData.user.email;
    const userId = userData.user.id;
    
    if (!userEmail) {
      console.error('❌ User has no email address');
      
      // Update the admin permission listener
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('failed');
      }
      
      throw new Error('User email not found');
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
      
      return true;
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
        
        throw new Error('Error checking admin permissions');
      }
      
      if (!adminCheck) {
        console.error('❌ User is not an admin:', userEmail);
        
        // Update the admin permission listener
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('failed');
        }
        
        throw new Error('You do not have admin permissions to process KYC verifications');
      }
      
      console.log('✅ Admin permissions verified via database query:', adminCheck);
      
      // Update the admin permission listener
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('verified');
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Error verifying admin permissions:', error);
    throw error;
  }
};
