
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface KycApproveFormProps {
  onApprove: () => void;
  isPending: boolean;
}

const KycApproveForm: React.FC<KycApproveFormProps> = ({
  onApprove,
  isPending
}) => {
  const handleApproveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isPending) {
      toast.info('Already processing your request, please wait');
      return;
    }
    
    // Clear any previous toast with this ID
    toast.dismiss('approve-processing-toast');
    
    // Show a new processing toast with a timeout
    toast.loading('Processing approval request...', { 
      id: 'approve-processing-toast',
      duration: 10000 // 10 second timeout
    });
    
    console.log('Triggering KYC approval');
    onApprove();
    
    // Set a timeout to dismiss the infinite loading state if it takes too long
    const timeoutId = setTimeout(() => {
      if (isPending) {
        toast.dismiss('approve-processing-toast');
        toast.error('Approval request is taking longer than expected. Please try again.');
      }
    }, 15000); // 15 seconds timeout
    
    // Clear timeout when component unmounts
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="mb-4 border-t pt-4">
      <div className="flex items-start gap-2 mb-2">
        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
        <h4 className="font-medium text-green-800">Approve Verification</h4>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to approve this KYC verification? This action will grant the user full platform access.
      </p>
      <div className="flex justify-end mt-3">
        <Button 
          variant="default"
          onClick={handleApproveClick}
          disabled={isPending}
          type="button"
          className="bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Approval"
          )}
        </Button>
      </div>
    </div>
  );
};

export default KycApproveForm;
