// Debounce timers for different notification types
const notificationTimers: { [key: string]: number } = {};

// Notification cooldown periods (in ms) - significantly extended for admin notifications
export const NOTIFICATION_COOLDOWNS = {
  payment: 10000,    // 10s for payment notifications
  status: 5000,      // 5s for status updates
  info: 2000,        // 2s for general info
  admin_access: 86400000, // 24 hours for admin access notifications (full day)
  kyc_action: 30000,  // 30s for KYC approval/rejection actions
  kyc_error: 30000,   // 30s for KYC error messages
  kyc_update: 15000   // 15s for live update notifications
};

// Track notifications with message and type to prevent duplicates
const lastNotifications: { [key: string]: { message: string; timestamp: number; count: number; hash?: string } } = {};

// Maximum number of similar notifications allowed in a short period
const MAX_NOTIFICATIONS_THRESHOLD = 3;
const NOTIFICATION_RESET_THRESHOLD = 60000; // 60 seconds

// Generate a simple hash for message content
function hashMessage(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

/**
 * Determines if a notification should be shown based on throttling rules
 */
export function shouldShowNotification(type: string, message: string): boolean {
  const now = Date.now();
  const lastNotification = lastNotifications[type];
  const cooldown = NOTIFICATION_COOLDOWNS[type as keyof typeof NOTIFICATION_COOLDOWNS] || 3000;
  const messageHash = hashMessage(message);
  
  console.log(`📋 Checking notification throttle - Type: ${type}, Message: ${message.substring(0, 50)}...`);
  
  // Special case for admin access notifications - use localStorage to check if shown today
  if (type === 'admin_access') {
    const adminNotifiedKey = 'admin_access_notified';
    const notificationTimestampKey = 'admin_access_notified_timestamp';
    const wasNotified = localStorage.getItem(adminNotifiedKey);
    const notificationTimestamp = localStorage.getItem(notificationTimestampKey);
    const currentTime = Date.now();
    
    // If we've shown this today already, don't show it again
    if (wasNotified && notificationTimestamp) {
      const timestamp = parseInt(notificationTimestamp, 10);
      const hoursSinceLastShown = (currentTime - timestamp) / (1000 * 60 * 60);
      
      console.log(`⏱️ Hours since last admin access notification: ${hoursSinceLastShown.toFixed(2)}`);
      
      if (hoursSinceLastShown < 24) {
        console.log(`🔇 Suppressing admin notification: shown in last 24 hours`);
        return false;
      }
    }
    
    // Mark that we've shown an admin notification today
    localStorage.setItem(adminNotifiedKey, 'true');
    localStorage.setItem(notificationTimestampKey, currentTime.toString());
    console.log(`✅ Allowing admin access notification and updating timestamp`);
    return true;
  }
  
  // Special case for KYC error messages - strict cooldown
  if (type === 'kyc_error') {
    if (lastNotification && now - lastNotification.timestamp < cooldown) {
      console.log(`🔇 Suppressing KYC error notification: within cooldown period`);
      return false;
    }
  }
  
  // If we've never shown this type of notification, always show it
  if (!lastNotification) {
    console.log(`✅ First notification of type ${type} - allowing`);
    lastNotifications[type] = { 
      message, 
      timestamp: now, 
      count: 1,
      hash: messageHash 
    };
    return true;
  }
  
  // Check if the exact same message (by hash) was shown recently
  if (lastNotification.hash === messageHash) {
    // If it's been shown too many times in a short period, don't show it again
    if (lastNotification.count >= MAX_NOTIFICATIONS_THRESHOLD && 
        now - lastNotification.timestamp < NOTIFICATION_RESET_THRESHOLD) {
      console.log(`🔇 Suppressing notification: shown ${lastNotification.count} times already`);
      return false;
    }
    
    // If it's within the cooldown period, don't show it again
    if (now - lastNotification.timestamp < cooldown) {
      console.log(`🔇 Throttling notification: within cooldown period (${(now - lastNotification.timestamp) / 1000}s elapsed, cooldown: ${cooldown / 1000}s)`);
      return false;
    }
  }
  
  // Update notification data
  if (lastNotification.hash === messageHash && now - lastNotification.timestamp < NOTIFICATION_RESET_THRESHOLD) {
    lastNotifications[type] = { 
      message, 
      timestamp: now, 
      count: lastNotification.count + 1,
      hash: messageHash 
    };
  } else {
    lastNotifications[type] = { 
      message, 
      timestamp: now, 
      count: 1,
      hash: messageHash 
    };
  }
  
  console.log(`✅ Showing notification of type ${type} - passed all throttle checks`);
  return true;
}

// Clear notification timer if it exists
export function clearNotificationTimer(type: string) {
  if (notificationTimers[type]) {
    clearTimeout(notificationTimers[type]);
    delete notificationTimers[type];
  }
}
