
/**
 * Utility for managing KYC verification toasts
 */
import { toast } from 'sonner';

/**
 * Clear all active toasts
 */
export const clearAllToasts = (): void => {
  toast.dismiss();
};

/**
 * Show a loading toast with a reasonable timeout
 */
export const showLoadingToast = (
  message: string,
  id = 'kyc-processing-toast',
  duration = 10000
): void => {
  clearAllToasts();
  toast.loading(message, { id, duration });
};

/**
 * Dismiss specific toast by ID
 */
export const dismissToast = (id: string): void => {
  toast.dismiss(id);
};
