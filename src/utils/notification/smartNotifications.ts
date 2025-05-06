
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
    console.log(`🔇 Skipping notification due to throttling: ${title} - ${message}`);
    return;
  }

  // Clear any existing timer for this notification type
  clearNotificationTimer(type);
  
  // Clear any existing toast with the same ID
  if (activeToastIds.has(toastId)) {
    toast.dismiss(toastId);
    activeToastIds.delete(toastId);
    console.log(`🔄 Replacing existing toast with ID: ${toastId}`);
  }

  // Determine toast duration based on priority
  const toastDuration = duration || PRIORITY_DURATIONS[priority];
  
  // Track that we're showing this toast
  activeToastIds.add(toastId);

  // Show toast based on priority
  console.log(`📢 Showing toast: "${title}" - "${message}" (priority: ${priority}, duration: ${toastDuration}ms)`);
  
  switch (priority) {
    case 'high':
      toast.error(title, { 
        id: toastId,
        description: message, 
        duration: toastDuration,
        onDismiss: () => {
          console.log(`🧹 Dismissed toast: ${toastId}`);
          activeToastIds.delete(toastId);
        }
      });
      break;
    case 'medium':
      toast.info(title, { 
        id: toastId,
        description: message, 
        duration: toastDuration,
        onDismiss: () => {
          console.log(`🧹 Dismissed toast: ${toastId}`);
          activeToastIds.delete(toastId);
        }
      });
      break;
    case 'low':
      toast(title, { 
        id: toastId,
        description: message, 
        duration: toastDuration,
        onDismiss: () => {
          console.log(`🧹 Dismissed toast: ${toastId}`);
          activeToastIds.delete(toastId);
        }
      });
      break;
  }
  
  // Automatically remove from tracking after duration
  setTimeout(() => {
    if (activeToastIds.has(toastId)) {
      console.log(`⏰ Auto-removing toast from tracking: ${toastId}`);
      activeToastIds.delete(toastId);
    }
  }, toastDuration + 1000);
}

/**
 * Dismiss all active toasts
 */
export function dismissAllToasts() {
  console.log(`🧹 Dismissing all ${activeToastIds.size} active toasts`);
  toast.dismiss();
  activeToastIds.clear();
}

/**
 * Dismiss a specific toast by ID
 */
export function dismissToast(id: string) {
  console.log(`🧹 Dismissing specific toast: ${id}`);
  toast.dismiss(id);
  activeToastIds.delete(id);
}
