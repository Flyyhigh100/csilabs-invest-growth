
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminVerificationState {
  isAdmin: boolean | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Standardized admin verification hook that uses the is_admin() database function
 * This is the ONLY way admin status should be checked throughout the application
 */
export const useStandardizedAdminVerification = () => {
  const [state, setState] = useState<AdminVerificationState>({
    isAdmin: null,
    isLoading: true,
    error: null
  });

  const checkAdminStatus = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        setState({ isAdmin: false, isLoading: false, error: null });
        return;
      }

      // Use the standardized is_admin() database function
      const { data: isAdminResult, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError) {
        console.error('Error checking admin status:', adminError);
        setState({
          isAdmin: false,
          isLoading: false,
          error: 'Failed to verify admin permissions'
        });
        return;
      }

      setState({
        isAdmin: !!isAdminResult,
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Exception in admin verification:', error);
      setState({
        isAdmin: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const refreshAdminStatus = () => {
    checkAdminStatus();
  };

  // Check admin status on mount and when session changes
  useEffect(() => {
    checkAdminStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...state,
    refreshAdminStatus
  };
};
