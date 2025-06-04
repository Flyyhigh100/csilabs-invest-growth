
/**
 * Comprehensive input sanitization utilities
 */

// Common XSS patterns to detect and remove
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /onload=/gi,
  /onerror=/gi,
  /onclick=/gi,
  /onmouseover=/gi,
  /onfocus=/gi,
  /onblur=/gi,
  /onchange=/gi,
  /onsubmit=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link/gi,
  /<meta/gi,
  /<style/gi,
];

// SQL injection patterns
const SQL_INJECTION_PATTERNS = [
  /(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT( +INTO)?|MERGE|SELECT|UPDATE|UNION( +ALL)?)\b)/gi,
  /(--|\*\/|\/\*)/g,
  /(\b(AND|OR)\b.*?(=|<|>|\bIN\b|\bLIKE\b))/gi,
  /(\bUNION\b.*?\bSELECT\b)/gi,
  /(\b(WAITFOR|DELAY)\b)/gi,
];

// Command injection patterns
const COMMAND_INJECTION_PATTERNS = [
  /(\||;|&|\$\(|\`)/g,
  /(wget|curl|nc|netcat|telnet|ssh|ftp)/gi,
  /(\.\.\/)|(\.\.\\)/g,
  /(\/etc\/passwd|\/etc\/shadow|\/proc\/)/gi,
];

/**
 * Sanitizes text input by removing dangerous patterns
 */
export const sanitizeText = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim().substring(0, maxLength);

  // Remove XSS patterns
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove SQL injection patterns
  SQL_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Remove command injection patterns
  COMMAND_INJECTION_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  // Encode remaining HTML entities
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  return sanitized;
};

/**
 * Sanitizes email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitized = email.toLowerCase().trim().substring(0, 254);
  
  return emailRegex.test(sanitized) ? sanitized : '';
};

/**
 * Sanitizes numeric input
 */
export const sanitizeNumeric = (input: any, min?: number, max?: number): number | null => {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  const num = parseFloat(String(input));
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return min;
  }

  if (max !== undefined && num > max) {
    return max;
  }

  return num;
};

/**
 * Sanitizes URL input
 */
export const sanitizeUrl = (url: string, allowedDomains?: string[]): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    const parsedUrl = new URL(url);
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }

    // Check allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(domain => 
        parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
      );
      
      if (!isAllowed) {
        return '';
      }
    }

    return parsedUrl.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitizes file paths
 */
export const sanitizeFilePath = (path: string): string => {
  if (!path || typeof path !== 'string') {
    return '';
  }

  // Remove directory traversal attempts
  let sanitized = path.replace(/\.\./g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove leading slashes and backslashes
  sanitized = sanitized.replace(/^[\/\\]+/, '');
  
  // Only allow alphanumeric, dots, dashes, underscores, and forward slashes
  sanitized = sanitized.replace(/[^a-zA-Z0-9.\-_\/]/g, '');
  
  return sanitized.substring(0, 255);
};

/**
 * Validates and sanitizes JSON input
 */
export const sanitizeJson = (input: string, maxSize: number = 10000): any => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  if (input.length > maxSize) {
    throw new Error('JSON input too large');
  }

  try {
    return JSON.parse(input);
  } catch {
    throw new Error('Invalid JSON format');
  }
};

/**
 * Comprehensive form data sanitization
 */
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    const sanitizedKey = sanitizeText(key, 100);
    
    if (!sanitizedKey) continue;

    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeText(value);
    } else if (typeof value === 'number') {
      sanitized[sanitizedKey] = sanitizeNumeric(value);
    } else if (typeof value === 'boolean') {
      sanitized[sanitizedKey] = Boolean(value);
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.slice(0, 100).map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[sanitizedKey] = sanitizeFormData(value);
    }
  }

  return sanitized;
};
