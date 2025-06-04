
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMagicLinkAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMagicLink = async (email: string): Promise<void> => {
    console.log('📧 Sending magic link to:', email);
    console.log('🌐 Current origin:', window.location.origin);
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
        description: 'If you have Hotmail/Outlook, please check your spam folder.'
      });
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
    console.log('🔐 Token length:', token.length);
    console.log('🔐 Browser info:', {
      userAgent: navigator.userAgent,
      origin: window.location.origin,
      url: window.location.href
    });
    
    setIsLoading(true);
    
    try {
      console.log('📡 Calling verify-magic-link function...');
      console.log('📡 Function URL will be: https://hrhvliqkmetcdphnetxb.supabase.co/functions/v1/verify-magic-link');
      
      const { data, error } = await supabase.functions.invoke('verify-magic-link', {
        body: { 
          token,
          type: 'email'
        }
      });

      console.log('📡 verify-magic-link response received:', { 
        hasData: !!data, 
        hasError: !!error,
        data: data ? JSON.stringify(data, null, 2) : null,
        error: error ? JSON.stringify(error, null, 2) : null
      });

      if (error) {
        console.error('❌ Edge function error:', error);
        
        // Handle specific error cases with user-friendly messages
        if (error.message && error.message.includes('expired')) {
          throw new Error('This magic link has expired. Please request a new one.');
        } else if (error.message && error.message.includes('invalid')) {
          throw new Error('Invalid magic link. Please request a new one.');
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
        } else if (data.error && data.error.includes('invalid')) {
          throw new Error('Invalid magic link. Please request a new one.');
        } else {
          throw new Error(data.error || 'Magic link verification failed');
        }
      }

      console.log('✅ Magic link verification response received:', data);

      // Set the session using the tokens from our verification
      if (data.access_token && data.refresh_token) {
        console.log('🔑 Setting session tokens...');
        console.log('🔑 Access token length:', data.access_token.length);
        console.log('🔑 Refresh token length:', data.refresh_token.length);
        
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        });

        if (sessionError) {
          console.error('❌ Error setting session:', sessionError);
          throw new Error('Failed to establish session: ' + sessionError.message);
        }

        console.log('✅ Session set successfully');
        
        // Check if session was actually set
        const { data: sessionCheck } = await supabase.auth.getSession();
        console.log('🔍 Session check after setting:', {
          hasSession: !!sessionCheck.session,
          hasUser: !!sessionCheck.session?.user,
          userId: sessionCheck.session?.user?.id,
          userEmail: sessionCheck.session?.user?.email
        });
        
        toast.success('Successfully signed in!');
      } else {
        console.error('❌ No session tokens provided');
        throw new Error('Invalid response from verification service - no session tokens');
      }

    } catch (error: any) {
      console.error('❌ Error verifying magic link:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Provide user-friendly error messages
      let errorMessage = error.message || 'Magic link verification failed';
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      // Handle timeout errors
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      }
      
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
