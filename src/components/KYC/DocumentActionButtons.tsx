
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DocumentActionButtonsProps {
  isSubmitting: boolean;
  isButtonDisabled: boolean;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

const DocumentActionButtons: React.FC<DocumentActionButtonsProps> = ({
  isSubmitting,
  isButtonDisabled,
  onBack,
  onSubmit,
}) => {
  return (
    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
      <Button 
        type="button" 
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting}
      >
        Back
      </Button>
      <Button 
        type="button"
        disabled={isButtonDisabled}
        onClick={onSubmit}
        className="relative"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Verification"
        )}
      </Button>
    </div>
  );
};

export default DocumentActionButtons;
