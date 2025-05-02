
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

interface DialogFooterActionsProps {
  onClose: () => void;
  onCheckStatus?: () => void;
  isChecking?: boolean;
  statusCheckUrl?: string;
  statusUrl?: string;
}

export const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({ 
  onClose,
  onCheckStatus,
  isChecking = false,
  statusCheckUrl,
  statusUrl
}) => {
  // Use either statusCheckUrl or statusUrl, whichever is provided
  const url = statusCheckUrl || statusUrl;
  
  return (
    <div className="flex justify-between w-full">
      <div className="flex gap-2">
        {onCheckStatus && (
          <Button 
            variant="outline" 
            onClick={onCheckStatus} 
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Payment Status'}
          </Button>
        )}
        
        {url && (
          <Button 
            variant="outline" 
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Status
          </Button>
        )}
      </div>
      
      <Button onClick={onClose}>
        Close
      </Button>
    </div>
  );
};

// Add this line to export as default as well
export default DialogFooterActions;
