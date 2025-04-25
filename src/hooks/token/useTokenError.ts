
import { useEffect } from 'react';

export const useTokenError = (errors: (Error | null)[]) => {
  useEffect(() => {
    errors.forEach(error => {
      if (error) console.error('Token data error:', error);
    });
  }, [errors]);

  return {
    hasError: errors.some(error => error !== null),
    errorMessage: errors.find(error => error)?.message || 'Error loading token data'
  };
};
