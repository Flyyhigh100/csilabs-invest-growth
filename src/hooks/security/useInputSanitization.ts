
import { useCallback } from 'react';
import { 
  sanitizeText, 
  sanitizeEmail, 
  sanitizeNumeric, 
  sanitizeUrl, 
  sanitizeFormData 
} from '@/utils/security/inputSanitization';

/**
 * Hook for applying input sanitization in React components
 */
export const useInputSanitization = () => {
  const sanitizeTextInput = useCallback((value: string, maxLength?: number) => {
    return sanitizeText(value, maxLength);
  }, []);

  const sanitizeEmailInput = useCallback((email: string) => {
    return sanitizeEmail(email);
  }, []);

  const sanitizeNumericInput = useCallback((value: any, min?: number, max?: number) => {
    return sanitizeNumeric(value, min, max);
  }, []);

  const sanitizeUrlInput = useCallback((url: string, allowedDomains?: string[]) => {
    return sanitizeUrl(url, allowedDomains);
  }, []);

  const sanitizeForm = useCallback((formData: Record<string, any>) => {
    return sanitizeFormData(formData);
  }, []);

  return {
    sanitizeTextInput,
    sanitizeEmailInput,
    sanitizeNumericInput,
    sanitizeUrlInput,
    sanitizeForm
  };
};
