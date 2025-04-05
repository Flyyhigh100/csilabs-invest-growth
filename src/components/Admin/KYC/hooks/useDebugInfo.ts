
import { useState } from 'react';

/**
 * Hook to track debug information for KYC operations
 */
export const useDebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState<{
    lastActionType: string | null;
    lastActionTimestamp: string | null;
    supabaseTriggered: boolean;
    supabaseResponse: any | null;
    error: string | null;
    retryAttempts: number;
    currentRetry: number | null;
    adminPermissionStatus: 'verified' | 'failed' | 'checking' | null;
  }>({
    lastActionType: null,
    lastActionTimestamp: null,
    supabaseTriggered: false,
    supabaseResponse: null,
    error: null,
    retryAttempts: 0,
    currentRetry: null,
    adminPermissionStatus: null
  });

  const updateDebugInfo = (updates: Partial<typeof debugInfo>) => {
    setDebugInfo(prev => ({ ...prev, ...updates }));
  };

  const resetDebugInfo = () => {
    setDebugInfo({
      lastActionType: null,
      lastActionTimestamp: null,
      supabaseTriggered: false,
      supabaseResponse: null,
      error: null,
      retryAttempts: 0,
      currentRetry: null,
      adminPermissionStatus: null
    });
  };

  return {
    debugInfo,
    updateDebugInfo,
    resetDebugInfo
  };
};
