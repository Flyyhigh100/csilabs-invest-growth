
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmissionControlsProps {
  isButtonDisabled: boolean;
  isSubmitting: boolean;
  submissionStatus: 'idle' | 'submitting' | 'success' | 'error';
  onBack: () => void;
  onSubmit: () => void;
}

const SubmissionControls: React.FC<SubmissionControlsProps> = ({
  isButtonDisabled,
  isSubmitting,
  submissionStatus,
  onBack,
  onSubmit
}) => {
  return (
    <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
      <Button 
        type="button" 
        variant="outline"
        onClick={onBack}
        disabled={isSubmitting || submissionStatus === 'success'}
      >
        Back
      </Button>
      <Button 
        type="button"
        disabled={isButtonDisabled || submissionStatus === 'success'}
        onClick={onSubmit}
        className={`relative ${isSubmitting ? 'bg-blue-400' : submissionStatus === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
            Submitting...
          </>
        ) : submissionStatus === 'success' ? (
          "Submitted Successfully"
        ) : submissionStatus === 'error' ? (
          "Try Again"
        ) : (
          "Submit Verification"
        )}
      </Button>
    </div>
  );
};

export default SubmissionControls;
