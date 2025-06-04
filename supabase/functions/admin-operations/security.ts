
import { rateLimiter, validateEdgeFunctionInput, createAuditLog, sanitizeErrorMessage, extractClientInfo } from './edgeFunctionSecurity.ts';

/**
 * Security middleware for admin operations
 */
export class AdminOperationsSecurity {
  private static readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_REQUESTS_PER_WINDOW = 100; // Per user
  private static readonly MAX_PAYLOAD_SIZE = 2 * 1024 * 1024; // 2MB

  static async validateRequest(req: Request, user: any): Promise<{
    isValid: boolean;
    error?: string;
    clientInfo?: any;
  }> {
    try {
      const clientInfo = extractClientInfo(req);

      // Rate limiting check
      const rateLimitKey = `admin_ops:${user.id}:${clientInfo.ipAddress}`;
      const isRateLimited = !rateLimiter.isAllowed({
        maxRequests: this.MAX_REQUESTS_PER_WINDOW,
        windowMs: this.RATE_LIMIT_WINDOW,
        identifier: rateLimitKey
      });

      if (isRateLimited) {
        return {
          isValid: false,
          error: 'Rate limit exceeded. Please try again later.',
          clientInfo
        };
      }

      return {
        isValid: true,
        clientInfo
      };
    } catch (error) {
      console.error('Security validation error:', error);
      return {
        isValid: false,
        error: 'Security validation failed',
      };
    }
  }

  static validateAndSanitizeInput(input: any): any {
    return validateEdgeFunctionInput(input, this.MAX_PAYLOAD_SIZE);
  }

  static async logOperation(
    supabaseClient: any,
    operation: string,
    user: any,
    data: any,
    clientInfo: any
  ): Promise<void> {
    await createAuditLog(supabaseClient, {
      operation,
      userId: user.id,
      userEmail: user.email,
      data: {
        operation,
        timestamp: new Date().toISOString(),
        dataKeys: data ? Object.keys(data) : []
      },
      ipAddress: clientInfo?.ipAddress,
      userAgent: clientInfo?.userAgent
    });
  }

  static handleError(error: any): string {
    return sanitizeErrorMessage(error);
  }
}
