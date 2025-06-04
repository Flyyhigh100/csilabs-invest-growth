
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useInputSanitization } from '@/hooks/security/useInputSanitization';
import { AlertTriangle } from 'lucide-react';

interface SecureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url' | 'number';
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  className?: string;
  allowedDomains?: string[];
  min?: number;
  max?: number;
}

/**
 * Secure input component with built-in sanitization
 */
const SecureInput: React.FC<SecureInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength = 1000,
  required = false,
  className = '',
  allowedDomains,
  min,
  max
}) => {
  const [sanitizationWarning, setSanitizationWarning] = useState<string | null>(null);
  const { sanitizeTextInput, sanitizeEmailInput, sanitizeUrlInput, sanitizeNumericInput } = useInputSanitization();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    let sanitizedValue: string | number | null = rawValue;
    let warning: string | null = null;

    // Apply appropriate sanitization based on type
    switch (type) {
      case 'email':
        sanitizedValue = sanitizeEmailInput(rawValue);
        if (rawValue !== sanitizedValue && rawValue.length > 0) {
          warning = 'Email format corrected';
        }
        break;
      
      case 'url':
        sanitizedValue = sanitizeUrlInput(rawValue, allowedDomains);
        if (rawValue !== sanitizedValue && rawValue.length > 0) {
          warning = 'URL format corrected or blocked for security';
        }
        break;
      
      case 'number':
        sanitizedValue = sanitizeNumericInput(rawValue, min, max);
        if (sanitizedValue === null) {
          sanitizedValue = '';
          if (rawValue.length > 0) {
            warning = 'Invalid number format';
          }
        } else if (rawValue !== String(sanitizedValue)) {
          warning = 'Number value adjusted to valid range';
        }
        break;
      
      default:
        sanitizedValue = sanitizeTextInput(rawValue, maxLength);
        if (rawValue !== sanitizedValue && rawValue.length > 0) {
          warning = 'Input sanitized for security';
        }
        break;
    }

    setSanitizationWarning(warning);
    onChange(String(sanitizedValue));

    // Clear warning after 3 seconds
    if (warning) {
      setTimeout(() => setSanitizationWarning(null), 3000);
    }
  }, [type, maxLength, allowedDomains, min, max, onChange, sanitizeTextInput, sanitizeEmailInput, sanitizeUrlInput, sanitizeNumericInput]);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        maxLength={type === 'number' ? undefined : maxLength}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
      />
      
      {sanitizationWarning && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {sanitizationWarning}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SecureInput;
