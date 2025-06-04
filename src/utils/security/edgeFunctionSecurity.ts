
/**
 * Security utilities for edge functions
 */

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

interface AuditLogData {
  operation: string;
  userId: string;
  userEmail?: string;
  data?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Simple in-memory rate limiter for edge functions
 * In production, this should be replaced with Redis or similar
 */
class EdgeFunctionRateLimit {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  isAllowed(options: RateLimitOptions): boolean {
    const { maxRequests, windowMs, identifier } = options;
    const now = Date.now();
    const requestInfo = this.requests.get(identifier);

    if (!requestInfo || now > requestInfo.resetTime) {
      // First request or window expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return true;
    }

    if (requestInfo.count >= maxRequests) {
      return false;
    }

    requestInfo.count++;
    return true;
  }

  getRemainingRequests(options: RateLimitOptions): number {
    const requestInfo = this.requests.get(options.identifier);
    if (!requestInfo || Date.now() > requestInfo.resetTime) {
      return options.maxRequests;
    }
    return Math.max(0, options.maxRequests - requestInfo.count);
  }
}

export const rateLimiter = new EdgeFunctionRateLimit();

/**
 * Validates and sanitizes edge function input
 */
export const validateEdgeFunctionInput = (input: any, maxSize: number = 1024 * 1024): any => {
  // Check input size
  const inputString = JSON.stringify(input);
  if (inputString.length > maxSize) {
    throw new Error('Request payload too large');
  }

  // Basic sanitization
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        // Remove potentially dangerous characters
        sanitized[key] = value
          .replace(/[<>'"]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim()
          .substring(0, 10000); // Limit string length
      } else if (typeof value === 'number' && isFinite(value)) {
        sanitized[key] = value;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 100); // Limit array size
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = validateEdgeFunctionInput(value, maxSize / 10);
      }
    }
    return sanitized;
  }

  return input;
};

/**
 * Creates audit log entry for admin operations
 */
export const createAuditLog = async (
  supabaseClient: any,
  data: AuditLogData
): Promise<void> => {
  try {
    const auditEntry = {
      user_id: data.userId,
      type: 'admin_audit',
      title: `Admin Operation: ${data.operation}`,
      message: `Operation: ${data.operation} | User: ${data.userEmail || data.userId} | IP: ${data.ipAddress || 'unknown'}`,
      read: false,
      created_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('notifications')
      .insert(auditEntry);

    if (error) {
      console.error('Failed to create audit log:', error);
    }
  } catch (error) {
    console.error('Exception creating audit log:', error);
  }
};

/**
 * Sanitizes error messages to prevent information leakage
 */
export const sanitizeErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

  // Common error patterns that should be sanitized
  const sensitivePatterns = [
    /password/gi,
    /token/gi,
    /key/gi,
    /secret/gi,
    /auth/gi,
    /database/gi,
    /connection/gi,
    /internal/gi
  ];

  let message = error.message || String(error);

  // Check if message contains sensitive information
  const containsSensitiveInfo = sensitivePatterns.some(pattern => 
    pattern.test(message)
  );

  if (containsSensitiveInfo) {
    return 'Operation failed due to security restrictions';
  }

  // Generic error sanitization
  return message
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]') // Remove IP addresses
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '[UUID]') // Remove UUIDs
    .substring(0, 200); // Limit message length
};

/**
 * Extracts client information from request headers
 */
export const extractClientInfo = (request: Request) => {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  };
};
