
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  operation: string;
  tableName?: string;
  recordId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}

/**
 * Client-side audit logging utility
 */
export class AuditLogger {
  private static instance: AuditLogger;
  private queue: AuditLogEntry[] = [];
  private isProcessing = false;

  private constructor() {
    // Start processing queue periodically
    setInterval(() => this.processQueue(), 5000);
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Log an audit entry
   */
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Add timestamp and user context
      const enrichedEntry = {
        ...entry,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Add to queue for batch processing
      this.queue.push(enrichedEntry);

      // For critical operations, process immediately
      if (this.isCriticalOperation(entry.operation)) {
        await this.processQueue();
      }
    } catch (error) {
      console.error('Audit logging failed:', error);
    }
  }

  /**
   * Log admin operations specifically
   */
  async logAdminOperation(operation: string, data?: any): Promise<void> {
    await this.log({
      operation: `admin_${operation}`,
      metadata: {
        isAdminOperation: true,
        data: data ? Object.keys(data) : undefined
      }
    });
  }

  /**
   * Log security events
   */
  async logSecurityEvent(event: string, details?: any): Promise<void> {
    await this.log({
      operation: `security_${event}`,
      metadata: {
        isSecurityEvent: true,
        details
      }
    });
  }

  /**
   * Process the audit log queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const entries = this.queue.splice(0, 10); // Process up to 10 entries at a time

      for (const entry of entries) {
        await this.sendAuditLog(entry);
      }
    } catch (error) {
      console.error('Audit queue processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send audit log to database
   */
  private async sendAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('Cannot log audit entry: no authenticated user');
        return;
      }

      // Create notification entry for audit trail
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'audit_log',
          title: `Audit: ${entry.operation}`,
          message: this.formatAuditMessage(entry),
          read: false
        });

    } catch (error) {
      console.error('Failed to send audit log:', error);
      // Re-queue the entry for retry
      this.queue.unshift(entry);
    }
  }

  /**
   * Format audit message for notification
   */
  private formatAuditMessage(entry: AuditLogEntry): string {
    const parts = [
      `Operation: ${entry.operation}`,
      entry.tableName ? `Table: ${entry.tableName}` : null,
      entry.recordId ? `Record: ${entry.recordId}` : null,
      entry.metadata ? `Metadata: ${JSON.stringify(entry.metadata).substring(0, 100)}` : null
    ].filter(Boolean);

    return parts.join(' | ');
  }

  /**
   * Check if operation is critical and needs immediate processing
   */
  private isCriticalOperation(operation: string): boolean {
    const criticalOps = [
      'admin_login',
      'admin_delete',
      'security_breach',
      'security_violation',
      'kyc_approval',
      'transaction_approval'
    ];

    return criticalOps.some(op => operation.includes(op));
  }

  /**
   * Get audit statistics
   */
  getQueueStatus(): { queued: number; isProcessing: boolean } {
    return {
      queued: this.queue.length,
      isProcessing: this.isProcessing
    };
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();
