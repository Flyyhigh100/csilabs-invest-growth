
import { toast } from 'sonner';

/**
 * Utility functions for managing toasts consistently
 */

// Show a loading toast with custom ID and timeout
export const showLoadingToast = (message: string, id: string = 'loading-toast', timeout: number = 0) => {
  toast.loading(message, { id, duration: timeout || undefined });
};

// Dismiss a specific toast by ID
export const dismissToast = (id: string) => {
  toast.dismiss(id);
};

// Show a success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, { duration: 5000 });
};

// Show an error toast
export const showErrorToast = (message: string) => {
  toast.error(message, { duration: 5000 });
};

// Show an info toast
export const showInfoToast = (message: string) => {
  toast.info(message, { duration: 5000 });
};

// Clear all existing toasts
export const clearAllToasts = () => {
  toast.dismiss();
};
