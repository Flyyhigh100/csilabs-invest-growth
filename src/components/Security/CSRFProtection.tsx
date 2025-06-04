
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSecurity } from '@/contexts/SecurityContext';

interface CSRFContextType {
  getCSRFToken: () => string | null;
  validateCSRFToken: (token: string) => boolean;
  withCSRF: <T extends Record<string, any>>(data: T) => T & { csrf_token: string };
}

const CSRFContext = createContext<CSRFContextType | undefined>(undefined);

export const CSRFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { csrfToken, generateCsrfToken, validateCsrfToken } = useSecurity();

  useEffect(() => {
    // Generate initial CSRF token if not present
    if (!csrfToken) {
      generateCsrfToken();
    }
  }, [csrfToken, generateCsrfToken]);

  const getCSRFToken = () => csrfToken;

  const withCSRF = <T extends Record<string, any>>(data: T) => {
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }
    return {
      ...data,
      csrf_token: csrfToken
    };
  };

  const value = {
    getCSRFToken,
    validateCSRFToken: validateCsrfToken,
    withCSRF
  };

  return (
    <CSRFContext.Provider value={value}>
      {children}
    </CSRFContext.Provider>
  );
};

export const useCSRF = () => {
  const context = useContext(CSRFContext);
  if (!context) {
    throw new Error('useCSRF must be used within CSRFProvider');
  }
  return context;
};
