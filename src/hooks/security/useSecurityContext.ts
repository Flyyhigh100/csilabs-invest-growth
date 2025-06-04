
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityContextType {
  csrfToken: string | null;
  sessionId: string | null;
  securityLevel: 'low' | 'medium' | 'high';
  lastSecurityCheck: Date | null;
}

/**
 * Hook for managing security context and session security
 */
export const useSecurityContext = () => {
  const [securityContext, setSecurityContext] = useState<SecurityContextType>({
    csrfToken: null,
    sessionId: null,
    securityLevel: 'medium',
    lastSecurityCheck: null
  });

  // Generate CSRF token
  const generateCsrfToken = useCallback(() => {
    const token = crypto.randomUUID();
    setSecurityContext(prev => ({ ...prev, csrfToken: token }));
    sessionStorage.setItem('csrf_token', token);
    return token;
  }, []);

  // Validate CSRF token
  const validateCsrfToken = useCallback((token: string) => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token === securityContext.csrfToken;
  }, [securityContext.csrfToken]);

  // Check session security
  const checkSessionSecurity = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session security check failed:', error);
        setSecurityContext(prev => ({ 
          ...prev, 
          securityLevel: 'low',
          lastSecurityCheck: new Date()
        }));
        return false;
      }

      if (!session) {
        setSecurityContext(prev => ({ 
          ...prev, 
          sessionId: null,
          securityLevel: 'low',
          lastSecurityCheck: new Date()
        }));
        return false;
      }

      // Check session age (sessions older than 24 hours are considered less secure)
      const sessionAge = Date.now() - new Date(session.user.created_at).getTime();
      const isOldSession = sessionAge > 24 * 60 * 60 * 1000;

      setSecurityContext(prev => ({
        ...prev,
        sessionId: session.user.id,
        securityLevel: isOldSession ? 'medium' : 'high',
        lastSecurityCheck: new Date()
      }));

      return true;
    } catch (error) {
      console.error('Security context check failed:', error);
      setSecurityContext(prev => ({ 
        ...prev, 
        securityLevel: 'low',
        lastSecurityCheck: new Date()
      }));
      return false;
    }
  }, []);

  // Enhanced security check for sensitive operations
  const performSecurityCheck = useCallback(async (operation: string) => {
    const isSecure = await checkSessionSecurity();
    
    if (!isSecure) {
      toast.error('Security check failed. Please log in again.');
      return false;
    }

    if (securityContext.securityLevel === 'low') {
      toast.warning('Low security level detected. Some features may be restricted.');
    }

    // Log security-sensitive operation
    console.log(`Security check passed for operation: ${operation}`, {
      securityLevel: securityContext.securityLevel,
      timestamp: new Date().toISOString()
    });

    return true;
  }, [securityContext.securityLevel, checkSessionSecurity]);

  // Initialize security context
  useEffect(() => {
    generateCsrfToken();
    checkSessionSecurity();

    // Set up periodic security checks
    const securityInterval = setInterval(checkSessionSecurity, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(securityInterval);
  }, [generateCsrfToken, checkSessionSecurity]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        checkSessionSecurity();
        if (event === 'SIGNED_IN') {
          generateCsrfToken();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSessionSecurity, generateCsrfToken]);

  return {
    ...securityContext,
    generateCsrfToken,
    validateCsrfToken,
    checkSessionSecurity,
    performSecurityCheck
  };
};
