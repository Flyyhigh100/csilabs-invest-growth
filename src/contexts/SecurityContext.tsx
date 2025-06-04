
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  csrfToken: string | null;
  generateCsrfToken: () => string;
  validateCsrfToken: (token: string) => boolean;
  isSecureContext: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isSecureContext, setIsSecureContext] = useState(false);

  // Generate a new CSRF token
  const generateCsrfToken = (): string => {
    const token = crypto.randomUUID();
    setCsrfToken(token);
    
    // Store in session storage for validation
    sessionStorage.setItem('csrf_token', token);
    
    return token;
  };

  // Validate CSRF token
  const validateCsrfToken = (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrf_token');
    return storedToken === token && token === csrfToken;
  };

  // Check if we're in a secure context
  useEffect(() => {
    const checkSecureContext = () => {
      const isHTTPS = window.location.protocol === 'https:';
      const isLocalhost = window.location.hostname === 'localhost';
      setIsSecureContext(isHTTPS || isLocalhost);
    };

    checkSecureContext();
    
    // Generate initial CSRF token
    generateCsrfToken();
  }, []);

  // Regenerate CSRF token on auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        generateCsrfToken();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    csrfToken,
    generateCsrfToken,
    validateCsrfToken,
    isSecureContext
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
