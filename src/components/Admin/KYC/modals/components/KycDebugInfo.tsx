
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

const KycDebugInfo: React.FC<KycDebugInfoProps> = ({
  selectedKyc,
  activeAction,
  isPending,
  debugInfo
}) => {
  // Only show debug info in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="my-4 p-3 bg-gray-50 border border-gray-200 rounded-md text-xs font-mono">
      <details>
        <summary className="font-semibold cursor-pointer">Debug Info</summary>
        <div className="mt-2 space-y-1">
          <div>KYC ID: {selectedKyc.id}</div>
          <div>Active Action: {activeAction || 'none'}</div>
          <div>Pending: {isPending ? 'yes' : 'no'}</div>
          
          {debugInfo && (
            <>
              <div>Last Action: {debugInfo.lastActionType || 'none'}</div>
              <div>Timestamp: {debugInfo.lastActionTimestamp || 'none'}</div>
              <div>Admin Status: {debugInfo.adminPermissionStatus || 'unknown'}</div>
              <div>Supabase Triggered: {debugInfo.supabaseTriggered ? 'yes' : 'no'}</div>
              <div>Error: {debugInfo.error || 'none'}</div>
              <div>Retry: {debugInfo.currentRetry !== null ? `${debugInfo.currentRetry}/${debugInfo.retryAttempts}` : 'n/a'}</div>
              
              {debugInfo.supabaseResponse && (
                <div>
                  <div>Response:</div>
                  <pre className="bg-gray-100 p-1 mt-1 overflow-auto max-h-20">
                    {JSON.stringify(debugInfo.supabaseResponse, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </details>
    </div>
  );
};

export default KycDebugInfo;
