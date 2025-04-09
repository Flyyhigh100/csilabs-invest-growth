
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface DebugPanelProps {
  liveStatus: string | null;
  lastRefresh: string | null;
  isPending: boolean;
  isSubmitting: boolean;
  isRefreshing?: boolean;
  onRefresh: () => void;
  debugInfo?: any;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  liveStatus,
  lastRefresh,
  isPending,
  isSubmitting,
  isRefreshing,
  onRefresh,
  debugInfo
}) => {
  // Format date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="flex items-center mb-2">
        <span className="inline-block w-5 h-5 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 18v.01" />
            <path d="M12 6v8" />
          </svg>
        </span>
        <h3 className="text-lg font-medium">Debug Information</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Live Status:</p>
          <p className="font-medium">{liveStatus || 'not_started'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Last Refreshed:</p>
          <p className="font-medium">{formatDate(lastRefresh)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Is Pending:</p>
          <p className="font-medium">{isPending ? 'true' : 'false'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Is Submitting:</p>
          <p className="font-medium">{isSubmitting ? 'true' : 'false'}</p>
        </div>
      </div>
      
      {debugInfo && (
        <>
          <hr className="my-3 border-gray-200" />
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Additional Debug Info:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Attempts:</p>
                <p className="font-medium">{debugInfo.attempts || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Attempt:</p>
                <p className="font-medium">{formatDate(debugInfo.lastAttempt)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Debug Status:</p>
                <p className="font-medium">{debugInfo.currentStatus || 'N/A'}</p>
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </div>
    </div>
  );
};

export default DebugPanel;
