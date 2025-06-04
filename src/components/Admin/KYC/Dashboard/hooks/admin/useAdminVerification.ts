
import { useStandardizedAdminVerification } from '@/hooks/admin/useStandardizedAdminVerification';
import { showSmartNotification } from '@/utils/notification/smartNotifications';
import { useEffect } from 'react';

/**
 * Hook for verifying admin access - now using standardized verification
 */
export const useAdminVerification = () => {
  const { isAdmin, isLoading, error, refreshAdminStatus } = useStandardizedAdminVerification();
  
  // Show notification when admin status is determined
  useEffect(() => {
    if (isLoading) return;
    
    // Prevent duplicate notifications per session
    const sessionKey = 'admin_notification_shown';
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    sessionStorage.setItem(sessionKey, 'true');

    if (error) {
      showSmartNotification(
        'Access Error',
        'Failed to verify admin permissions',
        { type: 'admin_access', priority: 'high', duration: 8000 }
      );
    } else if (isAdmin === false) {
      showSmartNotification(
        'Access Denied',
        'You do not have admin permissions to view KYC verifications',
        { type: 'admin_access', priority: 'high', duration: 8000 }
      );
    } else if (isAdmin === true) {
      showSmartNotification(
        'Admin Access',
        'Admin access verified - you can view all KYC submissions',
        { type: 'admin_access', priority: 'medium', duration: 5000 }
      );
    }
  }, [isAdmin, isLoading, error]);
  
  return { 
    isAdmin, 
    isLoading, 
    error,
    refreshAdminStatus 
  };
};
