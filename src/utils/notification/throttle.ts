
// Debounce timers for different notification types
const notificationTimers: { [key: string]: number } = {};

// Notification cooldown periods (in ms) - extended for less frequent notifications
export const NOTIFICATION_COOLDOWNS = {
  payment: 10000,    // 10s for payment notifications
  status: 5000,      // 5s for status updates
  info: 2000,        // 2s for general info
  admin_access: 86400000, // 24 hours for admin access notifications
  kyc_action: 10000  // 10s for KYC approval/rejection actions
};

// Track notifications with message and type to prevent duplicates
const lastNotifications: { [key: string]: { message: string; timestamp: number; count: number } } = {};

// Maximum number of similar notifications allowed in a short period
const MAX_NOTIFICATIONS_THRESHOLD = 3;
const NOTIFICATION_RESET_THRESHOLD = 30000; // 30 seconds

/**
 * Determines if a notification should be shown based on throttling rules
 */
export function shouldShowNotification(type: string, message: string): boolean {
  const now = Date.now();
  const lastNotification = lastNotifications[type];
  const cooldown = NOTIFICATION_COOLDOWNS[type as keyof typeof NOTIFICATION_COOLDOWNS] || 3000;

  // If we've never shown this type of notification, always show it
  if (!lastNotification) {
    lastNotifications[type] = { message, timestamp: now, count: 1 };
    return true;
  }
  
  // Check if the exact same message was shown recently
  if (lastNotification.message === message) {
    // If it's been shown too many times in a short period, don't show it again
    if (lastNotification.count >= MAX_NOTIFICATIONS_THRESHOLD && 
        now - lastNotification.timestamp < NOTIFICATION_RESET_THRESHOLD) {
      console.log(`Suppressing repeated notification of type ${type}: shown ${lastNotification.count} times already`);
      return false;
    }
    
    // If it's within the cooldown period, don't show it again
    if (now - lastNotification.timestamp < cooldown) {
      console.log(`Throttling notification of type ${type}: within cooldown period`);
      return false;
    }
  }
  
  // Update notification data
  if (lastNotification.message === message && now - lastNotification.timestamp < NOTIFICATION_RESET_THRESHOLD) {
    lastNotifications[type] = { 
      message, 
      timestamp: now, 
      count: lastNotification.count + 1 
    };
  } else {
    lastNotifications[type] = { message, timestamp: now, count: 1 };
  }
  
  return true;
}

// Clear notification timer if it exists
export function clearNotificationTimer(type: string) {
  if (notificationTimers[type]) {
    clearTimeout(notificationTimers[type]);
    delete notificationTimers[type];
  }
}
