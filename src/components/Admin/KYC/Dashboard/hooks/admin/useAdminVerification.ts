
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
      
      // Only show the toast if this is the first check in the session
      const adminNotifiedKey = 'admin_access_notified';
      const wasNotified = sessionStorage.getItem(adminNotifiedKey);
      
      if (!wasNotified) {
        if (!isAdminUser) {
          showSmartNotification(
            'Access Denied', 
            'You do not have admin permissions to view KYC verifications',
            { type: 'admin_access', priority: 'high' }
          );
        } else {
          showSmartNotification(
            'Admin Access', 
            'Admin access verified - you can view all KYC submissions',
            { type: 'admin_access', priority: 'medium' }
          );
        }
        
        // Mark as notified for this session
        sessionStorage.setItem(adminNotifiedKey, 'true');
      }
    };
    
    checkAdminAccess();
  }, []);
  
  return { isAdmin };
};
