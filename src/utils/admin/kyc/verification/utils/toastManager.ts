
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
  duration = 15000
): void => {
  // First dismiss any existing toast with the same ID
  toast.dismiss(id);
  
  // Then show the new toast
  toast.loading(message, { 
    id, 
    duration,
    // Prevent multiple loading toasts for the same operation
    onAutoClose: (t) => {
      console.log(`Loading toast ${id} timed out after ${duration}ms`);
    }
  });
};

/**
 * Show a success toast
 */
export const showSuccessToast = (
  message: string,
  duration = 5000
): void => {
  toast.success(message, { duration });
};

/**
 * Show an error toast
 */
export const showErrorToast = (
  message: string,
  duration = 8000
): void => {
  toast.error(message, { duration });
};

/**
 * Dismiss specific toast by ID
 */
export const dismissToast = (id: string): void => {
  toast.dismiss(id);
};
