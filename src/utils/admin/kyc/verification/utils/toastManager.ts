
import { toast } from 'sonner';

/**
 * Clear all existing toasts
 */
export const clearAllToasts = () => {
  toast.dismiss();
};

/**
 * Show a loading toast with optional timeout
 */
export const showLoadingToast = (message: string, id?: string, timeout = 0) => {
  return toast.loading(message, {
    id,
    duration: timeout || undefined,
  });
};

/**
 * Dismiss a specific toast by ID
 */
export const dismissToast = (id: string) => {
  toast.dismiss(id);
};

/**
 * Show a success toast
 */
export const showSuccessToast = (message: string, id?: string) => {
  return toast.success(message, { id });
};

/**
 * Show an error toast
 */
export const showErrorToast = (message: string, id?: string) => {
  return toast.error(message, { id });
};
