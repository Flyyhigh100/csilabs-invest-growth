
import React from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ExternalLink } from 'lucide-react';

interface DialogFooterActionsProps {
  statusUrl?: string;
  onClose: () => void;
}

export const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({
  statusUrl,
  onClose
}) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-2">
      {statusUrl && (
        <Button 
          variant="outline" 
          onClick={() => window.open(statusUrl, '_blank')}
          className="w-full sm:w-auto flex items-center"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Check Payment Status
        </Button>
      )}
      <Button 
        onClick={onClose} 
        className="w-full sm:w-auto"
      >
        Close
      </Button>
    </DialogFooter>
  );
};
