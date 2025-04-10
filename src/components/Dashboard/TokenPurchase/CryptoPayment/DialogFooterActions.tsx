
import React from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DialogFooterActionsProps {
  onClose: () => void;
  onCheckStatus?: () => void;
  isChecking?: boolean;
}

export const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({ 
  onClose,
  onCheckStatus,
  isChecking = false
}) => {
  return (
    <div className="flex justify-between w-full">
      <div>
        {onCheckStatus && (
          <Button 
            variant="outline" 
            onClick={onCheckStatus} 
            disabled={isChecking}
            className="mr-2"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Payment Status'}
          </Button>
        )}
      </div>
      <Button onClick={onClose}>
        Close
      </Button>
    </div>
  );
};
