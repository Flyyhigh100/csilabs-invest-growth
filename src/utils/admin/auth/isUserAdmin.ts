
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * @deprecated Use useStandardizedAdminVerification hook instead
 * This function is kept for backward compatibility only
 */
export const isUserAdmin = async (): Promise<boolean> => {
  console.warn('⚠️ isUserAdmin() is deprecated. Use useStandardizedAdminVerification hook instead.');
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session || !session.user) {
      console.log('No active session or session error');
      return false;
    }
    
    // Use the standardized is_admin() database function
    const { data: rpcResult, error: rpcError } = await supabase.rpc('is_admin');
    
    if (rpcError) {
      console.error('Error checking admin status with is_admin() function:', rpcError);
      return false;
    }
    
    return !!rpcResult;
  } catch (error) {
    console.error('Error in isUserAdmin function:', error);
    return false;
  }
};

/**
 * @deprecated This function is deprecated and should not be used
 */
export const addSelfAsAdmin = async (): Promise<boolean> => {
  console.warn('⚠️ addSelfAsAdmin() is deprecated and disabled for security reasons.');
  toast.error('This operation is no longer supported. Please contact an administrator.');
  return false;
};
