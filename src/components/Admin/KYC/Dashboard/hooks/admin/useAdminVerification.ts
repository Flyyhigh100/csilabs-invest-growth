
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { verifyAdminAccess } from '../../../KycVerificationsService';

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
      if (!isAdminUser) {
        toast.error('You do not have admin permissions to view KYC verifications');
      } else {
        toast.success('Admin access verified - you can view all KYC submissions');
      }
    };
    
    checkAdminAccess();
  }, []);
  
  return { isAdmin };
};
