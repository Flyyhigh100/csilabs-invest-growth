
import { useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Hook to handle manual KYC status refresh
 */
export const useStatusRefresh = (
  userId: string | undefined, 
  refetch: () => Promise<any>, 
  updateDebugInfo: (
    updates: Partial<{ 
      lastAttempt: string; 
      currentStatus: string | null | undefined 
    }>
  ) => void,
  kycStatus: string | null | undefined
) => {
  const handleManualStatusRefresh = useCallback(async () => {
    if (!userId) {
      toast.error("Authentication required");
      return false;
    }
    
    try {
      toast.info("Manually refreshing KYC status...");
      console.log("🔄 Manual refresh initiated by user");
      
      // Force multiple refreshes to ensure we get the latest data
      await refetch();
      console.log("✅ KYC data refreshed");
      
      // Update debug info
      updateDebugInfo({
        lastAttempt: new Date().toISOString(),
        currentStatus: kycStatus
      });
      
      toast.success("KYC status refreshed");
      return true;
    } catch (error) {
      console.error("❌ Error refreshing KYC status:", error);
      
      // Update debug info with error
      updateDebugInfo({
        lastAttempt: new Date().toISOString()
      });
      
      toast.error("Failed to refresh status");
      return false;
    }
  }, [userId, refetch, updateDebugInfo, kycStatus]);

  return handleManualStatusRefresh;
};
