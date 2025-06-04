
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText, sanitizeNumeric } from './inputSanitization';
import { toast } from 'sonner';

interface AdminOperationOptions {
  csrfToken?: string;
  requireConfirmation?: boolean;
  auditLog?: boolean;
}

/**
 * Securely executes admin operations with proper validation and logging
 */
export const executeAdminOperation = async (
  operation: string,
  data: any,
  options: AdminOperationOptions = {}
): Promise<any> => {
  try {
    // Verify admin status
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    
    if (adminError || !isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Validate CSRF token if provided
    if (options.csrfToken) {
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!storedToken || storedToken !== options.csrfToken) {
        throw new Error('Invalid CSRF token');
      }
    }

    // Sanitize input data
    const sanitizedData = sanitizeAdminInput(data);

    // Log the operation attempt
    if (options.auditLog !== false) {
      await logAdminOperation(operation, sanitizedData);
    }

    // Execute the operation
    const { data: result, error } = await supabase.functions.invoke('admin-operations', {
      body: {
        operation,
        data: sanitizedData,
        timestamp: new Date().toISOString(),
        csrfToken: options.csrfToken
      }
    });

    if (error) {
      throw error;
    }

    return result;
  } catch (error) {
    console.error('Admin operation failed:', error);
    toast.error(`Admin operation failed: ${error.message}`);
    throw error;
  }
};

/**
 * Sanitizes admin input data
 */
const sanitizeAdminInput = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'number') {
      sanitized[key] = sanitizeNumeric(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAdminInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Logs admin operations for audit purposes
 */
const logAdminOperation = async (operation: string, data: any): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user');
    }

    // Create audit log entry
    await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'admin_audit',
        title: `Admin Operation: ${operation}`,
        message: `Admin operation executed: ${operation}`,
        read: false
      });

    console.log(`Admin operation logged: ${operation} by ${user.email}`);
  } catch (error) {
    console.error('Failed to log admin operation:', error);
    // Don't throw here to avoid blocking the main operation
  }
};

/**
 * Enhanced transaction status update with additional safeguards
 */
export const updateTransactionStatus = async (
  transactionId: string,
  status: string,
  csrfToken: string
): Promise<any> => {
  // Additional validation for transaction status updates
  const allowedStatuses = ['pending', 'confirmed', 'completed', 'failed', 'cancelled'];
  
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  if (!transactionId || typeof transactionId !== 'string') {
    throw new Error('Invalid transaction ID');
  }

  return executeAdminOperation('update-transaction-status', {
    transaction_id: transactionId,
    status,
    updated_by: 'admin'
  }, {
    csrfToken,
    requireConfirmation: status === 'completed',
    auditLog: true
  });
};
