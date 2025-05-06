
import { supabase } from '@/integrations/supabase/client';

/**
 * Verify that the current user has admin permissions
 */
export const verifyAdminPermissions = async (): Promise<boolean> => {
  try {
    console.log('Verifying admin permissions...');
    
    // Use the is_admin function from Supabase
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Error verifying admin permissions:', error);
      return false;
    }
    
    console.log('Admin permission verification result:', data);
    return !!data;
  } catch (error) {
    console.error('Exception in verifyAdminPermissions:', error);
    return false;
  }
};
