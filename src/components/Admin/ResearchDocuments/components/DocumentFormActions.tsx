
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

interface DocumentFormActionsProps {
  isSaving: boolean;
  onCancel: () => void;
}

const DocumentFormActions: React.FC<DocumentFormActionsProps> = ({
  isSaving,
  onCancel,
}) => {
  return (
    <DialogFooter>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button 
        type="submit" 
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving
          </>
        ) : "Save Changes"}
      </Button>
    </DialogFooter>
  );
};

export default DocumentFormActions;
