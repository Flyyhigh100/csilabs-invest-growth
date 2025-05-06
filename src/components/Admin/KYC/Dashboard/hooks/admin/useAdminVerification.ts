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
      console.log('🔍 Checking admin access...');
      
      try {
        // Check localStorage first to see if we have a cached result
        const cachedAdminStatus = localStorage.getItem('admin_verified');
        const cachedTimestamp = localStorage.getItem('admin_verified_timestamp');
        
        // If we have a cached result that's less than 1 hour old, use it
        if (cachedAdminStatus && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp, 10);
          const now = Date.now();
          const hoursSinceVerified = (now - timestamp) / (1000 * 60 * 60);
          
          if (hoursSinceVerified < 1) {
            console.log(`🔄 Using cached admin status (verified ${hoursSinceVerified.toFixed(2)} hours ago): ${cachedAdminStatus}`);
            const isCachedAdmin = cachedAdminStatus === 'true';
            setIsAdmin(isCachedAdmin);
            
            // No need for custom page-load guard; the smart notification system already
            // throttles `admin_access` messages to once every 24 h. So we can simply rely on it.
            sendOneTimeNotification(isCachedAdmin ? 'granted' : 'denied');
            
            return;
          }
        }
        
        // Otherwise, check admin access via API
        console.log('🔄 Checking admin access via API...');
        const isAdminUser = await verifyAdminAccess();
        setIsAdmin(isAdminUser);
        
        // Cache the result
        localStorage.setItem('admin_verified', isAdminUser.toString());
        localStorage.setItem('admin_verified_timestamp', Date.now().toString());
        
        console.log(`✅ Admin status verified via API: ${isAdminUser}`);
        
        // Show notification based on status
        sendOneTimeNotification(isAdminUser ? 'granted' : 'denied');
      } catch (error) {
        console.error('❌ Error checking admin access:', error);
        setIsAdmin(false);
        
        sendOneTimeNotification('denied');
      }
    };
    
    checkAdminAccess();
  }, []);
  
  // Helper to ensure we only notify once per tab session to avoid
  // React Strict-Mode double-mount or multiple component instances.
  const sendOneTimeNotification = (type: 'granted' | 'denied') => {
    const sessionKey = 'admin_notification_shown';
    if (sessionStorage.getItem(sessionKey)) {
      return; // Already notified this session
    }
    sessionStorage.setItem(sessionKey, 'true');

    if (type === 'denied') {
      showSmartNotification(
        'Access Denied',
        'You do not have admin permissions to view KYC verifications',
        { type: 'admin_access', priority: 'high', duration: 8000 }
      );
    } else {
      showSmartNotification(
        'Admin Access',
        'Admin access verified - you can view all KYC submissions',
        { type: 'admin_access', priority: 'medium', duration: 5000 }
      );
    }
  };
  
  return { isAdmin };
};
