
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthCheck = (
  setIsAuthenticated: (isAuth: boolean) => void
) => {
  const checkAuthentication = useCallback(async (): Promise<boolean> => {
    try {
      // Check if the user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log("No active session found");
        setIsAuthenticated(false);
        return false;
      }
      
      // Check if the user is an admin
      const { data, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error("Error checking admin status:", error);
        setIsAuthenticated(false);
        return false;
      }
      
      console.log("Admin check result:", data);
      setIsAuthenticated(!!data);
      return !!data;
    } catch (error) {
      console.error("Authentication check error:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, [setIsAuthenticated]);

  return checkAuthentication;
};
