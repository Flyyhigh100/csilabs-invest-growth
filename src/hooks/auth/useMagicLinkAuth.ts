
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
      const { data, error } = await supabase.functions.invoke('verify-magic-link', {
        body: { token }
      });

      if (error) throw error;

      if (data?.session) {
        // The session will be handled by the auth state change listener
        toast.success('Successfully signed in!');
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
