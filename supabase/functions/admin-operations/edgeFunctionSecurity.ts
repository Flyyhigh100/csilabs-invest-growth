
/**
 * Security utilities for edge functions - copied for edge function use
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
 */
class EdgeFunctionRateLimit {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  isAllowed(options: RateLimitOptions): boolean {
    const { maxRequests, windowMs, identifier } = options;
    const now = Date.now();
    const requestInfo = this.requests.get(identifier);

    if (!requestInfo || now > requestInfo.resetTime) {
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
}

export const rateLimiter = new EdgeFunctionRateLimit();

export const validateEdgeFunctionInput = (input: any, maxSize: number = 1024 * 1024): any => {
  const inputString = JSON.stringify(input);
  if (inputString.length > maxSize) {
    throw new Error('Request payload too large');
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = value
          .replace(/[<>'"]/g, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim()
          .substring(0, 10000);
      } else if (typeof value === 'number' && isFinite(value)) {
        sanitized[key] = value;
      } else if (typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.slice(0, 100);
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
 * Now only logs sensitive write operations to reduce noise
 */
export const createAuditLog = async (
  supabaseClient: any,
  data: AuditLogData
): Promise<void> => {
  try {
    // Only audit sensitive write operations, not read operations
    const sensitiveOperations = [
      'approveKyc',
      'rejectKyc',
      'requestKycClarification',
      'processKyc',
      'updateTransactionStatus',
      'markTokensSent',
      'cleanupPendingTransactions',
      'resendKycNotification',
      'markDataAsTest'
    ];
    
    // Skip audit logging for read operations to reduce noise
    if (!sensitiveOperations.some(op => data.operation.includes(op))) {
      console.log(`Skipping audit log for read operation: ${data.operation}`);
      return;
    }
    
    const auditEntry = {
      user_id: data.userId,
      type: 'audit_log', // Changed from 'admin_audit' to 'audit_log'
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
    } else {
      console.log(`Audit log created for sensitive operation: ${data.operation}`);
    }
  } catch (error) {
    console.error('Exception creating audit log:', error);
  }
};

export const sanitizeErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred';

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

  const containsSensitiveInfo = sensitivePatterns.some(pattern => 
    pattern.test(message)
  );

  if (containsSensitiveInfo) {
    return 'Operation failed due to security restrictions';
  }

  return message
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '[UUID]')
    .substring(0, 200);
};

export const extractClientInfo = (request: Request) => {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  };
};
