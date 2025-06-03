
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMagicLinkAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMagicLink = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-magic-link', {
        body: { email }
      });

      if (error) throw error;

      toast.success('Magic link sent! Check your email to sign in.');
    } catch (error: any) {
      console.error('Error sending magic link:', error);
      toast.error(error.message || 'Failed to send magic link');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMagicLink = async (token: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Verifying magic link token:', token.substring(0, 20) + '...');
      
      const { data, error } = await supabase.functions.invoke('verify-magic-link', {
        body: { token }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Magic link verification response:', data);

      if (data?.success) {
        // If we got session tokens, set them in Supabase
        if (data.access_token && data.refresh_token) {
          console.log('Setting session tokens...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          });

          if (sessionError) {
            console.error('Error setting session:', sessionError);
            throw sessionError;
          }

          console.log('Session set successfully');
        } else if (data.authUrl) {
          // Fallback case - redirect to auth URL
          console.log('Redirecting to auth URL...');
          window.location.href = data.authUrl;
          return;
        }

        toast.success('Successfully signed in!');
      } else {
        throw new Error(data?.error || 'Magic link verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying magic link:', error);
      toast.error(error.message || 'Invalid or expired magic link');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMagicLink,
    verifyMagicLink,
    isLoading
  };
};
