
import React from 'react';
import { DebugInfo } from '@/pages/Dashboard/KYCVerification/hooks';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DebugPanelProps {
  debugInfo: DebugInfo;
  isSubmitting: boolean;
  liveStatus?: string | null;
  lastRefresh?: string | null;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  debugInfo, 
  isSubmitting, 
  liveStatus, 
  lastRefresh, 
  onRefresh, 
  isRefreshing 
}) => {
  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') return null;
  if (!debugInfo) return null;
  
  return (
    <div className="mt-6 p-4 border border-gray-200 bg-gray-50 rounded-lg text-xs font-mono overflow-auto max-h-96">
      <h4 className="font-bold mb-2 text-sm">Debug Information</h4>
      
      <div className="grid gap-2">
        <div>
          <span className="font-bold">Current Status:</span>{' '}
          <span className="bg-blue-100 px-1 rounded">{debugInfo.currentStatus || 'not_started'}</span>
          {liveStatus && liveStatus !== debugInfo.currentStatus && (
            <span className="ml-2 text-orange-500">(Live: {liveStatus})</span>
          )}
        </div>
        
        {lastRefresh && (
          <div>
            <span className="font-bold">Last Status Check:</span>{' '}
            {new Date(lastRefresh).toLocaleString()}
          </div>
        )}
        
        {debugInfo.lastAttempt && (
          <div>
            <span className="font-bold">Last Attempt:</span>{' '}
            {new Date(debugInfo.lastAttempt).toLocaleString()}
          </div>
        )}
        
        {debugInfo.attempts !== undefined && (
          <div>
            <span className="font-bold">Submission Attempts:</span> {debugInfo.attempts}
          </div>
        )}
        
        {onRefresh && (
          <div className="mt-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-7 text-xs flex items-center gap-1"
            >
              <RefreshCcw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
            </Button>
          </div>
        )}
        
        {isSubmitting && (
          <div className="text-blue-600 font-bold animate-pulse">
            Operation in progress...
          </div>
        )}
        
        {/* Last Error Section */}
        {debugInfo.lastError && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <h5 className="font-bold text-red-600">Last Error:</h5>
            {debugInfo.lastError.code && (
              <div><span className="font-bold">Code:</span> {debugInfo.lastError.code}</div>
            )}
            {debugInfo.lastError.message && (
              <div><span className="font-bold">Message:</span> {debugInfo.lastError.message}</div>
            )}
            {debugInfo.lastError.hint && (
              <div><span className="font-bold">Hint:</span> {debugInfo.lastError.hint}</div>
            )}
            {debugInfo.lastError.details && (
              <div><span className="font-bold">Details:</span> {debugInfo.lastError.details}</div>
            )}
          </div>
        )}
        
        {/* Submission Debug Data */}
        {debugInfo.submissionDebug && (
          <div className="mt-2">
            <h5 className="font-bold">Submission Result:</h5>
            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              <pre>{JSON.stringify(debugInfo.submissionDebug, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {/* API Response Section */}
        {debugInfo.apiResponses && debugInfo.apiResponses.length > 0 && (
          <div className="mt-2">
            <h5 className="font-bold">Last API Response:</h5>
            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              <pre>{JSON.stringify(debugInfo.apiResponses[debugInfo.apiResponses.length - 1], null, 2)}</pre>
            </div>
          </div>
        )}
        
        {/* Errors Section */}
        {debugInfo.errors && debugInfo.errors.length > 0 && (
          <div className="mt-2">
            <h5 className="font-bold">Recent Errors:</h5>
            <div className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
              <pre>{JSON.stringify(debugInfo.errors.slice(-3), null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;
