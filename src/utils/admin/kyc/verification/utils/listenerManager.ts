
/**
 * Utility for managing admin verification listeners
 */

type RetryListener = (attempt: number | null, maxRetries: number | null) => void;
type AdminPermissionListener = (status: 'verified' | 'failed' | 'checking') => void;

/**
 * Set up event listeners for KYC verification process
 */
export const setupVerificationListeners = (): void => {
  // Clean up any existing listeners first
  cleanupVerificationListeners();
};

/**
 * Clean up all verification listeners
 */
export const cleanupVerificationListeners = (): void => {
  delete (window as any).kycRetryListener;
  delete (window as any).kycAdminPermissionListener;
};

/**
 * Notify retry attempt
 */
export const notifyRetryAttempt = (currentRetry: number, maxRetries: number): void => {
  if (typeof (window as any).kycRetryListener === 'function') {
    (window as any).kycRetryListener(currentRetry, maxRetries);
  }
};

/**
 * Notify admin permission status
 */
export const notifyAdminPermissionStatus = (status: 'verified' | 'failed' | 'checking'): void => {
  if (typeof (window as any).kycAdminPermissionListener === 'function') {
    (window as any).kycAdminPermissionListener(status);
  }
};
