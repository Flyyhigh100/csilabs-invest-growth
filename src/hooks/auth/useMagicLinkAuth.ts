import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMagicLinkAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMagicLink = async (email: string): Promise<void> => {
    console.log('📧 NATIVE SUPABASE - Sending magic link to:', email);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-magic-link', {
        body: { email }
      });

      console.log('📧 send-magic-link response:', { data, error });

      if (error) {
        console.error('❌ Error from send-magic-link function:', error);
        throw error;
      }

      console.log('✅ Magic link sent successfully:', data);
      toast.success('Magic link sent! Check your email to sign in.', {
        description: 'Click the link from Supabase to authenticate. Check spam folder if needed.'
      });
    } catch (error: any) {
      console.error('❌ Error sending magic link:', error);
      toast.error(error.message || 'Failed to send magic link');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMagicLink,
    isLoading
  };
};
