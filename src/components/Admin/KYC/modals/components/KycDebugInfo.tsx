
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
  if (!debugInfo) return null;

  return (
    <details className="text-xs">
      <summary className="cursor-pointer font-semibold text-gray-600">Debug Information</summary>
      <div className="mt-2 p-2 bg-gray-50 rounded">
        <h4 className="font-semibold">KYC ID: {selectedKyc.id}</h4>
        <div className="mt-1">
          <p><strong>Current Status:</strong> {selectedKyc.status}</p>
          <p><strong>Active Action:</strong> {activeAction || 'None'}</p>
          <p><strong>Is Pending:</strong> {isPending ? 'Yes' : 'No'}</p>
          <p><strong>Last Action:</strong> {debugInfo.lastActionType || 'None'}</p>
          <p><strong>Timestamp:</strong> {debugInfo.lastActionTimestamp || 'None'}</p>
          <p><strong>Supabase Triggered:</strong> {debugInfo.supabaseTriggered ? 'Yes' : 'No'}</p>
          
          {debugInfo.currentRetry !== null && (
            <p><strong>Retry:</strong> {debugInfo.currentRetry} of {debugInfo.retryAttempts}</p>
          )}
          
          {debugInfo.adminPermissionStatus && (
            <p><strong>Admin Permissions:</strong> {debugInfo.adminPermissionStatus}</p>
          )}
          
          {debugInfo.error && (
            <div className="mt-2 text-red-500">
              <strong>Error:</strong> {debugInfo.error}
            </div>
          )}
          
          {debugInfo.supabaseResponse && (
            <div className="mt-2">
              <strong>Response:</strong>
              <pre className="mt-1 p-1 bg-gray-100 rounded overflow-x-auto">
                {JSON.stringify(debugInfo.supabaseResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </details>
  );
};

export default KycDebugInfo;
