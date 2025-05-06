
import { supabase } from '@/integrations/supabase/client';

/**
 * Verify that the current user has admin permissions
 */
export const verifyAdminPermissions = async (): Promise<boolean> => {
  try {
    console.log('Verifying admin permissions...');
    
    // Check localStorage to see if we've already verified this session
    const sessionVerified = localStorage.getItem('admin_verified');
    const sessionTimestamp = localStorage.getItem('admin_verified_timestamp');
    
    // If we've verified in the last hour, return cached result
    if (sessionVerified && sessionTimestamp) {
      const timestamp = parseInt(sessionTimestamp, 10);
      const now = Date.now();
      // If verified within the last hour (3600000 ms)
      if (now - timestamp < 3600000) {
        console.log('Using cached admin verification result:', sessionVerified === 'true');
        return sessionVerified === 'true';
      }
    }
    
    // Use the is_admin function from Supabase
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error verifying admin permissions:', error);
      return false;
    }
    
    console.log('Admin permission verification result:', data);
    
    // Cache the result in localStorage
    localStorage.setItem('admin_verified', data ? 'true' : 'false');
    localStorage.setItem('admin_verified_timestamp', Date.now().toString());
    
    return !!data;
  } catch (error) {
    console.error('Exception in verifyAdminPermissions:', error);
    return false;
  }
};
