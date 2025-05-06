
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { showSmartNotification } from '@/utils/notification/smartNotifications';

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
      showSmartNotification(
        'Info', 
        'Already processing your request, please wait',
        { type: 'kyc_action', priority: 'medium' }
      );
      return;
    }
    
    console.log('Triggering KYC approval');
    onApprove();
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
