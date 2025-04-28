
// Debounce timers for different notification types
const notificationTimers: { [key: string]: number } = {};

// Notification cooldown periods (in ms)
export const NOTIFICATION_COOLDOWNS = {
  payment: 5000,    // 5s for payment notifications
  status: 2000,     // 2s for status updates
  info: 1000        // 1s for general info
};

// Track last notification data to prevent duplicates
const lastNotifications: { [key: string]: { message: string; timestamp: number } } = {};

export function shouldShowNotification(type: string, message: string): boolean {
  const now = Date.now();
  const lastNotification = lastNotifications[type];
  const cooldown = NOTIFICATION_COOLDOWNS[type as keyof typeof NOTIFICATION_COOLDOWNS] || 2000;

  // Prevent duplicate notifications within cooldown period
  if (lastNotification && 
      lastNotification.message === message && 
      now - lastNotification.timestamp < cooldown) {
    return false;
  }

  // Update last notification data
  lastNotifications[type] = { message, timestamp: now };
  return true;
}

// Clear notification timer if it exists
export function clearNotificationTimer(type: string) {
  if (notificationTimers[type]) {
    clearTimeout(notificationTimers[type]);
    delete notificationTimers[type];
  }
}
