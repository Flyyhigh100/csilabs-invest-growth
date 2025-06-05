
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSessionManagement = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh the session
  const refreshSession = async (): Promise<void> => {
    try {
      console.log("Attempting to refresh auth session...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Error refreshing session:", error);
        throw error;
      }
      
      console.log("Session refreshed successfully");
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error: any) {
      console.error("Session refresh failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    // First set up the auth state listener
    console.log("Setting up auth state listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change:", event);
        
        // Prevent session invalidation during profile updates
        if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
        } else if (event === 'USER_UPDATED' && currentSession) {
          // For user updates, maintain the existing session but update user data
          setUser(currentSession.user);
          if (!session) {
            setSession(currentSession);
          }
        } else if (currentSession && !session) {
          // Only set session if we don't have one already
          setSession(currentSession);
          setUser(currentSession.user);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log("Checking for session data...");
        // Check if there's session information in localStorage from Stripe redirect
        const stripeSessionData = localStorage.getItem('stripe_session_data');
        if (stripeSessionData) {
          try {
            const parsedData = JSON.parse(stripeSessionData);
            console.log("Found Stripe session data:", parsedData);
            
            // Only process if the data isn't too old (30 minutes)
            const expiryTime = 30 * 60 * 1000; // 30 minutes in milliseconds
            if (Date.now() - parsedData.timestamp < expiryTime) {
              console.log("Session data is recent, attempting to refresh session...");
              
              // Try to refresh the session
              try {
                await refreshSession();
                console.log("Session refreshed after Stripe redirect");
                
                // If we're on the transaction page with a success parameter, show a success toast
                if (window.location.pathname.includes('/transactions') && 
                    window.location.search.includes('success=true')) {
                  toast.success("Payment completed successfully!");
                }
              } catch (refreshError) {
                console.error("Failed to refresh session after Stripe redirect:", refreshError);
                toast.error("Session expired", { 
                  description: "Please sign in again to view your transaction." 
                });
              }
            } else {
              console.log("Session data expired, removing...");
            }
            
            // Clear the stored session data regardless of whether it was used
            localStorage.removeItem('stripe_session_data');
          } catch (parseError) {
            console.error("Error parsing Stripe session data:", parseError);
            localStorage.removeItem('stripe_session_data');
          }
        }
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Current session check:", currentSession ? "Session exists" : "No session");
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (error) {
        console.error("Error getting auth session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    loading,
    refreshSession
  };
};
