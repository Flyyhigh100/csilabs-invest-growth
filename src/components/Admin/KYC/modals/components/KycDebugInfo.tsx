
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

  const formatUrl = (url: string | null) => {
    if (!url) return 'No URL';
    if (url.length > 60) {
      return `${url.substring(0, 30)}...${url.substring(url.length - 30)}`;
    }
    return url;
  };

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
          
          {debugInfo.adminPermissionStatus && (
            <p><strong>Admin Permissions:</strong> {debugInfo.adminPermissionStatus}</p>
          )}
          
          {debugInfo.currentRetry !== null && typeof debugInfo.retryAttempts !== 'undefined' && (
            <p><strong>Retry:</strong> {debugInfo.currentRetry !== null ? `${debugInfo.currentRetry} of ${debugInfo.retryAttempts}` : 'No retries'}</p>
          )}
          
          <div className="mt-2">
            <p className="font-semibold">Document URLs:</p>
            <div className="mt-1 pl-2 border-l-2 border-gray-200">
              <p><strong>ID Front:</strong> {formatUrl(selectedKyc.id_front_url)}</p>
              <p><strong>ID Back:</strong> {formatUrl(selectedKyc.id_back_url)}</p>
              <p><strong>Selfie:</strong> {formatUrl(selectedKyc.selfie_url)}</p>
            </div>
          </div>
          
          {debugInfo.error && (
            <div className="mt-2 text-red-500">
              <strong>Error:</strong> {debugInfo.error}
            </div>
          )}
          
          {debugInfo.supabaseResponse && (
            <div className="mt-2">
              <strong>Response:</strong>
              <pre className="mt-1 p-1 bg-gray-100 rounded overflow-x-auto max-h-40">
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
