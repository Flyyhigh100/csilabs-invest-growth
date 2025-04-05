
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthCheck = (
  setIsAuthenticated: (value: boolean) => void
) => {
  return useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const isAuthed = !!data.session;
      setIsAuthenticated(isAuthed);
      console.log("Authentication check:", isAuthed ? "User is authenticated" : "User is not authenticated");
      return isAuthed;
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      return false;
    }
  }, [setIsAuthenticated]);
};
