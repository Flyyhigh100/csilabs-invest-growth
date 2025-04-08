
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface DialogFooterActionsProps {
  onClose: () => void;
  checkStatusUrl?: string;
}

const DialogFooterActions: React.FC<DialogFooterActionsProps> = ({ onClose, checkStatusUrl }) => {
  return (
    <DialogFooter className="flex flex-col sm:flex-row gap-3">
      <Button 
        variant="outline" 
        onClick={onClose}
        className="sm:order-1"
      >
        Close
      </Button>
      
      {checkStatusUrl && (
        <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal text-white">
          <a 
            href={checkStatusUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            Check Payment Status
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      )}
    </DialogFooter>
  );
};

export default DialogFooterActions;
