
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitizes plain text input by escaping HTML entities
 */
export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes email addresses
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Basic email validation and sanitization
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitized = email.trim().toLowerCase();
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
};

/**
 * Sanitizes user input for search queries
 */
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';
  
  // Remove potentially dangerous characters while preserving search functionality
  return query
    .replace(/[<>'"]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .substring(0, 200); // Limit length
};

/**
 * Validates and sanitizes wallet addresses
 */
export const sanitizeWalletAddress = (address: string): string => {
  if (!address) return '';
  
  // Basic wallet address validation (alphanumeric and specific chars only)
  const walletRegex = /^[a-zA-Z0-9]+$/;
  const sanitized = address.trim();
  
  if (!walletRegex.test(sanitized)) {
    throw new Error('Invalid wallet address format');
  }
  
  return sanitized;
};

/**
 * Sanitizes numeric input
 */
export const sanitizeNumeric = (value: string | number): number => {
  if (typeof value === 'number') return value;
  
  const numericValue = parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
  
  if (isNaN(numericValue)) {
    throw new Error('Invalid numeric value');
  }
  
  return numericValue;
};
