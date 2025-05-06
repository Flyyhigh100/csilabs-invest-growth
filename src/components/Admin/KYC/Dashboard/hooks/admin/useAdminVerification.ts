
import { useState, useEffect } from 'react';
import { verifyAdminAccess } from '../../../KycVerificationsService';
import { showSmartNotification } from '@/utils/notification/smartNotifications';

/**
 * Hook for verifying admin access
 */
export const useAdminVerification = () => {
  // Admin access state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Check admin access on component mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      const isAdminUser = await verifyAdminAccess();
      setIsAdmin(isAdminUser);
      
      // Use localStorage instead of sessionStorage for longer persistence (24 hours)
      const adminNotifiedKey = 'admin_access_notified';
      const notificationTimestampKey = 'admin_access_notified_timestamp';
      const wasNotified = localStorage.getItem(adminNotifiedKey);
      const notificationTimestamp = localStorage.getItem(notificationTimestampKey);
      const currentTime = Date.now();
      
      // Only show notification if:
      // 1. User has never been notified before, OR
      // 2. It's been more than 24 hours since last notification
      const shouldNotify = !wasNotified || 
        (notificationTimestamp && (currentTime - parseInt(notificationTimestamp, 10) > 86400000)); // 24 hours
      
      if (shouldNotify) {
        if (!isAdminUser) {
          showSmartNotification(
            'Access Denied', 
            'You do not have admin permissions to view KYC verifications',
            { type: 'admin_access', priority: 'high', duration: 8000 }
          );
        } else {
          // Only show success notification once per 24 hours
          showSmartNotification(
            'Admin Access', 
            'Admin access verified - you can view all KYC submissions',
            { type: 'admin_access', priority: 'medium', duration: 5000 }
          );
        }
        
        // Mark as notified with timestamp
        localStorage.setItem(adminNotifiedKey, 'true');
        localStorage.setItem(notificationTimestampKey, currentTime.toString());
      }
    };
    
    checkAdminAccess();
  }, []);
  
  return { isAdmin };
};
