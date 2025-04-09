
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertCircle } from 'lucide-react';

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
        variant={submissionStatus === 'success' ? "default" : submissionStatus === 'error' ? "destructive" : "default"}
        className={`relative flex items-center justify-center transition-all duration-300 ${
          submissionStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 
          submissionStatus === 'error' ? 'bg-red-600 hover:bg-red-700' : 
          isSubmitting ? 'bg-blue-400 hover:bg-blue-500' : 
          'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
            Submitting...
          </>
        ) : submissionStatus === 'success' ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Submitted Successfully
          </>
        ) : submissionStatus === 'error' ? (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Try Again
          </>
        ) : (
          "Submit Verification"
        )}
      </Button>
    </div>
  );
};

export default SubmissionControls;
