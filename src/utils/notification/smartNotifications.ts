
import { toast } from 'sonner';
import { shouldShowNotification, clearNotificationTimer } from './throttle';

type NotificationPriority = 'high' | 'medium' | 'low';

interface NotificationOptions {
  type: string;
  priority?: NotificationPriority;
  duration?: number;
  id?: string;
}

const PRIORITY_DURATIONS = {
  high: 10000,    // 10s for high priority
  medium: 6000,   // 6s for medium priority
  low: 4000       // 4s for low priority
};

const activeToastIds = new Set<string>();

/**
 * Smart notification system that handles throttling and prioritization
 */
export function showSmartNotification(
  title: string,
  message: string,
  options: NotificationOptions
) {
  const { type, priority = 'medium', duration, id } = options;
  const toastId = id || `${type}-${Date.now()}`;

  // Check if we should show this notification
  if (!shouldShowNotification(type, message)) {
    console.log(`Skipping notification due to throttling: ${title} - ${message}`);
    return;
  }

  // Clear any existing timer for this notification type
  clearNotificationTimer(type);
  
  // Clear any existing toast with the same ID
  if (activeToastIds.has(toastId)) {
    toast.dismiss(toastId);
    activeToastIds.delete(toastId);
  }

  // Determine toast duration based on priority
  const toastDuration = duration || PRIORITY_DURATIONS[priority];
  
  // Track that we're showing this toast
  activeToastIds.add(toastId);

  // Show toast based on priority
  switch (priority) {
    case 'high':
      toast.error(title, { 
        id: toastId,
        description: message, 
        duration: toastDuration,
        onDismiss: () => activeToastIds.delete(toastId)
      });
      break;
    case 'medium':
      toast.info(title, { 
        id: toastId,
        description: message, 
        duration: toastDuration,
        onDismiss: () => activeToastIds.delete(toastId)
      });
      break;
    case 'low':
      toast(title, { 
        id: toastId,
        description: message, 
        duration: toastDuration,
        onDismiss: () => activeToastIds.delete(toastId)
      });
      break;
  }
  
  // Automatically remove from tracking after duration
  setTimeout(() => {
    activeToastIds.delete(toastId);
  }, toastDuration + 500);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
  toast.dismiss();
  activeToastIds.clear();
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(id: string) {
  toast.dismiss(id);
  activeToastIds.delete(id);
}
