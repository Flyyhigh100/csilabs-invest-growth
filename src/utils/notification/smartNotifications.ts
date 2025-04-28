
import { toast } from 'sonner';
import { shouldShowNotification, clearNotificationTimer } from './throttle';

type NotificationPriority = 'high' | 'medium' | 'low';

interface NotificationOptions {
  type: string;
  priority?: NotificationPriority;
  duration?: number;
}

const PRIORITY_DURATIONS = {
  high: 8000,
  medium: 5000,
  low: 3000
};

export function showSmartNotification(
  title: string,
  message: string,
  options: NotificationOptions
) {
  const { type, priority = 'medium', duration } = options;

  // Check if we should show this notification
  if (!shouldShowNotification(type, message)) {
    return;
  }

  // Clear any existing timer for this notification type
  clearNotificationTimer(type);

  // Determine toast duration based on priority
  const toastDuration = duration || PRIORITY_DURATIONS[priority];

  // Show toast based on priority
  switch (priority) {
    case 'high':
      toast.error(title, { description: message, duration: toastDuration });
      break;
    case 'medium':
      toast.info(title, { description: message, duration: toastDuration });
      break;
    case 'low':
      toast(title, { description: message, duration: toastDuration });
      break;
  }
}
