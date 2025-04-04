
import React from 'react';
import { BugPlay } from 'lucide-react';
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
  // Format the timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  // Helper function to format the status for display
  const formatStatus = (status: string | null): string => {
    if (!status) return 'None';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-mono">
      <div className="flex items-start gap-1">
        <BugPlay className="h-3 w-3 mt-0.5 text-slate-500" />
        <div>
          <p className="font-semibold">Debug Info:</p>
          <p>KYC ID: {selectedKyc.id}</p>
          <p>Current Status: {formatStatus(selectedKyc.status)}</p>
          <p>Is Processing: {isPending ? 'Yes' : 'No'}</p>
          <p>Selected Action: {activeAction || 'None'}</p>
          
          {/* Enhanced debug information */}
          {debugInfo && (
            <>
              <hr className="my-1 border-slate-200" />
              <p className="font-semibold mt-1">Last Workflow:</p>
              <p>Action Type: {formatStatus(debugInfo.lastActionType)}</p>
              <p>Timestamp: {formatTimestamp(debugInfo.lastActionTimestamp)}</p>
              <p>Supabase Triggered: {debugInfo.supabaseTriggered ? 'Yes' : 'No'}</p>
              
              {/* Admin permission status */}
              {debugInfo.adminPermissionStatus && (
                <p className={`${
                  debugInfo.adminPermissionStatus === 'verified' 
                    ? 'text-green-600' 
                    : debugInfo.adminPermissionStatus === 'failed'
                    ? 'text-red-600'
                    : 'text-amber-600'
                }`}>
                  Admin Permission: {debugInfo.adminPermissionStatus === 'checking' 
                    ? 'Checking...' 
                    : debugInfo.adminPermissionStatus}
                </p>
              )}
              
              {/* Retry information */}
              {debugInfo.retryAttempts !== undefined && debugInfo.retryAttempts > 0 && (
                <p>
                  Retry Status: {debugInfo.currentRetry !== null 
                    ? `Attempt ${debugInfo.currentRetry} of ${debugInfo.retryAttempts}` 
                    : `Complete (${debugInfo.retryAttempts} max attempts)`}
                </p>
              )}
              
              <p>Supabase Response: {debugInfo.supabaseResponse ? 
                `Success: ${debugInfo.supabaseResponse.success}, Status: ${debugInfo.supabaseResponse.status || 'N/A'}` : 
                'No response'}</p>
              {debugInfo.error && <p className="text-red-500">Error: {debugInfo.error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KycDebugInfo;
