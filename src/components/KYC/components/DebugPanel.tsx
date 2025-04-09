
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, ChevronDown, ChevronUp, Bug } from 'lucide-react';

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
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Format date to be more readable
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleTimeString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Toggle a debug section
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="inline-block w-5 h-5 mr-2">
            <Bug className="text-gray-500 h-5 w-5" />
          </span>
          <h3 className="text-lg font-medium">Debug Information</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center"
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
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
      
      {/* Advanced debug section */}
      {debugInfo && (
        <>
          <hr className="my-3 border-gray-200" />
          
          {/* Basic debug info */}
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
          
          {/* Submission debug info */}
          {debugInfo.submissionDebug && (
            <div className="mt-4">
              <div 
                className="flex justify-between items-center cursor-pointer p-2 bg-gray-100 rounded" 
                onClick={() => toggleSection('submission')}
              >
                <span className="font-medium text-sm">Submission Details</span>
                {expandedSection === 'submission' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSection === 'submission' && (
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(debugInfo.submissionDebug, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          
          {/* Errors section */}
          {debugInfo.error && (
            <div className="mt-4">
              <div 
                className="flex justify-between items-center cursor-pointer p-2 bg-red-100 rounded" 
                onClick={() => toggleSection('error')}
              >
                <span className="font-medium text-sm text-red-700">Error Details</span>
                {expandedSection === 'error' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSection === 'error' && (
                <div className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 font-mono overflow-x-auto">
                  <p className="font-bold">Error: {debugInfo.error}</p>
                  {debugInfo.stack && (
                    <pre className="mt-2 whitespace-pre-wrap">{debugInfo.stack}</pre>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Supabase Responses section */}
          {debugInfo.submissionDebug?.debugInfo?.supabaseResponses && (
            <div className="mt-4">
              <div 
                className="flex justify-between items-center cursor-pointer p-2 bg-blue-100 rounded" 
                onClick={() => toggleSection('supabase')}
              >
                <span className="font-medium text-sm text-blue-700">Supabase API Responses</span>
                {expandedSection === 'supabase' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {expandedSection === 'supabase' && (
                <div className="mt-2 p-3 bg-blue-50 rounded text-xs overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(debugInfo.submissionDebug.debugInfo.supabaseResponses, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DebugPanel;
