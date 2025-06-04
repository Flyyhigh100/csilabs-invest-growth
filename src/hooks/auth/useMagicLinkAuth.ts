
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMagicLinkAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMagicLink = async (email: string): Promise<void> => {
    console.log('📧 Sending magic link to:', email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-magic-link', {
        body: { email }
      });

      if (error) {
        console.error('❌ Error from send-magic-link function:', error);
        throw error;
      }

      console.log('✅ Magic link sent successfully:', data);
      toast.success('Magic link sent! Check your email to sign in.');
    } catch (error: any) {
      console.error('❌ Error sending magic link:', error);
      toast.error(error.message || 'Failed to send magic link');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMagicLink = async (token: string): Promise<void> => {
    console.log('🔐 Starting magic link verification for token:', token.substring(0, 20) + '...');
    setIsLoading(true);
    
    try {
      console.log('📡 Calling verify-magic-link function...');
      
      const { data, error } = await supabase.functions.invoke('verify-magic-link', {
        body: { token }
      });

      console.log('📡 verify-magic-link response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Handle specific error cases
        if (error.message && error.message.includes('Invalid or expired magic link')) {
          throw new Error('This magic link has expired or has already been used. Please request a new one.');
        } else if (error.message && error.message.includes('not found')) {
          throw new Error('Magic link not found. It may have expired or been used already.');
        } else {
          throw new Error(error.message || 'Magic link verification failed');
        }
      }

      if (!data) {
        console.error('❌ No data returned from verification function');
        throw new Error('No response from verification service');
      }

      if (!data.success) {
        console.error('❌ Verification failed:', data.error);
        
        // Handle specific backend error messages
        if (data.error && data.error.includes('expired')) {
          throw new Error('This magic link has expired. Please request a new one.');
        } else if (data.error && data.error.includes('already used')) {
          throw new Error('This magic link has already been used. Please request a new one.');
        } else {
          throw new Error(data.error || 'Magic link verification failed');
        }
      }

      console.log('✅ Magic link verification response received:', data);

      // If we got session tokens, set them in Supabase
      if (data.access_token && data.refresh_token) {
        console.log('🔑 Setting session tokens...');
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });

        if (sessionError) {
          console.error('❌ Error setting session:', sessionError);
          throw new Error('Failed to establish session: ' + sessionError.message);
        }

        console.log('✅ Session set successfully');
      } else if (data.authUrl) {
        // Fallback case - redirect to auth URL
        console.log('🔄 Redirecting to auth URL:', data.authUrl);
        window.location.href = data.authUrl;
        return;
      } else {
        console.error('❌ No session tokens or auth URL provided');
        throw new Error('Invalid response from verification service');
      }

      toast.success('Successfully signed in!');
    } catch (error: any) {
      console.error('❌ Error verifying magic link:', error);
      const errorMessage = error.message || 'Invalid or expired magic link';
      toast.error(errorMessage);
      throw new Error(errorMessage);
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
