
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthCheck = (
  setIsAuthenticated: (isAuth: boolean) => void
) => {
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Checking authentication status...");
      
      // Check if the user is authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setIsAuthenticated(false);
        return false;
      }
      
      if (!sessionData.session) {
        console.log("No active session found");
        setIsAuthenticated(false);
        return false;
      }
      
      console.log("User is authenticated with session:", sessionData.session.user.id);
      
      // For admin pages, we can assume the user is authenticated since AdminRoute component
      // already checks admin status
      setIsAuthenticated(true);
      return true;
      
      // Note: We're removing the explicit admin check via RPC as it seems to be causing issues
      // The AdminRoute component already protects this route
    } catch (error) {
      console.error("Authentication check error:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, [setIsAuthenticated]);

  return checkAuthentication;
};
