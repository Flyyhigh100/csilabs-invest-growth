
import React from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DebugPanelProps {
  liveStatus: string | null;
  lastRefresh: string | null;
  isPending: boolean;
  isSubmitting: boolean;
  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
  isAttemptingSubmit: boolean;
  debugInfo?: any;
  onRefresh: () => Promise<void>;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  liveStatus,
  lastRefresh,
  isPending,
  isSubmitting,
  submissionStatus,
  isAttemptingSubmit,
  debugInfo,
  onRefresh
}) => {
  return (
    <div className="bg-gray-100 border border-gray-300 rounded-md p-4 mb-4">
      <div className="flex items-center mb-2">
        <Bug className="h-5 w-5 text-gray-700 mr-2" />
        <h4 className="font-medium text-gray-800">Debug Information</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
        <div><strong>Live Status:</strong> {liveStatus || 'unknown'}</div>
        <div><strong>Last Refreshed:</strong> {lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : 'never'}</div>
        <div><strong>Is Pending:</strong> {isPending ? 'true' : 'false'}</div>
        <div><strong>Is Submitting:</strong> {isSubmitting ? 'true' : 'false'}</div>
        <div><strong>Local Status:</strong> {submissionStatus}</div>
        <div><strong>Attempting Submit:</strong> {isAttemptingSubmit ? 'true' : 'false'}</div>
        {debugInfo && (
          <>
            <div className="col-span-1 sm:col-span-2 pt-2 border-t border-gray-300">
              <strong>Additional Debug Info:</strong>
            </div>
            <div><strong>Attempts:</strong> {debugInfo.attempts || 0}</div>
            <div><strong>Last Attempt:</strong> {debugInfo.lastAttempt ? new Date(debugInfo.lastAttempt).toLocaleTimeString() : 'none'}</div>
            <div className="col-span-1 sm:col-span-2">
              <strong>Debug Status:</strong> {debugInfo.currentStatus || 'none'}
            </div>
          </>
        )}
      </div>
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="mt-3"
        onClick={onRefresh}
      >
        Refresh Status
      </Button>
    </div>
  );
};

export default DebugPanel;
