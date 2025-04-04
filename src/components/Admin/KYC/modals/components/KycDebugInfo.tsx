
import React from 'react';
import { KycVerificationWithProfile } from '../../types';

interface KycDebugInfoProps {
  selectedKyc: KycVerificationWithProfile;
  activeAction: string | null;
  isPending: boolean;
  debugInfo?: {
    lastActionType: string | null;
    lastActionTimestamp: string | null;
    supabaseTriggered: boolean;
    supabaseResponse: any | null;
    error: string | null;
    retryAttempts?: number;
    currentRetry?: number | null;
    adminPermissionStatus?: 'verified' | 'failed' | 'checking' | null;
  };
}

const KycDebugInfo: React.FC<KycDebugInfoProps> = () => {
  // Debug component is now empty - not displaying any debug info in production
  return null;
};

export default KycDebugInfo;
