
import React, { useCallback } from 'react';
import { useInputSanitization } from '@/hooks/security/useInputSanitization';
import { toast } from 'sonner';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (sanitizedData: Record<string, any>) => void | Promise<void>;
  className?: string;
}

/**
 * Secure form wrapper that automatically sanitizes all form data before submission
 */
const SecureForm: React.FC<SecureFormProps> = ({ children, onSubmit, className = '' }) => {
  const { sanitizeForm } = useInputSanitization();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(e.currentTarget);
      const rawData: Record<string, any> = {};
      
      // Convert FormData to plain object
      formData.forEach((value, key) => {
        if (rawData[key]) {
          // Handle multiple values for the same key
          if (Array.isArray(rawData[key])) {
            rawData[key].push(value);
          } else {
            rawData[key] = [rawData[key], value];
          }
        } else {
          rawData[key] = value;
        }
      });

      // Sanitize the form data
      const sanitizedData = sanitizeForm(rawData);
      
      // Check if any data was removed during sanitization
      const originalKeys = Object.keys(rawData);
      const sanitizedKeys = Object.keys(sanitizedData);
      
      if (originalKeys.length !== sanitizedKeys.length) {
        toast.warning('Some form data was sanitized for security');
      }

      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Form submission failed');
    }
  }, [onSubmit, sanitizeForm]);

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};

export default SecureForm;
